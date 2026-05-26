import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Category from "@/lib/db/models/Category";
import { generateSlug } from "@/lib/utils/format";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const includeAll = searchParams.get("all") === "true";

    const query: Record<string, unknown> = {};
    if (!includeAll) {
      query.status = status;
    }

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Always generate slug from name on server to avoid validation errors
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    body.slug = generateSlug(String(body.name));

    // Ensure unique slug (append timestamp if needed)
    let uniqueSlug = body.slug;
    let counter = 0;
    while (await Category.findOne({ slug: uniqueSlug })) {
      counter += 1;
      uniqueSlug = `${body.slug}-${Date.now()}`;
      if (counter > 5) break;
    }
    body.slug = uniqueSlug;

    const category = new Category(body);
    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
