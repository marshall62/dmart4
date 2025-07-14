// import NextAuth from 'next-auth';
// import GitHub from 'next-auth/providers/github';

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [GitHub]
// });

// The above might have been easier than pulling in the below


import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { db, SelectSession, SelectUser, session, SESSION_LENGTH_DAYS, users } from "./db";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { cookies } from "next/headers";

export type SessionValidationResult =
	| { session: SelectSession; user: SelectUser }
	| { session: null; user: null };

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db
		.select({ user: users, sess: session })
		.from(session)
		.innerJoin(users, eq(session.userId, users.id))
		.where(eq(session.id, sessionId));
	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { user, sess } = result[0];
	if (Date.now() >= sess.expiresAt.getTime()) {
		await db.delete(session).where(eq(session.id, sess.id));
		return { session: null, user: null };
	}
	if (Date.now() >= sess.expiresAt.getTime() - 1000 * 60 * 60 * 24 * SESSION_LENGTH_DAYS/2) {
		sess.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * SESSION_LENGTH_DAYS);
		await db
			.update(session)
			.set({
				expiresAt: sess.expiresAt
			})
			.where(eq(session.id, sess.id));
	}
  console.log("session is valid", sess);
	return { session:sess, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(session).where(eq(session.id, sessionId));
}

export async function invalidateAllSessions(userId: number): Promise<void> {
	await db.delete(session).where(eq(session.userId, userId));
}


export async function checkCookieHeader(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) {
    return false;
  }

  const { session, user } = await validateSessionToken(token);
  if (session === null) {
    return false;
  }
  return true;
}
