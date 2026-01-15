import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // ⭐ one payout per order
      index: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    commission: {
      type: Number,
      required: true,
      min: 0,
    },

    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "paid"],
      default: "pending",
      index: true,
    },

    settlementDate: {
      type: Date, // T+7 or scheduled payout date
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payout", payoutSchema);
