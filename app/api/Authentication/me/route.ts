import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import clientPromise from "@/app/lib/mongoDB";
import { ObjectId } from "mongodb"; // Import ObjectId

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

//   console.log("Received Token:", token);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is missing");

    // Explicitly cast decoded token as JwtPayload otherwise TS will complain
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Check if the id property exists in the decoded token
    if (!decoded.id) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("Water4You");
    //Finally we can use the ObjectId type to query the database
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.id as string)
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      username: user.username,
      role: user.role ? "admin" : "staff",
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
