import clientPromise from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // or bcryptjs if you're using that

export async function PUT(request: NextRequest) {
  const { currentPassword, newPassword } = await request.json();

  try {
    const token = request.cookies.get("token")?.value;

    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
    };
    const userId = decodedToken.id;

    const client = await clientPromise;
    const db = client.db("Water4You");
    const collection = db.collection("users");

    // Convert the string userId to an ObjectId instance
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password (compare hashed password)
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash the new password before saving
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword } }
    );

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
