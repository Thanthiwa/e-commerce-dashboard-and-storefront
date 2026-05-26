import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  type: "billing" | "shipping";
  isDefault: boolean;
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ICustomer extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  addresses: IAddress[];
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  tags: string[];
  segment?: string;
  // RFM metrics (for data mining)
  rfm?: {
    recency: number; // Days since last purchase
    frequency: number; // Number of purchases
    monetary: number; // Total amount spent
    score?: string; // Combined RFM score
  };
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    type: {
      type: String,
      enum: ["billing", "shipping"],
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  // Remove { _id: false } to allow Mongoose to generate _id for addresses
);

const CustomerSchema = new Schema<ICustomer>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    passwordHash: {
      type: String,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
    segment: {
      type: String,
      enum: ["Champions", "Loyal", "Potential", "New", "At-Risk", "Lost", null],
      default: null,
    },
    rfm: {
      recency: { type: Number, default: 0 },
      frequency: { type: Number, default: 0 },
      monetary: { type: Number, default: 0 },
      score: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ segment: 1 });
CustomerSchema.index({ totalSpent: -1 });
CustomerSchema.index({ lastOrderDate: -1 });
CustomerSchema.index({ "rfm.score": 1 });
CustomerSchema.index({ createdAt: -1 });

// Virtual for full name
CustomerSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to update order statistics
CustomerSchema.methods.updateOrderStats = function (orderTotal: number) {
  this.totalOrders += 1;
  this.totalSpent += orderTotal;
  this.averageOrderValue = this.totalSpent / this.totalOrders;
  this.lastOrderDate = new Date();
};

// Method to calculate RFM
CustomerSchema.methods.calculateRFM = function () {
  const now = new Date();
  const daysSinceLastOrder = this.lastOrderDate
    ? Math.floor((now.getTime() - this.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  this.rfm = {
    recency: daysSinceLastOrder,
    frequency: this.totalOrders,
    monetary: this.totalSpent,
  };

  // Simple RFM scoring (1-5 scale for each)
  const rScore = daysSinceLastOrder <= 30 ? 5 : daysSinceLastOrder <= 90 ? 4 : daysSinceLastOrder <= 180 ? 3 : daysSinceLastOrder <= 365 ? 2 : 1;
  const fScore = this.totalOrders >= 10 ? 5 : this.totalOrders >= 5 ? 4 : this.totalOrders >= 3 ? 3 : this.totalOrders >= 2 ? 2 : 1;
  const mScore = this.totalSpent >= 1000 ? 5 : this.totalSpent >= 500 ? 4 : this.totalSpent >= 200 ? 3 : this.totalSpent >= 50 ? 2 : 1;

  this.rfm.score = `${rScore}${fScore}${mScore}`;

  // Determine segment based on RFM score
  const avgScore = (rScore + fScore + mScore) / 3;
  if (avgScore >= 4.5) this.segment = "Champions";
  else if (avgScore >= 3.5) this.segment = "Loyal";
  else if (avgScore >= 2.5 && rScore >= 4) this.segment = "Potential";
  else if (this.totalOrders === 1 && daysSinceLastOrder <= 30) this.segment = "New";
  else if (avgScore >= 2.5 && rScore <= 2) this.segment = "At-Risk";
  else this.segment = "Lost";
};

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
