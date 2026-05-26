import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import Category from "@/lib/db/models/Category";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Try to find by ID first when the URL param is a valid ObjectId, then by slug.
    // Product detail pages pass the product slug here, and findById throws on non-ObjectId strings.
    let product = mongoose.isValidObjectId(id)
      ? await Product.findById(id).populate("category", "name slug").lean()
      : null;
    
    if (!product) {
      product = await Product.findOne({ slug: id }).populate("category", "name slug").lean();
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if SKU is being changed to an existing one
    if (body.sku && body.sku !== existingProduct.sku) {
      const skuExists = await Product.findOne({ sku: body.sku, _id: { $ne: id } });
      if (skuExists) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    // Update slug if name changed
    if (body.name && body.name !== existingProduct.name && !body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      
      // Ensure unique slug
      const slugExists = await Product.findOne({ slug: body.slug, _id: { $ne: id } });
      if (slugExists) {
        body.slug = `${body.slug}-${Date.now()}`;
      }
    }

    // Remove legacy dynamic attribute/specifications fields from updates
    delete body.attributes;
    delete body.specifications;

    // Resolve category if provided as ID, slug, or name
    if (body.category && body.category.toString() !== existingProduct.category.toString()) {
      const categoryDoc = mongoose.isValidObjectId(body.category)
        ? await Category.findById(body.category)
        : await Category.findOne({ $or: [{ slug: String(body.category) }, { name: String(body.category) }] });
      if (!categoryDoc) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      body.category = categoryDoc._id;
      // Decrement old category count
      await Category.findByIdAndUpdate(existingProduct.category, { $inc: { productCount: -1 } });
      // Increment new category count
      await Category.findByIdAndUpdate(body.category, { $inc: { productCount: 1 } });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Product PUT error:", error);
    const message = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Decrement category product count
    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
