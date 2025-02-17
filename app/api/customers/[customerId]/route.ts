import clientPromise from "@/app/lib/mongoDB";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { use } from "react";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = use(params);
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    const customer = await customers.findOne({
      _id: new ObjectId(customerId),
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(customer), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Error fetching customer data" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = use(params);
    const customerObjectId = new ObjectId(customerId);
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    // Parse request body
    const body = await req.json();
    const { name, email, phoneNumber, description, date } = body;

    // Ensure `customerId` is valid
    if (!customerObjectId || !ObjectId.isValid(customerObjectId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    // const customerId = new ObjectId(params.customerId);

    // Update customer
    const result = await customers.updateOne(
      { _id: customerObjectId },
      {
        $set: { name, email, phoneNumber, description, date },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Customer not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Customer updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer data" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = use(params);
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    await customers.deleteOne({
      _id: new ObjectId(customerId),
    });

    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer data" },
      { status: 500 }
    );
  }
}
