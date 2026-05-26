import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Demo bypass
    if (email === "admin@example.com" && password === "admin123") {
      const mockUser = {
        _id: { toString: () => "demo-admin-id" },
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      };
      
      // @ts-ignore - mock user for demo
      await createSession(mockUser);
      return NextResponse.json({
        success: true,
        user: {
          id: mockUser._id.toString(),
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    }

    await dbConnect();

    // Find user and check password using the static method
    // Requires ignoring TS error if static method is not fully typed in the Model interface,
    // but let's do it manually just to be safe with types if they aren't perfect
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is not active" }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create session
    await createSession(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
