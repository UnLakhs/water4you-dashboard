import clientPromise from "@/app/lib/mongoDB";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

//Get customer info
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
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