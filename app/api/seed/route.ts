import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Category, Product, Customer, Order, User } from "@/lib/db/models";
import bcrypt from "bcryptjs";

// Categories data
const categoriesData = [
  { name: "Electronics", slug: "electronics", description: "Gadgets, devices, and electronic accessories", icon: "laptop" },
  { name: "Clothing", slug: "clothing", description: "Fashion apparel for all occasions", icon: "shirt" },
  { name: "Home & Garden", slug: "home-garden", description: "Home decor, furniture, and garden supplies", icon: "home" },
  { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Sporting goods and outdoor equipment", icon: "dumbbell" },
  { name: "Books & Media", slug: "books-media", description: "Books, music, movies, and digital content", icon: "book" },
];

// Products data generator
const generateProducts = (categoryIds: Record<string, string>) => [
  // Electronics
  { name: "Wireless Bluetooth Headphones", slug: "wireless-bluetooth-headphones", description: "Premium noise-canceling headphones with 30-hour battery life", price: 149.99, compareAtPrice: 199.99, category: categoryIds["electronics"], sku: "ELEC-001", stock: 150, images: ["/placeholder.svg?text=Headphones"], tags: ["wireless", "audio", "bluetooth"], featured: true },
  { name: "Smart Watch Pro", slug: "smart-watch-pro", description: "Advanced fitness tracking with heart rate monitor", price: 299.99, compareAtPrice: 349.99, category: categoryIds["electronics"], sku: "ELEC-002", stock: 80, images: ["/placeholder.svg?text=SmartWatch"], tags: ["wearable", "fitness", "smart"], featured: true },
  { name: "4K Webcam", slug: "4k-webcam", description: "Ultra HD webcam for streaming and video calls", price: 89.99, category: categoryIds["electronics"], sku: "ELEC-003", stock: 200, images: ["/placeholder.svg?text=Webcam"], tags: ["video", "streaming", "work"] },
  { name: "Mechanical Keyboard", slug: "mechanical-keyboard", description: "RGB backlit mechanical keyboard with Cherry MX switches", price: 129.99, category: categoryIds["electronics"], sku: "ELEC-004", stock: 120, images: ["/placeholder.svg?text=Keyboard"], tags: ["gaming", "typing", "rgb"] },
  
  // Clothing
  { name: "Classic Cotton T-Shirt", slug: "classic-cotton-tshirt", description: "Comfortable 100% cotton t-shirt", price: 24.99, category: categoryIds["clothing"], sku: "CLTH-001", stock: 500, images: ["/placeholder.svg?text=TShirt"], tags: ["casual", "cotton", "basics"], variants: [{ name: "Size", values: ["S", "M", "L", "XL"] }] },
  { name: "Slim Fit Jeans", slug: "slim-fit-jeans", description: "Modern slim fit denim jeans", price: 59.99, compareAtPrice: 79.99, category: categoryIds["clothing"], sku: "CLTH-002", stock: 300, images: ["/placeholder.svg?text=Jeans"], tags: ["denim", "casual", "fashion"], featured: true },
  { name: "Winter Parka Jacket", slug: "winter-parka-jacket", description: "Warm insulated parka for cold weather", price: 189.99, category: categoryIds["clothing"], sku: "CLTH-003", stock: 75, images: ["/placeholder.svg?text=Jacket"], tags: ["winter", "outerwear", "warm"] },
  { name: "Running Sneakers", slug: "running-sneakers", description: "Lightweight performance running shoes", price: 119.99, category: categoryIds["clothing"], sku: "CLTH-004", stock: 180, images: ["/placeholder.svg?text=Sneakers"], tags: ["sports", "running", "footwear"], featured: true },
  
  // Home & Garden
  { name: "Minimalist Desk Lamp", slug: "minimalist-desk-lamp", description: "LED desk lamp with adjustable brightness", price: 44.99, category: categoryIds["home-garden"], sku: "HOME-001", stock: 250, images: ["/placeholder.svg?text=Lamp"], tags: ["lighting", "office", "led"] },
  { name: "Indoor Plant Set", slug: "indoor-plant-set", description: "Set of 3 low-maintenance indoor plants", price: 49.99, category: categoryIds["home-garden"], sku: "HOME-002", stock: 100, images: ["/placeholder.svg?text=Plants"], tags: ["plants", "decor", "green"] },
  { name: "Ceramic Vase Collection", slug: "ceramic-vase-collection", description: "Handcrafted ceramic vases in various sizes", price: 79.99, category: categoryIds["home-garden"], sku: "HOME-003", stock: 60, images: ["/placeholder.svg?text=Vases"], tags: ["decor", "ceramic", "artisan"] },
  { name: "Smart Thermostat", slug: "smart-thermostat", description: "WiFi-enabled programmable thermostat", price: 149.99, category: categoryIds["home-garden"], sku: "HOME-004", stock: 90, images: ["/placeholder.svg?text=Thermostat"], tags: ["smart-home", "energy", "wifi"], featured: true },
  
  // Sports & Outdoors
  { name: "Yoga Mat Premium", slug: "yoga-mat-premium", description: "Extra thick non-slip yoga mat", price: 39.99, category: categoryIds["sports-outdoors"], sku: "SPRT-001", stock: 400, images: ["/placeholder.svg?text=YogaMat"], tags: ["yoga", "fitness", "exercise"] },
  { name: "Camping Tent 4-Person", slug: "camping-tent-4person", description: "Waterproof family camping tent", price: 199.99, compareAtPrice: 249.99, category: categoryIds["sports-outdoors"], sku: "SPRT-002", stock: 45, images: ["/placeholder.svg?text=Tent"], tags: ["camping", "outdoor", "family"], featured: true },
  { name: "Resistance Bands Set", slug: "resistance-bands-set", description: "Complete set of 5 resistance bands", price: 29.99, category: categoryIds["sports-outdoors"], sku: "SPRT-003", stock: 350, images: ["/placeholder.svg?text=Bands"], tags: ["fitness", "workout", "home-gym"] },
  { name: "Hiking Backpack 40L", slug: "hiking-backpack-40l", description: "Durable hiking backpack with rain cover", price: 89.99, category: categoryIds["sports-outdoors"], sku: "SPRT-004", stock: 120, images: ["/placeholder.svg?text=Backpack"], tags: ["hiking", "travel", "outdoor"] },
  
  // Books & Media
  { name: "JavaScript Mastery Guide", slug: "javascript-mastery-guide", description: "Complete guide to modern JavaScript development", price: 44.99, category: categoryIds["books-media"], sku: "BOOK-001", stock: 200, images: ["/placeholder.svg?text=JSBook"], tags: ["programming", "javascript", "tech"] },
  { name: "Mindfulness Journal", slug: "mindfulness-journal", description: "Guided journal for daily mindfulness practice", price: 19.99, category: categoryIds["books-media"], sku: "BOOK-002", stock: 300, images: ["/placeholder.svg?text=Journal"], tags: ["wellness", "journal", "self-help"] },
  { name: "Vinyl Record Player", slug: "vinyl-record-player", description: "Vintage-style turntable with modern features", price: 179.99, category: categoryIds["books-media"], sku: "BOOK-003", stock: 55, images: ["/placeholder.svg?text=Turntable"], tags: ["music", "audio", "vintage"], featured: true },
  { name: "Digital Art Course", slug: "digital-art-course", description: "Comprehensive online digital art course", price: 99.99, compareAtPrice: 149.99, category: categoryIds["books-media"], sku: "BOOK-004", stock: 999, images: ["/placeholder.svg?text=Course"], tags: ["education", "art", "digital"] },
];

// Customer names
const firstNames = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "Oliver", "Isabella", "Benjamin", "Mia", "Elijah", "Charlotte", "Lucas", "Amelia", "Mason", "Harper", "Logan", "Evelyn", "Alexander", "Abigail", "Ethan", "Emily", "Jacob", "Elizabeth", "Michael", "Sofia", "Daniel", "Avery", "Henry", "Ella", "Jackson", "Scarlett", "Sebastian", "Grace", "Aiden", "Chloe", "Matthew", "Victoria", "Samuel", "Riley", "David", "Aria", "Joseph", "Lily", "Carter", "Aurora", "Owen", "Zoey"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];

