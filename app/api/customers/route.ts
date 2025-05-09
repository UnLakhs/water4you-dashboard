import clientPromise from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

/**
 * GET /api/customers
 *
 * Retrieves a paginated list of customers from the database with optional search and sorting.
 * Performs direct MongoDB queries without caching.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} A JSON response containing:
 *   - customers: An array of customer objects.
 *   - totalPages: Total number of pages.
 *   - currentPage: The current page number.
 *
 * @example
 * Returned JSON structure:
 * {
 *   "customers": [ /* array of customers * / ],
 *   "totalPages": 3,
 *   "currentPage": 1
 * }
 */
export async function GET(req: NextRequest) {
  // Parse query parameters for pagination, search, and sorting.
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1"); // current page, defaults to 1
  const limit = parseInt(searchParams.get("limit") || "20"); // customers per page, defaults to 20
  const skip = (page - 1) * limit; // documents to skip for pagination

  const search = searchParams.get("search") || ""; // search term
  const order = searchParams.get("order") === "desc" ? -1 : 1; // sort order

  // Escape special regex characters in the search term
  const escapeRegex = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedSearch = escapeRegex(search);

  // Build the MongoDB query for searching across name, email, and phoneNumber.
  const query = search
    ? {
        $or: [
          { name: { $regex: escapedSearch, $options: "i" } },
          { email: { $regex: escapedSearch, $options: "i" } },
          { phoneNumber: { $regex: escapedSearch, $options: "i" } },
        ],
      }
    : {};

  try {
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    // Count total matching customers for pagination.
    const totalCustomers = await customers.countDocuments(query);

    // 1. Force "today" to midnight UTC so we compare apples-to-apples
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();
    const todayMidnightUTC = new Date(Date.UTC(year, month, day)); // 00:00 UTC

    const customerList = await customers
      .aggregate([
        { $match: query },
        {
          $addFields: {
            dateObject: {
              $dateFromString: {
                dateString: "$date", // e.g. "2025-02-21"
                format: "%Y-%m-%d", // interpret as YYYY-MM-DD
                timezone: "UTC",
              },
            },
          },
        },
        {
          $addFields: {
            // If dateObject < todayMidnightUTC => overdue = 1
            // Otherwise => 0
            isOverdue: {
              $cond: {
                if: { $lt: ["$dateObject", todayMidnightUTC] },
                then: 1,
                else: 0,
              },
            },
          },
        },
        {
          $sort: {
            isOverdue: 1, // 0 (today/future) first, 1 (overdue) last
            dateObject: order,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    // Prepare the complete response payload.
    const responsePayload = {
      customers: customerList,
      totalPages: Math.ceil(totalCustomers / limit),
      currentPage: page,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer data" },
      { status: 500 }
    );
  }
}

/**
 * @description Adds a new customer to the database.
 * @param {NextRequest} request - The Next.js request object.
 * @returns {NextResponse} - A JSON response indicating success or an error.
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * @description Parses the request body and extracts customer data.
     */
    const body = await request.json();
    const { name, email, phoneNumber, description, date, productUrl } = body || {};

    /**
     * @description Validates required fields.
     */
    if (!name || (!phoneNumber && !email) || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    /**
     * @description Inserts the new customer data into the database.
     */
    const newCustomer = await customers.insertOne({
      name,
      email: email?.toLowerCase(), // store email to lowercase (optional chaining)
      phoneNumber,
      description,
      date,
      productUrl, // Add the new field
      createdAt: new Date(),
    });

    /**
     * @description Returns a success message with the ID of the newly created customer.
     */
    return NextResponse.json(
      { 
        message: "Customer added successfully", 
        id: newCustomer.insertedId 
      },
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

/**
 * @description Updates a customer's information in the database.
 * @param {NextRequest} req - The Next.js request object.
 * @returns {NextResponse} - A JSON response indicating success or an error.
 */
export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    // Parse request body
    const body = await req.json();
    const { customerId, name, email, phoneNumber, description, date, productUrl } = body;
    const customerObjectId = new ObjectId(customerId as string);

    // Ensure `customerId` is valid
    if (!customerObjectId || !ObjectId.isValid(customerObjectId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    // Update customer
    const result = await customers.updateOne(
      { _id: customerObjectId },
      {
        $set: { 
          name, 
          email, 
          phoneNumber, 
          description, 
          date,
          productUrl // Add the new field
        },
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

/**
 * @description Deletes a customer from the database.
 * @param {NextRequest} req - The Next.js request object.
 * @returns {NextResponse} - A JSON response indicating success or an error.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { customerId } = await req.json();
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    await customers.deleteOne({
      _id: new ObjectId(customerId as string),
    });

    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
