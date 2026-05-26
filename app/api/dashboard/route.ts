import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Order, Product, Customer } from "@/lib/db/models";

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prevThirtyDays = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period stats
    const [
      totalRevenue,
      ordersThisMonth,
      totalCustomers,
      totalProducts,
      prevMonthOrders,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Customer.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "active" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: prevThirtyDays, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer", "firstName lastName email")
        .lean(),
      Product.find({ $expr: { $lte: ["$stock", "$reorderPoint"] } })
        .select("name sku stock reorderPoint")
        .limit(10)
        .lean(),
    ]);

    const currentRevenue = totalRevenue[0]?.total || 0;
    const previousRevenue = prevMonthOrders[0]?.total || 0;
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Sales by category
    const salesByCategory = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$category.name",
          revenue: { $sum: "$items.total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Daily revenue for chart (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dailyRevenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.productName" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      summary: {
        totalRevenue: currentRevenue,
        revenueGrowth,
        ordersThisMonth,
        totalCustomers,
        totalProducts,
        averageOrderValue: ordersThisMonth > 0 ? currentRevenue / ordersThisMonth : 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer ? `${(order.customer as { firstName: string }).firstName} ${(order.customer as { lastName: string }).lastName}` : "Unknown",
        total: order.total,
        status: order.status,
        date: order.createdAt,
      })),
      salesByCategory: salesByCategory.map((cat) => ({
        name: cat._id || "Uncategorized",
        revenue: cat.revenue,
        orders: cat.orders,
      })),
      dailyRevenue: dailyRevenue.map((day) => ({
        date: day._id,
        revenue: day.revenue,
        orders: day.orders,
      })),
      topProducts,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
