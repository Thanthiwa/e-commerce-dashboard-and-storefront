import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Order from "@/lib/db/models/Order";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const segment = searchParams.get("segment");
    const search = searchParams.get("search");

    // Build query
    const query: Record<string, unknown> = {};

    if (segment) query.segment = segment;

    if (search) {
      query.$or = [{ email: { $regex: search, $options: "i" } }, { firstName: { $regex: search, $options: "i" } }, { lastName: { $regex: search, $options: "i" } }];
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.aggregate([
        { $match: query },
        {
          $lookup: {
            from: Order.collection.name,
            localField: "_id",
            foreignField: "customer",
            as: "orders",
          },
        },
        {
          $addFields: {
            totalOrders: { $size: "$orders" },
            totalSpent: { $sum: "$orders.total" },
            lastOrderDate: { $max: "$orders.createdAt" },
          },
        },
        {
          $addFields: {
            averageOrderValue: {
              $cond: [{ $gt: ["$totalOrders", 0] }, { $divide: ["$totalSpent", "$totalOrders"] }, 0],
            },
          },
        },
        { $project: { passwordHash: 0, orders: 0 } },
        { $sort: { totalSpent: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Customer.countDocuments(query),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
