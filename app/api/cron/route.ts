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
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const client = await clientPromise;
    const db = client.db("Water4You");
    const logsCollection = db.collection("notificationlogs");

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

            await logsCollection.insertOne({
              type: "sms",
              recipient: customer.phoneNumber,
              status: "sent",
              timestamp: new Date(),
              successMessage: `sms has been sent to ${customer.name} with phone ${customer.phoneNumber}`,
            });
          } catch (smsError) {
            console.error(
              `Failed to send SMS to ${customer.phoneNumber}:`,
              smsError
            );

            // Log failure
            await logsCollection.insertOne({
              type: "sms",
              recipient: customer.phoneNumber,
              status: "failed",
              timestamp: new Date(),
              message: `Hello ${customer.name}, your due date is today!`,
              errorMessage: smsError,
            });
          }
        }

        // If customer has an email, send an email notification via Nodemailer.
        if (customer.email) {
          try {
            const mailOptions = {
              from: `"WATER4YOU" <${process.env.EMAIL_FROM}>`,
              to: customer.email,
              subject: "Ώρα να αλλάξετε το φίλτρο νερού σας!",
              text: `Hello ${customer.name}, the time has come for you to change your water filter!`,
              html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
  <h2 style="color: #2b6cb0;">Αγαπητέ/ή [Customer Name],</h2>
  
  <p>Σύμφωνα με τις εγγραφές μας, <strong>ήρθε η ώρα να αντικαταστήσετε το φίλτρο νερού σας</strong>.</p>
  
  <p>Η τακτική συντήρηση είναι σημαντική για:</p>
  <ul style="margin-left: 20px;">
    <li>✔ Βέλτιστη ποιότητα νερού</li>
    <li>✔ Αποτελεσματικό φιλτράρισμα</li>
    <li>✔ Μακροζωία της συσκευής σας</li>
  </ul>

  <p>Για οποιαδήποτε απορία ή για να προγραμματίσετε μια επίσκεψη τεχνικού, μπορείτε να επικοινωνήσετε μαζί μας στο <strong>[Phone Number]</strong> ή να απαντήσετε σε αυτό το email.</p>

  <p>Ευχαριστούμε που μας εμπιστεύεστε!</p>
  
  <p style="margin-top: 30px;">
    Με εκτίμηση,<br>
    <strong>Η ομάδα WATER4YOU</strong><br>
    <img src="https://yourwebsite.com/logo.png" alt="WATER4YOU Logo" width="150" style="margin-top: 10px;">
  </p>
</div>`,
            };
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${customer.email}:`, info);
            // Log success
            await logsCollection.insertOne({
              type: "email",
              recipient: customer.email,
              status: "sent",
              timestamp: new Date(),
              message: mailOptions.text,
            });
          } catch (error) {
            console.error(`Failed to send email to ${customer.email}:`, error);
            // Log failure
            await logsCollection.insertOne({
              type: "email",
              recipient: customer.email,
              status: "failed",
              timestamp: new Date(),
              message: `Hello ${customer.name}, the time has come for you to change your water filter!`,
              errorMessage: error,
            });
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
