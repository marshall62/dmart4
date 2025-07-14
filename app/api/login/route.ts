import { generateSessionToken } from "@/lib/auth";
import { createSession, getUserHash } from "@/lib/db";
import bcrypt from 'bcrypt';

function setSessionTokenCookie  (token: string) {
    const cookie = `session_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`;
    // Set the cookie in the response headers
    // Return a response with both the cookie in the header and a JSON body
    return new Response(
        JSON.stringify({
        message: 'Login successful',
        token: token, // Include the token in the JSON response
        }),
        {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie, // Set the cookie in the response header
        },
        }
    );
}

export async function POST(req: Request) {
    const data =  await req.json()
    const username:string = data.username;
    const password:string = data.password;
    const h = await getUserHash(1);
    const match = await verifyPassword(password, h)
      // Replace with your actual authentication logic (e.g., database check)
      if (match) {
        const sessTok = generateSessionToken();
        const sess = await createSession(sessTok, 1)
        return setSessionTokenCookie(sessTok)

      } 
      else {
        // Invalid credentials
        return Response.json({
            message: 'Login successful',
            token: 'your-generated-token',
          });
      }
    } 

async function verifyPassword(inputPassword:string, hashedPassword:string) {
    try {
      const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
      
      console.log("Password is valid:", isMatch);
      return isMatch; // Returns true if passwords match, false otherwise
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return false;
    }
  }
  