// Generate random date within range
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      User.deleteMany({}),
    ]);

    // Create admin user
    await User.create({
      email: "admin@example.com",
      passwordHash: "admin123", // the pre-save hook handles hashing
      name: "Admin User",
      role: "admin",
      isActive: true,
    });

    // Create categories
    const categories = await Category.insertMany(categoriesData.map((cat, index) => ({
      ...cat,
      sortOrder: index,
      status: "active",
    })));

    const categoryIds: Record<string, string> = {};
    categories.forEach((cat) => {
      categoryIds[cat.slug] = cat._id.toString();
    });

    // Update category product counts
    const productsByCategory: Record<string, number> = {};

    // Create products
    const productsData = generateProducts(categoryIds);
    const products = await Product.insertMany(productsData.map((prod) => {
      const catId = prod.category;
      productsByCategory[catId] = (productsByCategory[catId] || 0) + 1;
      return {
        ...prod,
        cost: prod.price * 0.6,
        reorderPoint: Math.floor(prod.stock * 0.2),
        status: "active",
      };
    }));

    // Update category product counts
    for (const [catId, count] of Object.entries(productsByCategory)) {
      await Category.findByIdAndUpdate(catId, { productCount: count });
    }

    // Create customers
    const customers = [];
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const createdAt = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());
      
      customers.push({
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        firstName,
        lastName,
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        addresses: [{
          type: "shipping",
          isDefault: true,
          firstName,
          lastName,
          street: `${Math.floor(100 + Math.random() * 9900)} Main Street`,
          city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][Math.floor(Math.random() * 5)],
          state: ["NY", "CA", "IL", "TX", "AZ"][Math.floor(Math.random() * 5)],
          postalCode: String(Math.floor(10000 + Math.random() * 89999)),
          country: "US",
        }],
        status: "active",
        createdAt,
      });
    }

    const createdCustomers = await Customer.insertMany(customers);

    // Create orders
    const orderStatuses = ["pending", "processing", "shipped", "delivered", "completed"];
    const orders = [];
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 100; i++) {
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const numItems = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let subtotal = 0;

      // Select random products
      const selectedProducts = [...products].sort(() => Math.random() - 0.5).slice(0, numItems);
      
      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price;
        subtotal += price * quantity;
        
        items.push({
          product: product._id,
          productName: product.name,
          sku: product.sku,
          quantity,
          price,
          total: price * quantity,
        });
      }

      const tax = subtotal * 0.08;
      const shipping = subtotal > 100 ? 0 : 9.99;
      const total = subtotal + tax + shipping;
      const createdAt = randomDate(ninetyDaysAgo, now);
      
      // Older orders more likely to be completed
      const daysSinceOrder = (now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000);
      let status: string;
      if (daysSinceOrder > 30) {
        status = Math.random() > 0.1 ? "completed" : "delivered";
      } else if (daysSinceOrder > 14) {
        status = ["shipped", "delivered", "completed"][Math.floor(Math.random() * 3)];
      } else if (daysSinceOrder > 3) {
        status = orderStatuses[Math.floor(Math.random() * 4)];
      } else {
        status = ["pending", "processing"][Math.floor(Math.random() * 2)];
      }

      const address = customer.addresses[0];

      orders.push({
        orderNumber: `ORD-${String(i + 1).padStart(5, "0")}`,
        customer: customer._id,
        items,
        shippingAddress: {
          firstName: address.firstName,
          lastName: address.lastName,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        billingAddress: {
          firstName: address.firstName,
          lastName: address.lastName,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        subtotal,
        tax,
        shipping,
        total,
        status,
        paymentStatus: status === "cancelled" ? "refunded" : "paid",
        paymentMethod: ["credit_card", "paypal", "stripe"][Math.floor(Math.random() * 3)],
        createdAt,
        updatedAt: createdAt,
      });
    }

    await Order.insertMany(orders);

    // Update customer stats
    for (const customer of createdCustomers) {
      const customerOrders = orders.filter((o) => o.customer.toString() === customer._id.toString());
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
      const orderCount = customerOrders.length;

      await Customer.findByIdAndUpdate(customer._id, {
        totalSpent,
        orderCount,
        averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
        lastOrderAt: customerOrders.length > 0 
          ? customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt 
          : null,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        categories: categories.length,
        products: products.length,
        customers: createdCustomers.length,
        orders: orders.length,
        adminUser: "admin@example.com / admin123",
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database", details: String(error) }, { status: 500 });
  }
}
