import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Order, Product, Customer } from "@/lib/db/models";

// GET /api/analytics/sales - Sales analytics with trends and forecasting
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const daysAgo = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get orders within the period
    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $ne: "cancelled" },
    }).lean();

    // Calculate daily sales
    const dailySales: Record<string, { revenue: number; orders: number; units: number }> = {};

    orders.forEach((order) => {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
      if (!dailySales[dateKey]) {
        dailySales[dateKey] = { revenue: 0, orders: 0, units: 0 };
      }
      dailySales[dateKey].revenue += order.total;
      dailySales[dateKey].orders += 1;
      dailySales[dateKey].units += order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
    });

    // Convert to array and sort by date
    const salesTrend = Object.entries(dailySales)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate summary metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysAgo);

    const prevOrders = await Order.find({
      createdAt: { $gte: prevStartDate, $lt: startDate },
      status: { $ne: "cancelled" },
    }).lean();

    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Top selling products
    const productSales: Record<string, { id: string; name: string; units: number; revenue: number }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        const productId = item.product.toString();
        if (!productSales[productId]) {
          const product = await Product.findById(productId).lean();
          productSales[productId] = {
            id: productId,
            name: product?.name || "Unknown Product",
            units: 0,
            revenue: 0,
          };
        }
        productSales[productId].units += item.quantity;
        productSales[productId].revenue += item.price * item.quantity;
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by category
    const categorySales: Record<string, { name: string; revenue: number; orders: number }> = {};

    for (const product of Object.values(productSales)) {
      const fullProduct = await Product.findById(product.id).populate("category").lean();
      if (fullProduct?.category) {
        const categoryName = (fullProduct.category as { name: string }).name || "Uncategorized";
        if (!categorySales[categoryName]) {
          categorySales[categoryName] = { name: categoryName, revenue: 0, orders: 0 };
        }
        categorySales[categoryName].revenue += product.revenue;
        categorySales[categoryName].orders += 1;
      }
    }

    const salesByCategory = Object.values(categorySales).sort((a, b) => b.revenue - a.revenue);

    // Simple forecasting (moving average)
    const recentDays = salesTrend.slice(-7);
    const avgDailyRevenue = recentDays.reduce((sum, day) => sum + day.revenue, 0) / (recentDays.length || 1);
    const forecast = [];

    for (let i = 1; i <= 7; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      forecast.push({
        date: forecastDate.toISOString().split("T")[0],
        predictedRevenue: avgDailyRevenue * (1 + Math.random() * 0.1 - 0.05), // Add slight variation
      });
    }

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        revenueGrowth,
        period: daysAgo,
      },
      salesTrend,
      topProducts,
      salesByCategory,
      forecast,
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch sales analytics" }, { status: 500 });
  }
}
