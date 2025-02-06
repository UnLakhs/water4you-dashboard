import clientPromise from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Water4You");
    const users = db.collection("users");

    const { username, email, password } = await request.json();

    // Check if all fields are provided
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await users.findOne({ username });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: "staff",
    });
    return NextResponse.json(
      { message: "User created successfully" }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}
