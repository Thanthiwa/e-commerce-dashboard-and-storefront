import mongoose, { Schema, Document, Model } from "mongoose";
import { generateSlug } from "@/lib/utils/format";

export interface IProductVariant {
  name: string;
  options: string[];
  price?: number;
  quantity?: number;
}

export interface IProductMetadata {
  views: number;
  purchases: number;
  lastPurchased?: Date;
}

// Dynamic attribute types for flexible product specs
export type AttributeType = "text" | "number" | "boolean" | "select" | "multiselect" | "color" | "date";

export interface IProductAttribute {
  key: string;           // e.g., "size", "color", "material"
  label: string;         // Display name, e.g., "Size", "Color"
  type: AttributeType;   // Value type
  value: unknown;        // The actual value (flexible)
  options?: string[];    // For select/multiselect types
  unit?: string;         // e.g., "cm", "kg", "GB"
  required?: boolean;
}

export interface IProductSpecifications {
  [key: string]: unknown;  // Fully flexible key-value specs (MongoDB Mixed type)
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockThreshold: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  tags: string[];
  status: "draft" | "active" | "archived";
  variants?: IProductVariant[];
  attributes?: IProductAttribute[];     // Structured dynamic attributes
  specifications?: IProductSpecifications; // Completely flexible specs (NoSQL advantage)
  metadata: IProductMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    options: [{ type: String }],
    price: { type: Number },
    quantity: { type: Number },
  },
  { _id: false }
);

const ProductMetadataSchema = new Schema<IProductMetadata>(
  {
    views: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    lastPurchased: { type: Date },
  },
  { _id: false }
);

// Schema for structured dynamic attributes
const ProductAttributeSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["text", "number", "boolean", "select", "multiselect", "color", "date"],
      default: "text"
    },
    value: { type: Schema.Types.Mixed, required: true },
    options: [{ type: String }],
    unit: { type: String },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare at price cannot be negative"],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, "Threshold cannot be negative"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    // Structured dynamic attributes (typed, with validation)
    attributes: {
      type: [ProductAttributeSchema],
      default: [],
    },
    // Completely flexible specifications (NoSQL schemaless approach)
    // Perfect for varying product types: electronics specs, clothing sizes, food nutrition, etc.
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: ProductMetadataSchema,
      default: () => ({ views: 0, purchases: 0 }),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ProductSchema.index({ slug: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ "metadata.purchases": -1 });
ProductSchema.index({ createdAt: -1 });

// Index for attribute-based queries (sparse for products without attributes)
ProductSchema.index({ "attributes.key": 1, "attributes.value": 1 }, { sparse: true });

// Text index for search
ProductSchema.index({ name: "text", description: "text", tags: "text" });

// Pre-validate hook to generate slug before validation runs
ProductSchema.pre("validate", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = generateSlug(this.name, "product");
  }
});

// Virtual for profit margin
ProductSchema.virtual("profitMargin").get(function () {
  if (this.price === 0) return 0;
  if (typeof this.cost !== "number") return 0;
  return ((this.price - this.cost) / this.price) * 100;
});

// Virtual for low stock status
ProductSchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.lowStockThreshold;
});

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
