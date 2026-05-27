import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Category, Customer, Order, Product } from "@/lib/db/models";

const monthLabels = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

async function ensureDashboardData() {
  const orderCount = await Order.countDocuments({});
  if (orderCount > 0) {
    return;
  }

  const category = await Category.findOneAndUpdate(
    { slug: "dashboard-demo" },
    {
      $setOnInsert: {
        name: "Dashboard Demo",
        slug: "dashboard-demo",
        description: "Demo data for dashboard",
        status: "active",
      },
    },
    { new: true, upsert: true }
  );

  const products = await Promise.all(
    [
      { name: "Wireless Bluetooth Headphones", slug: "dashboard-demo-headphones", sku: "DASH-001", price: 1490, cost: 850, quantity: 42 },
      { name: "Smart Watch Pro", slug: "dashboard-demo-watch", sku: "DASH-002", price: 2990, cost: 1600, quantity: 28 },
      { name: "Mechanical Keyboard", slug: "dashboard-demo-keyboard", sku: "DASH-003", price: 1290, cost: 700, quantity: 65 },
      { name: "Minimalist Desk Lamp", slug: "dashboard-demo-lamp", sku: "DASH-004", price: 690, cost: 320, quantity: 120 },
    ].map((product) =>
      Product.findOneAndUpdate(
        { sku: product.sku },
        {
          $setOnInsert: {
            ...product,
            description: `${product.name} for dashboard demo`,
            category: category._id,
            lowStockThreshold: 10,
            images: ["/placeholder.svg"],
            tags: ["dashboard"],
            status: "active",
          },
        },
        { new: true, upsert: true }
      )
    )
  );

  await Category.findByIdAndUpdate(category._id, { productCount: products.length });

  const customers = await Promise.all(
    [
      { email: "dashboard.john@example.com", firstName: "John", lastName: "Smith", phone: "081-111-1111" },
      { email: "dashboard.sarah@example.com", firstName: "Sarah", lastName: "Johnson", phone: "082-222-2222" },
      { email: "dashboard.michael@example.com", firstName: "Michael", lastName: "Brown", phone: "083-333-3333" },
    ].map((customer) =>
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
                address: "123 Dashboard Street",
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

  const now = new Date();
  const statuses = ["pending", "processing", "shipped", "delivered"] as const;

  for (let index = 0; index < 18; index += 1) {
    const customer = customers[index % customers.length];
    const product = products[index % products.length];
    const secondProduct = products[(index + 1) % products.length];
    const createdAt = new Date(now.getFullYear(), now.getMonth() - (index % 6), Math.max(1, 25 - index));
    const items = [product, secondProduct].map((item, itemIndex) => ({
      product: item._id,
      name: item.name,
      price: item.price,
      cost: item.cost || 0,
      quantity: itemIndex + 1,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 1500 ? 0 : 50;
    const orderNumber = await (Order as unknown as { generateOrderNumber: () => Promise<string> }).generateOrderNumber();

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
      paymentStatus: index % 4 === 0 ? "pending" : "paid",
      paymentMethod: index % 3 === 0 ? "cod" : "credit_card",
      shippingAddress: {
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        address: "123 Dashboard Street",
        city: "Bangkok",
        state: "Bangkok",
        postalCode: "10110",
        country: "TH",
      },
      billingAddress: {
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        address: "123 Dashboard Street",
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
}

function getGrowth(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function GET() {
  try {
    await dbConnect();
    await ensureDashboardData();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prevThirtyDays = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfYearlyRevenue = new Date(now.getFullYear() - 3, 0, 1);
    const latestRevenueOrder = await Order.findOne({ status: { $nin: ["cancelled", "refunded"] } })
      .sort({ createdAt: -1 })
      .select("createdAt")
      .lean();
    const dailyReferenceDate = latestRevenueOrder?.createdAt ? new Date(latestRevenueOrder.createdAt) : now;
    const startOfDailyRevenue = getMonthStart(dailyReferenceDate);
    const endOfDailyRevenue = getMonthEnd(dailyReferenceDate);

    const [
      currentRevenueResult,
      previousRevenueResult,
      ordersThisPeriod,
      ordersPreviousPeriod,
      customersThisPeriod,
      customersPreviousPeriod,
      totalCustomers,
      productsThisPeriod,
      productsPreviousPeriod,
      totalProducts,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "refunded"] }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "refunded"] }, createdAt: { $gte: prevThirtyDays, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: prevThirtyDays, $lt: thirtyDaysAgo } }),
      Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Customer.countDocuments({ createdAt: { $gte: prevThirtyDays, $lt: thirtyDaysAgo } }),
      Customer.countDocuments({}),
      Product.countDocuments({ status: "active", createdAt: { $gte: thirtyDaysAgo } }),
      Product.countDocuments({ status: "active", createdAt: { $gte: prevThirtyDays, $lt: thirtyDaysAgo } }),
      Product.countDocuments({ status: "active" }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer", "firstName lastName email")
        .lean(),
      Product.find({ $expr: { $lte: ["$quantity", "$lowStockThreshold"] } })
        .select("name sku quantity lowStockThreshold")
        .limit(10)
        .lean(),
    ]);

    const currentRevenue = currentRevenueResult[0]?.total || 0;
    const previousRevenue = previousRevenueResult[0]?.total || 0;

    const [dailyRevenueRaw, monthlyRevenueRaw, yearlyRevenueRaw] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: { $nin: ["cancelled", "refunded"] },
            createdAt: { $gte: startOfDailyRevenue, $lte: endOfDailyRevenue },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Bangkok" } },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "refunded"] }, createdAt: { $gte: startOfYear } } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "refunded"] }, createdAt: { $gte: startOfYearlyRevenue } } },
        {
          $group: {
            _id: { $year: "$createdAt" },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const dailyRevenueByDate = new Map(dailyRevenueRaw.map((item) => [String(item._id), Number(item.revenue || 0)]));
    const daysInDailyMonth = endOfDailyRevenue.getDate();
    const dailyRevenue = Array.from({ length: daysInDailyMonth }, (_, index) => {
      const date = new Date(startOfDailyRevenue);
      date.setDate(startOfDailyRevenue.getDate() + index);

      return {
        label: date.toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
        revenue: dailyRevenueByDate.get(getDateKey(date)) || 0,
      };
    });

    const monthlyRevenueByMonth = new Map(monthlyRevenueRaw.map((item) => [Number(item._id), Number(item.revenue || 0)]));
    const monthlyRevenue = monthLabels.map((month, index) => ({
      label: month,
      revenue: monthlyRevenueByMonth.get(index + 1) || 0,
    }));

    const yearlyRevenueByYear = new Map(yearlyRevenueRaw.map((item) => [Number(item._id), Number(item.revenue || 0)]));
    const yearlyRevenue = Array.from({ length: 5 }, (_, index) => {
      const year = now.getFullYear() - 3 + index;

      return {
        label: String(year + 543),
        revenue: yearlyRevenueByYear.get(year) || 0,
      };
    });

    const salesByCategory = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled", "refunded"] }, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
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
          _id: { $ifNull: ["$category.name", "ไม่ระบุหมวดหมู่"] },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    const totalCategoryRevenue = salesByCategory.reduce((sum, category) => sum + Number(category.revenue || 0), 0);

    const topProducts = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled", "refunded"] }, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      summary: {
        totalRevenue: currentRevenue,
        revenueGrowth: getGrowth(currentRevenue, previousRevenue),
        ordersThisMonth: ordersThisPeriod,
        ordersGrowth: getGrowth(ordersThisPeriod, ordersPreviousPeriod),
        totalCustomers,
        customersGrowth: getGrowth(customersThisPeriod, customersPreviousPeriod),
        totalProducts,
        productsGrowth: getGrowth(productsThisPeriod, productsPreviousPeriod),
        averageOrderValue: ordersThisPeriod > 0 ? currentRevenue / ordersThisPeriod : 0,
      },
      recentOrders: recentOrders.map((order: any) => ({
        id: String(order._id),
        orderNumber: order.orderNumber,
        customer: order.customer ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim() : "ไม่ระบุลูกค้า",
        email: order.customer?.email || "",
        total: order.total,
        status: order.status,
        date: order.createdAt,
      })),
      salesByCategory: salesByCategory.map((category, index) => ({
        name: category._id,
        revenue: category.revenue,
        orders: category.orders,
        value: totalCategoryRevenue > 0 ? Number(((category.revenue / totalCategoryRevenue) * 100).toFixed(1)) : 0,
        color: ["oklch(0.696 0.17 162.48)", "oklch(0.488 0.243 264.376)", "oklch(0.769 0.188 70.08)", "oklch(0.627 0.265 303.9)", "oklch(0.645 0.246 16.439)"][index],
      })),
      dailyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      topProducts: topProducts.map((product) => ({
        id: String(product._id || product.name),
        name: product.name,
        sku: product.product?.sku,
        sales: product.sales,
        revenue: product.revenue,
        stock: product.product?.quantity,
      })),
      lowStockProducts: lowStockProducts.map((product: any) => ({
        id: String(product._id),
        name: product.name,
        sku: product.sku,
        stock: product.quantity,
        reorderPoint: product.lowStockThreshold,
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
