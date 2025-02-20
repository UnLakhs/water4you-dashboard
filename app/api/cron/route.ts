import clientPromise from "@/app/lib/mongoDB";
import { NextResponse } from "next/server";
import twilio from "twilio";

// This cron job runs every 24 hours at 11:00 AM Greece time (or whenever you schedule it).
// It sends an SMS only to customers whose "date" matches today's date.
export async function GET() {
  try {
    const twilioClient = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const client = await clientPromise;
    const db = client.db("Water4You");

    // 1. Determine today's date in YYYY-MM-DD format
    //    If you need a specific time zone, consider using a library like `dayjs` or `luxon`.
    const today = new Date().toISOString().split("T")[0]; // e.g. "2025-02-20"

    // 2. Query customers whose "date" field matches today's date
    const customersDueToday = await db
      .collection("customers")
      .find({ date: today })
      .toArray();
    console.log(`Customers due today:`, customersDueToday);
    
    // 3. Send SMS to each customer who is due today
    await Promise.all(
      customersDueToday.map(async (customer) => {
        try {
          await twilioClient.messages.create({
            body: `Hello ${customer.name}, your due date is today!`,
            from: process.env.TWILIO_FROM_NUMBER,
            to: customer.phoneNumber,
          });
          console.log(`SMS sent to ${customer.phoneNumber}`);
        } catch (smsError) {
          console.error(`Failed to send SMS to ${customer.phoneNumber}:`, smsError);
        }
      })
    );

    return NextResponse.json(
      { message: "Cron job completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error in cron job" }, { status: 500 });
  }
}
