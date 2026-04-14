import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  pgTable,
  text,
  numeric,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  serial,
  primaryKey,
} from "drizzle-orm/pg-core";
import { or, eq, ilike, relations, gte, and, desc } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

// Use standard node-postgres for testing instead of Neon serverless
const pool = new Pool({
  connectionString:
    process.env.POSTGRES_URL || "postgresql://localhost:5432/dmart_test",
});

export const db = drizzle(pool);

export const statusEnum = pgEnum("status", ["active", "inactive", "archived"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  pw: text("pw").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type SelectUser = typeof users.$inferSelect;
export type SelectSession = typeof session.$inferSelect;

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  image_url: text("image_url"),
  midsize_image_url: text("midsize_image_url"),
  thumbnail_image_url: text("thumbnail_image_url"),
  filename: text("filename"),
  title: text("title").notNull(),
  media: text("media").notNull(),
  category_name: text("category_name"),
  price: numeric("price", { precision: 10, scale: 2 }),
  width: numeric("width", { precision: 10, scale: 2 }),
  height: numeric("height", { precision: 10, scale: 2 }),
  year: integer("year"),
  is_sold: boolean("is_sold"),
  is_active: boolean("is_active"),
  mongo_id: varchar("mongo_id", { length: 30 }),
  owner: varchar("owner", { length: 100 }),
});

export const artworksRelations = relations(artworks, ({ many }) => ({
  artworksToTags: many(artworksToTags),
}));

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  artworksToTags: many(artworksToTags),
}));

export const artworksToTags = pgTable(
  "artwork_tag_join",
  {
    artworkId: integer("artwork_id")
      .notNull()
      .references(() => artworks.id),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.artworkId, t.tagId] }),
  }),
);

export const artworksToTagsRelations = relations(artworksToTags, ({ one }) => ({
  tag: one(tags, {
    fields: [artworksToTags.tagId],
    references: [tags.id],
  }),
  artwork: one(artworks, {
    fields: [artworksToTags.artworkId],
    references: [artworks.id],
  }),
}));

export type SelectArtwork = typeof artworks.$inferSelect;

export const SESSION_LENGTH_DAYS = 7;

export async function createSession(
  token: string,
  userId: number,
): Promise<SelectSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sess: SelectSession = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * SESSION_LENGTH_DAYS),
  };
  await db.insert(session).values(sess);
  return sess;
}

export const insertArtworksSchema = createInsertSchema(artworks);

export async function updateArtwork(id: number, data: Partial<SelectArtwork>) {
  await db.update(artworks).set(data).where(eq(artworks.id, id));
}

export async function createTag(name: string): Promise<number> {
  const tagIds = await db
    .insert(tags)
    .values({ name })
    .returning({ insertedId: tags.id });
  const tagId = tagIds[0].insertedId;
  return tagId;
}

export async function deleteArtworkTags(id: number) {
  await db.delete(artworksToTags).where(eq(artworksToTags.artworkId, id));
}

export async function updateArtworkTags(artId: number, tags: string[]) {
  const { getTagByName } = await import("./getArtworks");
  await deleteArtworkTags(artId);
  const artworkTags = [];
  for (const name of tags) {
    const existing = await getTagByName(name);
    if (existing) {
      artworkTags.push({ artworkId: artId, tagId: existing.id });
    } else {
      const id = await createTag(name);
      artworkTags.push({ artworkId: artId, tagId: id });
    }
  }
  if (artworkTags.length > 0) {
    await db.insert(artworksToTags).values(artworkTags);
  }
}

export async function deleteTagJoinsForArtwork(artworkId: number) {
  await db
    .delete(artworksToTags)
    .where(eq(artworksToTags.artworkId, artworkId));
}

export async function deleteArtworkById(id: number) {
  await db.delete(artworks).where(eq(artworks.id, id));
}

export async function getUserHash(id: number): Promise<string> {
  const rows = await db
    .select({ pw: users.pw })
    .from(users)
    .where(eq(users.id, id));
  return rows[0].pw;
}

// Mock session getter for tests
export async function getSession(): Promise<SelectSession | null> {
  return null;
}
