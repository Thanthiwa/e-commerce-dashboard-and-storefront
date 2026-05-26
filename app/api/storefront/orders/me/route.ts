import mongoose from "mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Order from "@/lib/db/models/Order";

const AUTH_SECRET = process.env.AUTH_SECRET || "your-secret-key-min-32-characters-long";
const SESSION_COOKIE = "storefront_session";

const statusMessages: Record<string, string> = {
  pending: "คำสั่งซื้อของคุณรอดำเนินการ",
  processing: "ร้านค้ากำลังเตรียมสินค้าให้คุณ",
  shipped: "สินค้าของคุณจัดส่งแล้ว",
  delivered: "สินค้าของคุณส่งถึงแล้ว",
  cancelled: "คำสั่งซื้อของคุณถูกยกเลิก",
  refunded: "คำสั่งซื้อของคุณได้รับการคืนเงินแล้ว",
};

function getSecretKey() {
  return new TextEncoder().encode(AUTH_SECRET);
}

async function getCustomerId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const { payload } = await jwtVerify(token, getSecretKey());

  if (payload.userId === "demo-customer-id") {
    const demoCustomer = await Customer.findOne({ email: "customer@example.com" });
    return demoCustomer?._id || null;
  }

  if (!payload.userId || !mongoose.isValidObjectId(String(payload.userId))) {
    return null;
  }

  return String(payload.userId);
}

export async function GET() {
  try {
    await connectDB();

    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await Order.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const notifications = orders.slice(0, 5).map((order) => ({
      id: String(order._id),
      orderNumber: order.orderNumber,
      status: order.status,
      title: statusMessages[order.status] || "คำสั่งซื้อมีการอัปเดต",
      message:
        order.status === "shipped" && order.trackingNumber
          ? `เลขพัสดุ ${order.trackingNumber}`
          : `คำสั่งซื้อ ${order.orderNumber}`,
      createdAt: order.updatedAt || order.createdAt,
    }));

    return NextResponse.json({ orders, notifications });
  } catch (error) {
    console.error("Storefront orders me GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
