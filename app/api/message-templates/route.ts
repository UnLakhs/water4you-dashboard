import { NotificationTemplates } from "@/app/Cosntants/constants";
import clientPromise from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";

//GET all message templates from the database
export async function GET() {
  const client = await clientPromise;
  const templateDoc = await client
    .db("Water4You")
    .collection<NotificationTemplates>("notification_templates")
    .findOne();

  if (!templateDoc)
    return NextResponse.json({ error: "Templates not found" }, { status: 404 });

  return NextResponse.json({
    sms: templateDoc.smsTemplate,
    email: templateDoc.emailTemplate,
  });
}

// PUT: Update templates
export async function PUT(req: NextRequest) {
  try {
    const { sms, email } = await req.json();

    const client = await clientPromise;
    const db = client.db("Water4You");
    const templatesCollection =
      db.collection<NotificationTemplates>("notification_templates");

    await templatesCollection.updateOne(
      {},
      {
        $set: {
          "smsTemplate.body": sms.body,
          "smsTemplate.lastUpdated": new Date(),
          "emailTemplate.subject": email.subject,
          "emailTemplate.htmlContent": email.htmlContent,
          "emailTemplate.lastUpdated": new Date(),
        },
      },
      { upsert: true } // Create doc if it doesn't exist
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating templates:", error);
    return NextResponse.json(
      { error: "Failed to update templates" },
      { status: 500 }
    );
  }
}
