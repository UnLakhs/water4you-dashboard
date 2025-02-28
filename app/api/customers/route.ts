import clientPromise from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { ObjectId } from "mongodb";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

/**
 * GET /api/customers
 *
 * Retrieves a paginated list of customers from the database with optional search and sorting.
 * The complete response object is cached in Redis to improve performance.
 *
 * Caching Details:
 * - The full response object is stringified with JSON.stringify before storing.
 * - Upstash Redis client may auto-parse JSON strings on retrieval, returning an object.
 * - The code checks if the cached data is a string or an object.
 *   - If it's a string, we parse it.
 *   - If it's an object, we use it directly.
 * - If the cached object does not contain the expected keys, it is considered incomplete and cleared.
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

  const cacheKey = `customers-page-${page}-search-${search}-order-${order}`;
  const cachedData = await redis.get(cacheKey);

  // Log cached data for debugging
  // console.log("Cached Data Type:", typeof cachedData);
  // console.log("Cached Data:", cachedData);

  // If cached data exists, verify it contains the full response object.
  if (cachedData) {
    try {
      let fullResponse;
      // If cached data is a string, parse it; otherwise, use it directly.
      if (typeof cachedData === "string") {
        fullResponse = JSON.parse(cachedData);
      } else {
        fullResponse = cachedData;
      }

      // Verify that the cached response includes all required keys.
      if (
        fullResponse &&
        typeof fullResponse === "object" &&
        "customers" in fullResponse &&
        "totalPages" in fullResponse &&
        "currentPage" in fullResponse
      ) {
        // console.log("Cache hit! Returning full response data.");
        return NextResponse.json(fullResponse);
      } else {
        // console.log("Cached data is incomplete. Clearing cache.");
        await redis.del(cacheKey);
      }
    } catch (error) {
      console.error("Error parsing cached data, clearing cache...", error);
      await redis.del(cacheKey);
    }
  }

  // Build the MongoDB query for searching across name, email, and phoneNumber.
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
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

    // Cache the complete response payload as a JSON string for 10 minutes.
    await redis.set(cacheKey, JSON.stringify(responsePayload), { ex: 600 });

    // Return the complete response.
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
    const { name, email, phoneNumber, description, date } = body || {};

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
     * @description Checks if a customer with the same phone number already exists.
     */
    // const existingCustomer = await customers.findOne({ phoneNumber });

    // if (existingCustomer) {
    //   return NextResponse.json(
    //     { error: "Customer already exists" },
    //     { status: 409 }
    //   );
    // }

    /**
     * @description Inserts the new customer data into the database.
     */
    const newCustomer = await customers.insertOne({
      name,
      email: email.toLowerCase(), // store email to lowercase
      phoneNumber,
      description,
      date,
      createdAt: new Date(), // Add createdAt field with current date
    });

    // Invalidate the cache for all customer pages.
    // Using a pattern match to find all keys starting with "customers-page-"
    const keys = await redis.keys("customers-page-*");
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)));
      console.log("Cache invalidated for keys:", keys);
    }

    /**
     * @description Returns a success message with the ID of the newly created customer.
     */
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

//Update a customer's info
export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    // Parse request body
    const body = await req.json();
    const { customerId, name, email, phoneNumber, description, date } = body;
    const customerObjectId = new ObjectId(customerId as string);

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

    // Invalidate the cache for all customer pages.
    // Using a pattern match to find all keys starting with "customers-page-"
    const keys = await redis.keys("customers-page-*");
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)));
      console.log("Cache invalidated for keys:", keys);
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

//Delete a customer
export async function DELETE(req: NextRequest) {
  try {
    const { customerId } = await req.json();
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    await customers.deleteOne({
      _id: new ObjectId(customerId as string),
    });

    // Invalidate the cache for all customer pages.
    // Using a pattern match to find all keys starting with "customers-page-"
    const keys = await redis.keys("customers-page-*");
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)));
      console.log("Cache invalidated for keys:", keys);
    }
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
