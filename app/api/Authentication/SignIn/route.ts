import clientPromise from "@/app/lib/mongoDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  try {
    const client = await clientPromise;
    const db = client.db("Water4You");
    const user = db.collection("users");

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingUser = await user.findOne({ username: username.trim() });
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser?.password
    );

    if (!existingUser) {
      return NextResponse.json(
        { error: "Username does not exist" },
        { status: 401 }
      );
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not defined");

    const token = jwt.sign(
      {
        id: existingUser._id,
        username: existingUser.username,
        isAdmin: existingUser.isAdmin,
      },
      jwtSecret,
      { expiresIn: "4h" }
    );
    const response = NextResponse.json({ success: true });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
