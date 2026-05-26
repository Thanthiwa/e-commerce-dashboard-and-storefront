import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Order, Product } from "@/lib/db/models";

// GET /api/analytics/forecasting - Inventory forecasting and demand prediction
export async function GET() {
  try {
    await dbConnect();

    // Get historical order data (last 90 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $ne: "cancelled" },
    }).lean();

    // Get all products with inventory
    const products = await Product.find({ status: "active" })
      .select("name sku stock reorderPoint price category")
      .populate("category", "name")
      .lean();

    // Calculate daily sales per product
    const productDailySales: Record<string, Record<string, number>> = {};

    orders.forEach((order) => {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0];

      order.items.forEach((item: { product: { toString: () => string }; quantity: number }) => {
        const productId = item.product.toString();
        if (!productDailySales[productId]) {
          productDailySales[productId] = {};
        }
        productDailySales[productId][dateKey] = (productDailySales[productId][dateKey] || 0) + item.quantity;
      });
    });

    // Calculate forecasts for each product
    const forecasts = products.map((product) => {
      const sales = productDailySales[product._id.toString()] || {};
      const salesArray = Object.values(sales);

      // Calculate average daily sales
      const totalDays = 90;
      const totalSold = salesArray.reduce((sum, qty) => sum + qty, 0);
      const avgDailySales = totalSold / totalDays;

      // Calculate standard deviation for safety stock
      const variance =
        salesArray.length > 0 ? salesArray.reduce((sum, qty) => sum + Math.pow(qty - avgDailySales, 0, 0), 0) / salesArray.length : 0;
      const stdDev = Math.sqrt(variance);

      // Simple moving average forecast (7-day window)
      const last7Days = Object.entries(sales)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 7)
        .map(([, qty]) => qty);

      const movingAvg = last7Days.length > 0 ? last7Days.reduce((sum, qty) => sum + qty, 0) / last7Days.length : avgDailySales;

      // Days of stock remaining
      const daysOfStock = movingAvg > 0 ? Math.floor(product.stock / movingAvg) : Infinity;

      // Reorder recommendation
      const leadTime = 7; // Assume 7 days lead time
      const safetyStock = Math.ceil(stdDev * 1.65 * Math.sqrt(leadTime)); // 95% service level
      const reorderPoint = Math.ceil(movingAvg * leadTime + safetyStock);
      const suggestedReorderQty = Math.ceil(movingAvg * 30); // 30 days of stock

      // Forecast next 30 days
      const forecastDays: { date: string; predicted: number }[] = [];
      for (let i = 1; i <= 30; i++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + i);

        // Apply day-of-week seasonality factor (simplified)
        const dayOfWeek = forecastDate.getDay();
        let seasonalFactor = 1;
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          seasonalFactor = 1.3; // Weekend boost
        } else if (dayOfWeek === 1) {
          seasonalFactor = 0.8; // Monday dip
        }

        forecastDays.push({
          date: forecastDate.toISOString().split("T")[0],
          predicted: Math.round(movingAvg * seasonalFactor * 10) / 10,
        });
      }

      return {
        productId: product._id.toString(),
        name: product.name,
        sku: product.sku,
        category: (product.category as { name: string })?.name || "Uncategorized",
        currentStock: product.stock,
        avgDailySales: Math.round(avgDailySales * 10) / 10,
        movingAverage: Math.round(movingAvg * 10) / 10,
        daysOfStock: daysOfStock === Infinity ? 999 : daysOfStock,
        reorderPoint,
        currentReorderPoint: product.reorderPoint,
        suggestedReorderQty,
        safetyStock,
        needsReorder: product.stock <= reorderPoint,
        stockStatus: product.stock <= 0 ? "out_of_stock" : product.stock <= reorderPoint ? "low_stock" : "in_stock",
        forecast: forecastDays,
        totalSold90Days: totalSold,
      };
    });

    // Sort by urgency (lowest days of stock first)
    forecasts.sort((a, b) => a.daysOfStock - b.daysOfStock);

    // Calculate summary metrics
    const lowStockCount = forecasts.filter((f) => f.stockStatus === "low_stock").length;
    const outOfStockCount = forecasts.filter((f) => f.stockStatus === "out_of_stock").length;
    const needsReorderCount = forecasts.filter((f) => f.needsReorder).length;

    const totalInventoryValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
    const avgTurnoverRate = forecasts.reduce((sum, f) => sum + (f.avgDailySales > 0 ? f.currentStock / f.avgDailySales : 0), 0) / forecasts.length;

    // Aggregate forecast for total inventory
    const aggregateForecast: Record<string, number> = {};
    forecasts.forEach((product) => {
      product.forecast.forEach((day) => {
        aggregateForecast[day.date] = (aggregateForecast[day.date] || 0) + day.predicted;
      });
    });

    const totalForecast = Object.entries(aggregateForecast)
      .map(([date, predicted]) => ({ date, predicted: Math.round(predicted) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: {
        totalProducts: products.length,
        lowStockCount,
        outOfStockCount,
        needsReorderCount,
        totalInventoryValue,
        avgTurnoverRate: Math.round(avgTurnoverRate * 10) / 10,
      },
      products: forecasts.slice(0, 50), // Return top 50 products by urgency
      aggregateForecast: totalForecast,
      reorderAlerts: forecasts.filter((f) => f.needsReorder).slice(0, 20),
    });
  } catch (error) {
    console.error("Forecasting analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch forecasting data" }, { status: 500 });
  }
}
