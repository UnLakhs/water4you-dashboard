import clientPromise from "@/app/lib/mongoDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  try {
    const client = await clientPromise;
    const db = client.db("Water4You");
    const usersCollection = db.collection("users");

    // Find user in database
    const existingUser = await usersCollection.findOne({
      username: username.trim(),
    });

    // Check if user exists before proceeding
    if (!existingUser) {
      return NextResponse.json(
        { error: "Username does not exist" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Ensure JWT secret exists
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not defined");

    // Generate JWT token
    const token = jwt.sign(
      {
        id: existingUser._id,
        username: existingUser.username,
        isAdmin: existingUser.isAdmin,
      },
      jwtSecret,
      { expiresIn: "4h" }
    );

    // Set cookie using serialize
    /**
     * @description Serializes the token and sets it as a cookie.
     * @param {string} token - The JWT token to be stored in the cookie.
     * @returns {string} - The serialized cookie string.
     */
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 14400, // 4 hours
      path: "/",
    });

    /**
     * @description Explanation of the cookie options:
     * - httpOnly:  This flag is crucial for security.  It prevents client-side JavaScript from accessing the cookie.  This helps mitigate Cross-Site Scripting (XSS) attacks.
     * - secure:  This flag ensures that the cookie is only sent over HTTPS.  It's essential for protecting the cookie from being intercepted over insecure connections.  We set it conditionally based on the environment (true in production, false in development for testing).
     * - sameSite:  This attribute controls when the browser sends the cookie along with requests that originate from a different site.  "lax" is a good balance between security and usability.  It allows the cookie to be sent with top-level navigations (e.g., clicking a link from another site) but prevents it from being sent with cross-site requests initiated by JavaScript (which helps prevent CSRF attacks).  Other options are "strict" (most secure, but can break some user flows) and "none" (least secure, generally avoid).
     * - maxAge:  This sets the cookie's expiration time in seconds.  14400 seconds is equal to 4 hours.
     * - path:  This specifies the path for which the cookie is valid.  Setting it to "/" makes the cookie available for all paths within the application.
     */

    // Send response with cookie
    const response = NextResponse.json({ success: true });
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
