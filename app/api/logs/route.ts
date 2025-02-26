import clientPromise from "@/app/lib/mongoDB";
import { NextResponse } from "next/server";

// This route fetches all logs from the database.
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Water4You");
    const logsCollection = db.collection("notificationlogs");

    // Fetch all logs
    const logs = await logsCollection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch Logs" },
      { status: 500 }
    );
  }
}
