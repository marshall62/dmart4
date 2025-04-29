import { getUserHash } from "@/lib/db";
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
    const data =  await req.json()
    const username:string = data.username;
    const password:string = data.password;
    const h = await getUserHash(1);
    const match = await verifyPassword(password, h)
      // Replace with your actual authentication logic (e.g., database check)
      if (match) {
        // Successful login
        return Response.json({
            message: 'Login successful',
            token: 'your-generated-token',
          });
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
  