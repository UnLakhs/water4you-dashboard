import clientPromise from "@/app/lib/mongoDB";
import { NextResponse } from "next/server";
import twilio from "twilio";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const twilioClient = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

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

    const today = new Date().toISOString().split("T")[0];

    // Fetch templates
    const templates = await db.collection("notification_templates").findOne();

    if (!templates) {
      console.error("Notification templates not found.");
      return NextResponse.json({ message: "Templates not found" }, { status: 500 });
    }

    const customersDueToday = await db
      .collection("customers")
      .find({ date: today })
      .toArray();

    console.log(`Customers due today:`, customersDueToday);

    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).toLocaleDateString("el-GR", { day: "numeric", month: "long" });

    await Promise.all(
      customersDueToday.map(async (customer) => {
        // --- SMS ---
        if (customer.phoneNumber) {
          try {
            const smsBody = templates.smsTemplate.body
              .replace("{{name}}", customer.name)
              .replace("{{endOfMonth}}", endOfMonth);

            await twilioClient.messages.create({
              body: smsBody,
              from: "WATER4YOU",
              to: customer.phoneNumber,
            });

            console.log(`SMS sent to ${customer.phoneNumber}`);
            await logsCollection.insertOne({
              type: "sms",
              recipient: customer.phoneNumber,
              status: "sent",
              timestamp: new Date(),
              successMessage: `SMS sent to ${customer.name} (${customer.phoneNumber})`,
              message: smsBody,
            });
          } catch (error) {
            const smsError = error as { message?: string; code?: string };
            console.error(
              `Failed to send SMS to ${customer.phoneNumber}:`,
              smsError
            );

            await logsCollection.insertOne({
              type: "sms",
              recipient: customer.phoneNumber,
              status: "failed",
              timestamp: new Date(),
              errorMessage: smsError.message || String(smsError),
              errorCode: smsError.code || "UNKNOWN_ERROR",
            });
          }
        }

        // --- EMAIL ---
        if (customer.email) {
          try {
            const emailSubject = templates.emailTemplate.subject
              .replace("{{name}}", customer.name)
              .replace("{{endOfMonth}}", endOfMonth);

            const emailHtml = templates.emailTemplate.htmlContent
              .replace("{{name}}", customer.name)
              .replace("{{endOfMonth}}", endOfMonth);

            const mailOptions = {
              from: `"WATER4YOU" <${process.env.EMAIL_FROM}>`,
              to: customer.email,
              subject: emailSubject,
              html: emailHtml,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${customer.email}:`, info);

            await logsCollection.insertOne({
              type: "email",
              recipient: customer.email,
              status: "sent",
              timestamp: new Date(),
              message: emailHtml,
            });
          } catch (error) {
            console.error(`Failed to send email to ${customer.email}:`, error);
            await logsCollection.insertOne({
              type: "email",
              recipient: customer.email,
              status: "failed",
              timestamp: new Date(),
              message: templates.emailTemplate.htmlContent,
              errorMessage: String(error),
            });
          }
        }

        // No contact info
        if (!customer.phoneNumber && !customer.email) {
          console.warn(`Customer ${customer.name} has no phone number or email.`);
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
