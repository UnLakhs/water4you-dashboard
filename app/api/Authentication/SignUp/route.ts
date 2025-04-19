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

    const existingUser = await users.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const isDuplicateUsername = existingUser.username === username;
      const isDuplicateEmail = existingUser.email === email;

      let message = "User already exists";
      if (isDuplicateUsername && isDuplicateEmail) {
        message = "Username and email already exist";
      } else if (isDuplicateUsername) {
        message = "Username already exists";
      } else if (isDuplicateEmail) {
        message = "Email already exists";
      }

      return NextResponse.json({ message }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: "staff",
    });
    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
