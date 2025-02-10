import clientPromise from "@/app/lib/mongoDB";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * @description Retrieves user data based on a JWT token.
 * @param {NextRequest} req - The Next.js request object.
 * @returns {NextResponse} - A JSON response containing user data (excluding password) or an error.
 */
export async function GET(req: NextRequest) {
  try {
    /**
     * @description Extracts the JWT token from the cookie.
     */
    const token = req.cookies.get("token")?.value;

    /**
     * @description Checks if the token exists and the JWT secret is defined.
     */
    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /**
     * @description Verifies the JWT token and extracts the user ID.
     */
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
    };
    const userId = decodedToken.id;

    const client = await clientPromise;
    const db = client.db("Water4You");
    const users = db.collection("users");

    /**
     * @description Finds the user in the database based on the ID from the token.
     */
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /**
     * @description Excludes the password from the user data before sending the response.
     */

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

/**
 * @description Updates user data based on a JWT token.
 * @param {NextRequest} req - The Next.js request object.
 * @returns {NextResponse} - A JSON response indicating success or an error.
 */
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    /**
     * @description Extracts the updated user data from the request body.
     */
    const { username, email, role, ...otherData } = await req.json();

    /**
     * @description Prevents changes to the user's role.
     */
    const updatedData = { username, email, ...otherData };

    /**
     * @description Updates the user data in the database.
     */
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: updatedData });

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * @description Deletes a user from the database.
 * @param {NextRequest} req - The Next.js request object.
 * @returns {NextResponse} - A JSON response indicating success or an error.
 */
export async function DELETE(req: NextRequest) {
  try {
    /**
     * @description Extracts the user ID from the request body.
     */
    const { userId } = await req.json();

    const client = await clientPromise;
    const db = client.db("Water4You");
    const users = db.collection("users");

    /**
     * @description Finds the user to be deleted.
     */
    const user = await users.findOne({ _id: new ObjectId(userId as string) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /**
     * @description Deletes the user from the database.
     */
    await users.deleteOne({ _id: new ObjectId(userId as string) });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
