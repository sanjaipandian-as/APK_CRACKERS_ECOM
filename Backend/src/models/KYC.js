import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      unique: true, // ⭐ one KYC per seller
      index: true,
    },

    identity: {
      aadhaarFront: {
        type: String,
        trim: true,
      },
      aadhaarBack: {
        type: String,
        trim: true,
      },
      panCard: {
        type: String,
        trim: true,
      },
    },

    business: {
      tradeLicense: {
        type: String,
        trim: true,
      },
      gstCertificate: {
        type: String,
        trim: true,
      },
    },

    explosiveLicense: {
      licenseType: {
        type: String,
        trim: true,
      },
      licenseNumber: {
        type: String,
        trim: true,
      },
      licenseImage: {
        type: String,
        trim: true,
      },
      expiryDate: {
        type: Date,
      },
    },

    fireNOC: {
      nocDocument: {
        type: String,
        trim: true,
      },
      expiryDate: {
        type: Date,
      },
    },

    bank: {
      accountNumber: {
        type: String,
        trim: true,
      },
      ifsc: {
        type: String,
        trim: true,
      },
      chequeImage: {
        type: String,
        trim: true,
      },
    },

    status: {
      type: String,
      enum: [
        "not_submitted",
        "pending_review",
        "approved",
        "rejected",
        "license_expired",
      ],
      default: "not_submitted",
      index: true,
    },

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("KYC", kycSchema);
