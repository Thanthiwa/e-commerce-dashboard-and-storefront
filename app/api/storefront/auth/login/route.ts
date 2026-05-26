import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const AUTH_SECRET = process.env.AUTH_SECRET || "your-secret-key-min-32-characters-long";
const SESSION_COOKIE = "storefront_session";
const SESSION_EXPIRY = "7d";

function getSecretKey() {
  return new TextEncoder().encode(AUTH_SECRET);
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Demo bypass for Storefront Customer
    if (email === "customer@example.com" && password === "customer123") {
      const token = await new SignJWT({
        userId: "demo-customer-id",
        email: "customer@example.com",
        name: "Demo Customer",
        role: "customer"
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(SESSION_EXPIRY)
        .sign(getSecretKey());

      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: {
          id: "demo-customer-id",
          email: "customer@example.com",
          name: "Demo Customer",
        },
      });
    }

    await dbConnect();

    const customer = await Customer.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    if (!customer || !customer.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, customer.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create token
    const token = await new SignJWT({
      userId: customer._id.toString(),
      email: customer.email,
      name: customer.firstName + " " + customer.lastName,
      role: "customer"
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(SESSION_EXPIRY)
      .sign(getSecretKey());

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: customer._id,
        email: customer.email,
        name: customer.firstName + " " + customer.lastName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
