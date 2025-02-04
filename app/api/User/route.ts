import clientPromise from "@/app/lib/mongoDB";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value; // Get JWT token from cookies

    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
    };
    const userId = decodedToken.id;

    const client = await clientPromise;
    const db = client.db("Water4You");
    const users = db.collection("users");

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hide sensitive fields before sending response
    const { password, ...safeUserData } = user;

    return NextResponse.json(safeUserData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {}
