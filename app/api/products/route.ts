import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import Category from "@/lib/db/models/Category";
import { generateSlug } from "@/lib/utils/format";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    // Dynamic attribute filters (e.g., ?attr_color=red&attr_size=large)
    const attributeFilters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_")) {
        attributeFilters[key.replace("attr_", "")] = value;
      }
    });

    // Build query
    const query: Record<string, unknown> = {};

    if (category) {
      const categoryDoc = mongoose.isValidObjectId(category)
        ? await Category.findById(category)
        : await Category.findOne({ $or: [{ slug: category }, { name: category }] });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Apply dynamic attribute filters
    if (Object.keys(attributeFilters).length > 0) {
      query.$and = Object.entries(attributeFilters).map(([key, value]) => ({
        attributes: {
          $elemMatch: {
            key: key,
            value: isNaN(Number(value)) ? value : Number(value),
          },
        },
      }));
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Always generate slug from name on server if name present
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    body.slug = generateSlug(String(body.name));

    // Ensure unique slug (append timestamp if needed)
    const existing = await Product.findOne({ slug: body.slug });
    if (existing) {
      body.slug = `${body.slug}-${Date.now()}`;
    }

    // Resolve category if provided as ID, slug, or name
    if (body.category) {
      const categoryDoc = mongoose.isValidObjectId(body.category)
        ? await Category.findById(body.category)
        : await Category.findOne({ $or: [{ slug: String(body.category) }, { name: String(body.category) }] });
      if (!categoryDoc) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      body.category = categoryDoc._id;
    }

    // Ensure unique slug
    const existingSlug = await Product.findOne({ slug: body.slug });
    if (existingSlug) {
      body.slug = `${body.slug}-${Date.now()}`;
    }

    // Ensure unique SKU
    const existingSku = await Product.findOne({ sku: body.sku });
    if (existingSku) {
      return NextResponse.json(
        { error: "A product with this SKU already exists" },
        { status: 400 }
      );
    }

    // Remove legacy dynamic attribute/specifications fields
    delete body.attributes;
    delete body.specifications;

    const product = new Product(body);
    await product.save();

    // Update category product count
    if (body.category) {
      await Category.findByIdAndUpdate(body.category, { $inc: { productCount: 1 } });
    }

    // Populate category before returning
    await product.populate("category", "name slug");

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
