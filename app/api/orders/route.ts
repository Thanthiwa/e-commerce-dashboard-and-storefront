import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Category from "@/lib/db/models/Category";
import Customer from "@/lib/db/models/Customer";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

const sampleCustomers = [
  { email: "john.smith@example.com", firstName: "John", lastName: "Smith", phone: "081-234-5678" },
  { email: "sarah.johnson@example.com", firstName: "Sarah", lastName: "Johnson", phone: "082-345-6789" },
  { email: "michael.brown@example.com", firstName: "Michael", lastName: "Brown", phone: "083-456-7890" },
  { email: "emily.davis@example.com", firstName: "Emily", lastName: "Davis", phone: "084-567-8901" },
];

const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    slug: "demo-wireless-bluetooth-headphones",
    description: "Premium noise-canceling headphones with long battery life",
    price: 149.99,
    cost: 89.99,
    sku: "DEMO-ELEC-001",
    quantity: 150,
    images: ["/placeholder.svg?text=Headphones"],
  },
  {
    name: "Smart Watch Pro",
    slug: "demo-smart-watch-pro",
    description: "Advanced fitness tracking with heart rate monitor",
    price: 299.99,
    cost: 179.99,
    sku: "DEMO-ELEC-002",
    quantity: 80,
    images: ["/placeholder.svg?text=SmartWatch"],
  },
  {
    name: "Mechanical Keyboard",
    slug: "demo-mechanical-keyboard",
    description: "RGB backlit mechanical keyboard for work and gaming",
    price: 129.99,
    cost: 69.99,
    sku: "DEMO-ELEC-003",
    quantity: 120,
    images: ["/placeholder.svg?text=Keyboard"],
  },
  {
    name: "Minimalist Desk Lamp",
    slug: "demo-minimalist-desk-lamp",
    description: "LED desk lamp with adjustable brightness",
    price: 44.99,
    cost: 22.5,
    sku: "DEMO-HOME-001",
    quantity: 250,
    images: ["/placeholder.svg?text=Lamp"],
  },
];

async function ensureSampleOrders() {
  const existingOrders = await Order.countDocuments({});
  if (existingOrders > 0) {
    return;
  }

  const category = await Category.findOneAndUpdate(
    { slug: "demo-orders" },
    {
      $setOnInsert: {
        name: "Demo Orders",
        slug: "demo-orders",
        description: "Products generated for sample admin orders",
        status: "active",
      },
    },
    { new: true, upsert: true }
  );

  const products = await Promise.all(
    sampleProducts.map((product) =>
      Product.findOneAndUpdate(
        { sku: product.sku },
        {
          $setOnInsert: {
            ...product,
            category: category._id,
            lowStockThreshold: 10,
            status: "active",
            tags: ["demo"],
          },
        },
        { new: true, upsert: true }
      )
    )
  );

  await Category.findByIdAndUpdate(category._id, { productCount: products.length });

  const customers = await Promise.all(
    sampleCustomers.map((customer) =>
      Customer.findOneAndUpdate(
        { email: customer.email },
        {
          $setOnInsert: {
            ...customer,
            addresses: [
              {
                type: "shipping",
                isDefault: true,
                fullName: `${customer.firstName} ${customer.lastName}`,
                phone: customer.phone,
                address: "123 Demo Street",
                city: "Bangkok",
                state: "Bangkok",
                postalCode: "10110",
                country: "TH",
              },
            ],
          },
        },
        { new: true, upsert: true }
      )
    )
  );

  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
  const paymentStatuses = ["pending", "paid", "paid", "paid", "refunded"] as const;
  const now = Date.now();

  for (let index = 0; index < 12; index += 1) {
    const customer = customers[index % customers.length];
    const selectedProducts = [products[index % products.length], products[(index + 1) % products.length]];
    const items = selectedProducts.map((product, itemIndex) => {
      const quantity = itemIndex + 1;
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        cost: product.cost || 0,
        quantity,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const orderNumber = await (Order as unknown as { generateOrderNumber: () => Promise<string> }).generateOrderNumber();
    const createdAt = new Date(now - index * 24 * 60 * 60 * 1000);

    await Order.create({
      orderNumber,
      customer: customer._id,
      items,
      subtotal,
      tax,
      shipping,
      discount: 0,
      total: subtotal + tax + shipping,
      status: statuses[index % statuses.length],
      paymentStatus: paymentStatuses[index % paymentStatuses.length],
      paymentMethod: index % 3 === 0 ? "cod" : "credit_card",
      trackingNumber: statuses[index % statuses.length] === "shipped" ? `TH-DEMO-${String(index + 1).padStart(6, "0")}` : undefined,
      shippingAddress: {
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        address: "123 Demo Street",
        city: "Bangkok",
        state: "Bangkok",
        postalCode: "10110",
        country: "TH",
      },
      billingAddress: {
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        address: "123 Demo Street",
        city: "Bangkok",
        state: "Bangkok",
        postalCode: "10110",
        country: "TH",
      },
      source: "web",
      createdAt,
      updatedAt: createdAt,
    });
  }

  await Promise.all(
    customers.map(async (customer) => {
      const customerOrders = await Order.find({ customer: customer._id });
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
      await Customer.findByIdAndUpdate(customer._id, {
        totalOrders: customerOrders.length,
        totalSpent,
        averageOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0,
        lastOrderDate: customerOrders[0]?.createdAt,
      });
    })
  );
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await ensureSampleOrders();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const customerId = searchParams.get("customerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    const query: Record<string, unknown> = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customerId) query.customer = customerId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (query.createdAt as Record<string, Date>).$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([Order.find(query).populate("customer", "firstName lastName email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Order.countDocuments(query)]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Generate order number
    const orderNumber = await (Order as unknown as { generateOrderNumber: () => Promise<string> }).generateOrderNumber();

    // Calculate totals
    const subtotal = body.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    const total = subtotal + (body.tax || 0) + (body.shipping || 0) - (body.discount || 0);

    const order = new Order({
      ...body,
      orderNumber,
      subtotal,
      total,
    });

    await order.save();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const orderId = String(body.id || "");
    const status = String(body.status || "");
    const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber.trim() : "";

    if (!orderId) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }

    if (!orderStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    if (status === "shipped" && !trackingNumber) {
      return NextResponse.json({ error: "Tracking number is required when marking an order as shipped" }, { status: 400 });
    }

    const update: Record<string, unknown> = { status };

    if (status === "shipped") {
      update.trackingNumber = trackingNumber;
      update.paymentStatus = "paid";
    }

    if (status === "delivered") {
      update.paymentStatus = "paid";
    }

    if (status === "refunded") {
      update.paymentStatus = "refunded";
    }

    const order = await Order.findByIdAndUpdate(orderId, { $set: update }, { new: true })
      .populate("customer", "firstName lastName email")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Orders PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
