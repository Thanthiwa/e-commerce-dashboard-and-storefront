import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Connect to Database
    try {
      await dbConnect();
    } catch (dbError) {
      console.error("Database connection error during registration:", dbError);
      return NextResponse.json(
        { error: "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas." },
        { status: 500 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new customer
    const newCustomer = await Customer.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      addresses: [],
      tags: ["new-registration"],
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: newCustomer._id,
        email: newCustomer.email,
        name: newCustomer.firstName + " " + newCustomer.lastName,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle MongoDB duplicate key error specifically if it happens despite the check
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to register account" }, { status: 500 });
  }
}
