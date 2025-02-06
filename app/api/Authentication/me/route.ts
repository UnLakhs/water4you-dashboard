import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import clientPromise from "@/app/lib/mongoDB";
import { ObjectId } from "mongodb"; // Import ObjectId

/**
 * @description Retrieves user information based on a JWT token stored in a cookie.
 * @returns {NextResponse} - A JSON response containing user details or an error.
 */

export async function GET() {
    /**
   * @description Accesses the cookie store and retrieves the JWT token.
   */
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
     /**
     * @description Retrieves the JWT secret from environment variables.
     */
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is missing");

    /**
     * @description Verifies the JWT token using the secret.
     * Explicitly casts the decoded token to JwtPayload to avoid TypeScript errors.
     */
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

     /**
     * @description Checks if the decoded token contains the required 'id' property.
     * If not, returns an error indicating an invalid token payload.
     */
    if (!decoded.id) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

     /**
     * @description Connects to the MongoDB database.
     */
    const client = await clientPromise;
    const db = client.db("Water4You");
    
     /**
     * @description Queries the 'users' collection for a user with the ID from the decoded token.
     * Uses ObjectId to correctly query MongoDB by _id field.
     */
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.id as string)
    });

     /**
     * @description Checks if a user was found. If not, returns a "User not found" error.
     */
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

      /**
     * @description Returns the user's ID, username, and role.
     * The role is determined based on the 'role' property in the user document.
     */
    return NextResponse.json({
      id: user._id,
      username: user.username,
      role: user.role ? "admin" : "staff",
    });
  } catch (error) {
       /**
     * @description Handles errors during token verification.
     * Returns an "Invalid token" error.
     */
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
