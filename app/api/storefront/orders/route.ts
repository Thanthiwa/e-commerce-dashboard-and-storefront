import mongoose from "mongoose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";

const AUTH_SECRET = process.env.AUTH_SECRET || "your-secret-key-min-32-characters-long";
const SESSION_COOKIE = "storefront_session";

interface CheckoutItem {
  id: string;
  quantity: number;
  variant?: string;
}

interface OrderLineItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  variant?: string;
}

function getSecretKey() {
  return new TextEncoder().encode(AUTH_SECRET);
}

async function getAuthenticatedCustomerId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const { payload } = await jwtVerify(token, getSecretKey());

  if (payload.userId === "demo-customer-id") {
    const demoCustomer = await Customer.findOneAndUpdate(
      { email: "customer@example.com" },
      {
        $setOnInsert: {
          email: "customer@example.com",
          firstName: "Demo",
          lastName: "Customer",
          phone: "123-456-7890",
        },
      },
      { new: true, upsert: true }
    );

    return demoCustomer._id;
  }

  if (!payload.userId || !mongoose.isValidObjectId(String(payload.userId))) {
    return null;
  }

  const customer = await Customer.findById(String(payload.userId));
  return customer?._id || null;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const customerId = await getAuthenticatedCustomerId();
    if (!customerId) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ" }, { status: 401 });
    }

    const body = await request.json();
    const items: CheckoutItem[] = Array.isArray(body.items) ? body.items : [];
    const paymentMethod = String(body.paymentMethod || "cod");
    const paymentSlipUrl = typeof body.paymentSlipUrl === "string" ? body.paymentSlipUrl.trim() : "";

    if (items.length === 0) {
      return NextResponse.json({ error: "ตะกร้าสินค้าว่าง" }, { status: 400 });
    }

    if (paymentMethod === "qr_code" && !paymentSlipUrl) {
      return NextResponse.json({ error: "กรุณาอัปโหลดสลิปโอนเงินก่อนยืนยันคำสั่งซื้อ" }, { status: 400 });
    }

    const productIds = items.map((item: CheckoutItem) => item.id).filter((id: string) => mongoose.isValidObjectId(id));
    if (productIds.length !== items.length) {
      return NextResponse.json({ error: "พบสินค้าไม่ถูกต้องในตะกร้า" }, { status: 400 });
    }

    const products = await Product.find({ _id: { $in: productIds }, status: "active" });
    const productById = new Map(products.map((product) => [String(product._id), product]));

    const orderItems: OrderLineItem[] = items.map((item: CheckoutItem) => {
      const product = productById.get(String(item.id));
      const quantity = Math.max(1, Number(item.quantity || 1));

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (product.quantity < quantity) {
        throw new Error(`OUT_OF_STOCK:${product.name}`);
      }

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        cost: product.cost || 0,
        quantity,
        variant: typeof item.variant === "string" ? item.variant : undefined,
      };
    });

    const subtotal = orderItems.reduce((sum: number, item: OrderLineItem) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;
    // Allow optional client-supplied orderNumber (must be unique); otherwise generate one
    const clientOrderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    let orderNumber: string;

    if (clientOrderNumber) {
      // basic validation: non-empty and reasonable length
      if (clientOrderNumber.length < 3 || clientOrderNumber.length > 64) {
        return NextResponse.json({ error: "เลขที่สั่งซื้อไม่ถูกต้อง" }, { status: 400 });
      }

      // ensure uniqueness
      const existing = await Order.findOne({ orderNumber: clientOrderNumber });
      if (existing) {
        return NextResponse.json({ error: "หมายเลขคำสั่งซื้อถูกใช้งานแล้ว" }, { status: 400 });
      }

      orderNumber = clientOrderNumber;
    } else {
      orderNumber = await (Order as unknown as { generateOrderNumber: () => Promise<string> }).generateOrderNumber();
    }

    const paymentReference = paymentMethod === "qr_code" ? `QR-${orderNumber}` : undefined;

    const order = new Order({
      orderNumber,
      customer: customerId,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      status: "pending",
      paymentStatus: paymentMethod === "credit_card" ? "paid" : "pending",
      paymentMethod,
      paymentReference,
      paymentSlipUrl: paymentMethod === "qr_code" ? paymentSlipUrl : undefined,
      gatewayProvider: paymentMethod === "stripe_promptpay" ? "stripe" : undefined,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress || body.shippingAddress,
      notes: body.notes,
      source: "web",
    });

    await order.save();

    await Promise.all(
      orderItems.map((item: OrderLineItem) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: {
            quantity: -item.quantity,
            "metadata.purchases": item.quantity,
          },
        })
      )
    );

    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += total;
      customer.averageOrderValue = customer.totalSpent / customer.totalOrders;
      customer.lastOrderDate = new Date();
      await customer.save();
    }

    return NextResponse.json(
      {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          paymentReference: order.paymentReference,
          paymentSlipUrl: order.paymentSlipUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "มีสินค้าบางรายการที่ไม่พร้อมขายแล้ว" }, { status: 400 });
    }

    if (error instanceof Error && error.message.startsWith("OUT_OF_STOCK:")) {
      return NextResponse.json(
        { error: `สินค้า ${error.message.replace("OUT_OF_STOCK:", "")} มีจำนวนไม่พอในสต็อก` },
        { status: 400 }
      );
    }

    console.error("Storefront order POST error:", error);
    return NextResponse.json({ error: "สร้างคำสั่งซื้อไม่สำเร็จ" }, { status: 500 });
  }
}
