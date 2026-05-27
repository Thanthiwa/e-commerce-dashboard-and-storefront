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

    const name = body.name.trim();
    const description = body.description?.trim() || "";
    let slug = generateSlug(name, "category");

    // Ensure unique slug (append timestamp if needed)
    let uniqueSlug = slug;
    let counter = 0;
    while (await Category.findOne({ slug: uniqueSlug })) {
      counter += 1;
      uniqueSlug = `${slug}-${Date.now()}`;
      if (counter > 5) break;
    }

    const categoryData = {
      name,
      slug: uniqueSlug,
      description,
      status: "active",
      productCount: 0,
    };

    const category = new Category(categoryData);
    await category.save();

    return NextResponse.json(category.toObject(), { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const body = await request.json();

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Fetch current category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const originalName = category.name;
    const newName = body.name.trim();

    // Update properties
    category.name = newName;
    category.description = body.description?.trim() || "";

    // Only update slug if name changed
    if (newName !== originalName) {
      category.slug = generateSlug(newName, "category");

      // Ensure unique slug
      let uniqueSlug = category.slug;
      let counter = 0;
      while (await Category.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
        counter += 1;
        uniqueSlug = `${category.slug}-${Date.now()}`;
        if (counter > 5) break;
      }
      category.slug = uniqueSlug;
    }

    if (body.status) {
      category.status = body.status;
    }

    // Save the document (triggers pre-validate hooks)
    await category.save();

    return NextResponse.json(category.toObject());
  } catch (error) {
    console.error("Categories PUT error:", error);
    const message = error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Categories DELETE error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
