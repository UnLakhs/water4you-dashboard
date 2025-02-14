import clientPromise from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
// import { kv } from "@vercel/kv";

/**
 * @description Retrieves a list of customers from the database, with pagination, search, and sorting.
 * @param {NextRequest} req - The Next.js request object.
 * @returns {NextResponse} - A JSON response containing the customer list, total pages, and current page.
 */

export async function GET(req: NextRequest) {
  /**
   * @description Parses query parameters for pagination, search, and sorting.
   */
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1"); //current page number, defaults to 1
  const limit = parseInt(searchParams.get("limit") || "20"); //number of customers per page, defaults to 20
  const skip = (page - 1) * limit; //Number of documents to skip for pagination

  const search = searchParams.get("search") || ""; //Search term
  const order = searchParams.get("order") === "desc" ? -1 : 1; // Sort order (ascending or descending), defaults to ascending

  // const cacheKey = `customers-page-${page}-search-${search}-order-${order}`;
  // const cachedData = await kv.get(cacheKey);
  // if (typeof cachedData === "string") {
  //   return NextResponse.json(JSON.parse(cachedData));
  // }

  /**
   * @description Builds the MongoDB query for searching across name, email, and phoneNumber.
   * Uses a case-insensitive regular expression search.
   */
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ],
      }
    : {}; // Empty query if no search term

  try {
    const client = await clientPromise;
    const db = client.db("Water4You");
    const customers = db.collection("customers");

    /**
     * @description Counts the total number of matching customers for pagination.
     */
    const totalCustomers = await customers.countDocuments(query);

    /**
     * @description Aggregates customer data with search, sorting, pagination, and a calculated 'isOverdue' field.
     */
    const customerList = await customers
      .aggregate([
        { $match: query }, //Apply the search query
        {
          $addFields: {
            isOverdue: {
              $cond: {
                if: {
                  $lt: [
                    { $toDate: "$date" },
                    new Date(new Date().setHours(0, 0, 0, 0)),
                  ],
                },
                then: 2, // Overdue (yesterday or earlier)
                else: {
                  $cond: {
                    if: {
                      $eq: [
                        { $toDate: "$date" },
                        new Date(new Date().setHours(0, 0, 0, 0)),
                      ],
                    },
                    then: 1, // Due today
                    else: 0, // Upcoming (future)
                  },
                },
              },
            },
          },
        },
        {
          $sort: {
            isOverdue: 1, // Sort by overdue status (upcoming first, due today next, overdue last)
            date: order, // Then sort by date (ascending or descending)
          },
        },
        { $skip: skip }, // Skip documents for pagination
        { $limit: limit }, // Limit the number of documents returned
      ])
      .toArray();

    // // Store result in cache for 10 minutes
    // await kv.set(cacheKey, JSON.stringify(customerList), {
    //   ex: 600,
    // });

    /**
     * @description Returns the customer list, total pages, and current page.
     */
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
    if (!name || !date) {
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
    const existingCustomer = await customers.findOne({ phoneNumber });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer already exists" },
        { status: 409 }
      );
    }

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
