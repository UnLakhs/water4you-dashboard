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
    const usersCollection = db.collection("users");``

    // Find user in database
    const existingUser = await usersCollection.findOne({ username: username.trim() });

    // Check if user exists before proceeding
    if (!existingUser) {
      return NextResponse.json({ error: "Username does not exist" }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
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
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 14400, // 4 hours
      path: "/",
    });

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
