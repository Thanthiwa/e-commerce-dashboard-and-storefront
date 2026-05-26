import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json({ error: "Stripe is not configured. Please set STRIPE_SECRET_KEY." }, { status: 400 });
    }

    await connectDB();

    const body = await request.json();
    const orderId = String(body.orderId || "");

    if (!orderId) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const origin = request.headers.get("origin") || new URL(request.url).origin;
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("payment_method_types[]", "promptpay");
    params.append("line_items[0][price_data][currency]", "thb");
    params.append("line_items[0][price_data][product_data][name]", `Order ${order.orderNumber}`);
    params.append("line_items[0][price_data][unit_amount]", String(Math.round(order.total * 100)));
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${origin}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${origin}/checkout?payment=cancelled`);
    params.append("client_reference_id", String(order._id));
    params.append("metadata[orderId]", String(order._id));
    params.append("metadata[orderNumber]", order.orderNumber);

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return NextResponse.json({ error: session.error?.message || "Failed to create Stripe checkout session" }, { status: 400 });
    }

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        paymentReference: session.id,
        gatewayProvider: "stripe",
        gatewaySessionId: session.id,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create Stripe checkout session" }, { status: 500 });
  }
}
