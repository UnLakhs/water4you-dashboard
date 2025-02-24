import clientPromise from "@/app/lib/mongoDB";
import { NextResponse } from "next/server";
import twilio from "twilio";
import nodemailer from "nodemailer";

// This cron job runs every 24 hours at 11:00 AM - 12:00 AM Greece time (1 hour gap is because of vercel hobby plan).
// It sends an SMS only to customers whose "date" matches today's date.
export async function GET() {
  try {
    //twilio client
    const twilioClient = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Initialize Nodemailer transporter.
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true", // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const client = await clientPromise;
    const db = client.db("Water4You");

    //    Determine today's date in YYYY-MM-DD format
    //    If you need a specific time zone, consider using a library like `dayjs` or `luxon`.
    const today = new Date().toISOString().split("T")[0]; // e.g. "2025-02-20"

    // Query customers whose "date" field matches today's date
    const customersDueToday = await db
      .collection("customers")
      .find({ date: today })
      .toArray();
    console.log(`Customers due today:`, customersDueToday);

    // 3. Send notification to each customer who is due today
    await Promise.all(
      customersDueToday.map(async (customer) => {
        // If customer has a phone number, send SMS via Twilio.
        if (customer.phoneNumber) {
          try {
            await twilioClient.messages.create({
              body: `Hello ${customer.name}, your due date is today!`,
              from: process.env.TWILIO_FROM_NUMBER,
              to: customer.phoneNumber,
            });
            console.log(`SMS sent to ${customer.phoneNumber}`);
          } catch (smsError) {
            console.error(
              `Failed to send SMS to ${customer.phoneNumber}:`,
              smsError
            );
          }
        }

        // If customer has an email, send an email notification via Nodemailer.
        if (customer.email) {
          try {
            const mailOptions = {
              from: process.env.EMAIL_FROM,
              to: customer.email,
              subject: "Change your water filter!",
              text: `Hello ${customer.name}, the time has come for you to change your water filter!`,
              html: `<p>Hello ${customer.name}, the time has come for you to change your water filter!</p>`,
            };
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${customer.email}:`, info);
          } catch (error) {
            console.error(`Failed to send email to ${customer.email}:`, error);
          }
        }

        // If neither phone number nor email is provided, log a warning.
        if (!customer.phoneNumber && !customer.email) {
          console.warn(
            `Customer ${customer.name} has no phone number or email.`
          );
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
