import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Customer, Order } from "@/lib/db/models";

// RFM Analysis interfaces
interface RFMScore {
  customerId: string;
  customerName: string;
  email: string;
  recency: number;
  frequency: number;
  monetary: number;
  rfmScore: string;
  segment: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | null;
}

// GET /api/analytics/segmentation - Customer segmentation using RFM analysis
export async function GET() {
  try {
    await dbConnect();

    // Get all customers with their orders
    const customers = await Customer.find({ status: "active" }).lean();
    const orders = await Order.find({ status: { $ne: "cancelled" } }).lean();

    // Build customer order map
    const customerOrders: Record<string, typeof orders> = {};
    orders.forEach((order) => {
      const customerId = order.customer.toString();
      if (!customerOrders[customerId]) {
        customerOrders[customerId] = [];
      }
      customerOrders[customerId].push(order);
    });

    // Calculate RFM scores for each customer
    const rfmData: RFMScore[] = [];
    const now = new Date();

    customers.forEach((customer) => {
      const custOrders = customerOrders[customer._id.toString()] || [];
      if (custOrders.length === 0) return;

      // Recency: Days since last order
      const lastOrder = custOrders.reduce((latest, order) => (new Date(order.createdAt) > new Date(latest.createdAt) ? order : latest), custOrders[0]);
      const recency = Math.floor((now.getTime() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24));

      // Frequency: Number of orders
      const frequency = custOrders.length;

      // Monetary: Total spent
      const monetary = custOrders.reduce((sum, order) => sum + order.total, 0);

      rfmData.push({
        customerId: customer._id.toString(),
        customerName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        recency,
        frequency,
        monetary,
        rfmScore: "",
        segment: "",
        totalOrders: frequency,
        totalSpent: monetary,
        lastOrderDate: new Date(lastOrder.createdAt),
      });
    });

    // Calculate quintiles for scoring (1-5 scale)
    const recencies = rfmData.map((r) => r.recency).sort((a, b) => a - b);
    const frequencies = rfmData.map((r) => r.frequency).sort((a, b) => a - b);
    const monetaries = rfmData.map((r) => r.monetary).sort((a, b) => a - b);

    const getQuintile = (value: number, sortedArray: number[], inverse = false): number => {
      const idx = sortedArray.findIndex((v) => v >= value);
      const position = idx === -1 ? sortedArray.length : idx;
      const quintile = Math.ceil(((position + 1) / sortedArray.length) * 5) || 1;
      return inverse ? 6 - quintile : quintile;
    };

    // Assign scores and segments
    rfmData.forEach((customer) => {
      const rScore = getQuintile(customer.recency, recencies, true); // Lower recency = higher score
      const fScore = getQuintile(customer.frequency, frequencies);
      const mScore = getQuintile(customer.monetary, monetaries);

      customer.rfmScore = `${rScore}${fScore}${mScore}`;

      // Assign segment based on RFM combination
      const avgScore = (rScore + fScore + mScore) / 3;

      if (rScore >= 4 && fScore >= 4 && mScore >= 4) {
        customer.segment = "Champions";
      } else if (rScore >= 4 && fScore >= 3) {
        customer.segment = "Loyal Customers";
      } else if (rScore >= 4 && fScore <= 2) {
        customer.segment = "New Customers";
      } else if (rScore >= 3 && mScore >= 4) {
        customer.segment = "Big Spenders";
      } else if (rScore <= 2 && fScore >= 3) {
        customer.segment = "At Risk";
      } else if (rScore <= 2 && fScore <= 2 && mScore <= 2) {
        customer.segment = "Lost";
      } else if (avgScore >= 3.5) {
        customer.segment = "Potential Loyalists";
      } else if (avgScore >= 2.5) {
        customer.segment = "Need Attention";
      } else {
        customer.segment = "Hibernating";
      }
    });

    // Calculate segment summary
    const segmentSummary: Record<string, { count: number; totalRevenue: number; avgOrderValue: number }> = {};

    rfmData.forEach((customer) => {
      if (!segmentSummary[customer.segment]) {
        segmentSummary[customer.segment] = { count: 0, totalRevenue: 0, avgOrderValue: 0 };
      }
      segmentSummary[customer.segment].count += 1;
      segmentSummary[customer.segment].totalRevenue += customer.totalSpent;
    });

    Object.values(segmentSummary).forEach((segment) => {
      segment.avgOrderValue = segment.count > 0 ? segment.totalRevenue / segment.count : 0;
    });

    const segments = Object.entries(segmentSummary)
      .map(([name, data]) => ({
        name,
        ...data,
        percentage: (data.count / rfmData.length) * 100,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate overall metrics
    const totalCustomers = rfmData.length;
    const avgLifetimeValue = totalCustomers > 0 ? rfmData.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers : 0;
    const avgFrequency = totalCustomers > 0 ? rfmData.reduce((sum, c) => sum + c.frequency, 0) / totalCustomers : 0;

    return NextResponse.json({
      summary: {
        totalCustomers,
        avgLifetimeValue,
        avgFrequency,
        segments: segments.length,
      },
      segments,
      customers: rfmData.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 50), // Top 50 customers
    });
  } catch (error) {
    console.error("Segmentation analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch customer segmentation" }, { status: 500 });
  }
}
