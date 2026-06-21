import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = process.env.AUTH_SECRET || "your-secret-key-min-32-characters-long";
const SESSION_COOKIE = "admin_session";

function getSecretKey() {
  return new TextEncoder().encode(AUTH_SECRET);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth routes
  if (pathname === "/admin/login" || pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  // Public storefront reads should stay accessible without an admin session.
  if (
    request.method === "GET" &&
    (pathname.startsWith("/api/products") || pathname.startsWith("/api/categories"))
  ) {
    return NextResponse.next();
  }

  // Check if it's an admin page or protected API route
  const isAdminPage = pathname.startsWith("/admin");
  // Assuming these are protected API routes
  const isProtectedApi = pathname.startsWith("/api/analytics") || pathname.startsWith("/api/products") || pathname.startsWith("/api/categories") || pathname.startsWith("/api/orders") || pathname.startsWith("/api/customers");

  if (!isAdminPage && !isProtectedApi) {
    // Let everything else (like storefront) pass through
    return NextResponse.next();
  }

  // Get the session token
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    // Redirect to login for pages, return 401 for API routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    // Verify the token
    const { payload } = await jwtVerify(token, getSecretKey());

    // You can add role-based checking here if needed
    // if (pathname.startsWith("/api/analytics") && payload.role !== "admin") ...

    // Add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId as string);
    response.headers.set("x-user-role", payload.role as string);

    // If user is trying to access /admin/login while already logged in
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    
    // Redirect /admin to /admin/dashboard
    if (pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return response;
  } catch {
    // Invalid token - clear it and redirect
    const response = pathname.startsWith("/api/") ? NextResponse.json({ error: "Unauthorized" }, { status: 401 }) : NextResponse.redirect(new URL("/admin/login", request.url));

    response.cookies.delete(SESSION_COOKIE);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
