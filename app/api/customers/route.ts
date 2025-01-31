import clientPromise from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";

//Add a new customer
export async function POST(request: NextRequest) {
  try {
    // Parse request safely
    const body = await request.json();
    const { name, email, phoneNumber, description, date } = body || {};

    if (!name || !email || !phoneNumber || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    // Check if customer already exists
    const existingCustomer = await customers.findOne({ phoneNumber });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer already exists" },
        { status: 409 }
      );
    }

    // Insert new customer
    const newCustomer = await customers.insertOne({
      name,
      email: email.toLowerCase(),
      phoneNumber,
      description,
      date,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Customer added successfully", id: newCustomer.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding customer:", error);
    return NextResponse.json(
      { error: "Failed to add a customer" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  try {
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    const totalCustomers = await customers.countDocuments();
    const customerList = await customers.find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      customers: customerList,
      totalPages: Math.ceil(totalCustomers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer data" },
      { status: 500 }
    );
  }
}
