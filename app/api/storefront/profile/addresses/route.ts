import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import dbConnect from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";

const AUTH_SECRET = process.env.AUTH_SECRET || "your-secret-key-min-32-characters-long";
const SESSION_COOKIE = "storefront_session";

function getSecretKey() {
  return new TextEncoder().encode(AUTH_SECRET);
}

// Add a new address
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getSecretKey());
    
    if (payload.userId === "demo-customer-id") {
      return NextResponse.json({ error: "Demo user cannot add addresses" }, { status: 403 });
    }

    const data = await request.json();
    
    await dbConnect();
    
    const customer = await Customer.findById(payload.userId);
    if (!customer) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Handle isDefault logic
    if (data.isDefault) {
      customer.addresses.forEach(addr => {
        if (addr.type === data.type) addr.isDefault = false;
      });
    }

    // Add new address
    customer.addresses.push(data);
    await customer.save();
    
    return NextResponse.json({ addresses: customer.addresses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
  }
}
