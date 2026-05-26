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

// GET current user profile
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getSecretKey());
    
    // Check for demo user
    if (payload.userId === "demo-customer-id") {
      return NextResponse.json({
        user: {
          id: "demo-customer-id",
          email: "customer@example.com",
          firstName: "Demo",
          lastName: "Customer",
          phone: "123-456-7890",
          avatar: "",
          addresses: [
            {
              _id: "demo-address-1",
              type: "shipping",
              isDefault: true,
              fullName: "Demo Customer",
              address: "123 Main St",
              city: "Bangkok",
              state: "BKK",
              postalCode: "10110",
              country: "TH",
              phone: "123-456-7890"
            }
          ]
        }
      });
    }

    await dbConnect();
    const customer = await Customer.findById(payload.userId);
    
    if (!customer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: customer });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// UPDATE current user profile details
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getSecretKey());
    
    if (payload.userId === "demo-customer-id") {
      return NextResponse.json({ error: "Demo user cannot be updated" }, { status: 403 });
    }

    const data = await request.json();
    
    await dbConnect();
    
    // Only allow specific fields to be updated
    const updateData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatar: data.avatar
    };
    
    const customer = await Customer.findByIdAndUpdate(
      payload.userId, 
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ user: customer });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
