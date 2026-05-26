import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  variant?: string;
}

export interface IShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  profit: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  notes?: string;
  // Analytics fields
  source?: string;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    variant: {
      type: String,
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(v: IOrderItem[]) => v.length > 0, "Order must have at least one item"],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    billingAddress: {
      type: ShippingAddressSchema,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    source: {
      type: String,
      enum: ["web", "mobile", "pos", "phone", "other"],
      default: "web",
    },
    couponCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries and analytics
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customer: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "items.product": 1 });
// Compound indexes for analytics
OrderSchema.index({ createdAt: -1, status: 1 });
OrderSchema.index({ customer: 1, createdAt: -1 });

// Static method to generate order number
OrderSchema.statics.generateOrderNumber = async function () {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const prefix = `ORD-${year}${month}${day}`;

  // Find the latest order with this prefix
  const latestOrder = await this.findOne({
    orderNumber: { $regex: `^${prefix}` },
  }).sort({ orderNumber: -1 });

  let sequence = 1;
  if (latestOrder) {
    const lastSequence = parseInt(latestOrder.orderNumber.split("-").pop() || "0", 10);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${sequence.toString().padStart(4, "0")}`;
};

// Pre-save hook to calculate profit
OrderSchema.pre("save", function () {
  if (this.isModified("items") || this.isNew) {
    const totalCost = this.items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    this.profit = this.subtotal - totalCost;
  }
});

// Method to update status
OrderSchema.methods.updateStatus = function (newStatus: OrderStatus) {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: ["refunded"],
    cancelled: [],
    refunded: [],
  };

  if (!validTransitions[this.status]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  if (newStatus === "cancelled" || newStatus === "refunded") {
    this.paymentStatus = newStatus === "refunded" ? "refunded" : this.paymentStatus;
  }
};

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
