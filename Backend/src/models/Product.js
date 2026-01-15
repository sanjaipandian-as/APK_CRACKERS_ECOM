import mongoose from "mongoose";

const { Schema, Types } = mongoose;

/**
 * =============================================================================
 * 📝 DEVELOPER NOTES
 * =============================================================================
 * 1. SLUGS: Generated automatically via pre-save middleware.
 * Do not manually set 'slug' in controllers.
 * 2. BULK UPLOAD: Do NOT use `Product.insertMany()`. It bypasses middleware.
 * Use a loop with `new Product(data).save()` to ensure slugs/stock generate.
 * 3. STOCK: 'available_pieces' is the source of truth for checkout.
 * 'total_boxes' is for the Seller UI.
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/* SUB SCHEMAS                                                                */
/* -------------------------------------------------------------------------- */

// Flexible Specs (e.g., Burn Time, Sound Level)
const SpecificationSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },      // e.g. "Burn Time"
    key_slug: { type: String, index: true },                // e.g. "burn_time" (Auto-generated)
    value: { type: String, required: true, trim: true },    // e.g. "30 Secs"
    value_num: { type: Number },                            // e.g. 30 (Used for range filters)
    unit: { type: String, trim: true },                     // e.g. "sec"
    is_highlight: { type: Boolean, default: false },        // Show on product card?
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/* MAIN PRODUCT SCHEMA                                                        */
/* -------------------------------------------------------------------------- */

const ProductSchema = new Schema(
  {
    // ==============================
    // 🔐 OWNERSHIP & STATUS
    // ==============================
    sellerId: {
      type: Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "blocked"],
      default: "pending",
      index: true,
    },

    is_deleted: {
      type: Boolean,
      default: false,
      index: true, // Used for soft deletes
    },

    // ==============================
    // 📦 BASIC INFORMATION
    // ==============================
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      default: "Standard",
      index: true,
    },

    net_quantity: {
      type: String,
      required: true, // Display text: "10 pcs", "1 Box"
    },

    // ==============================
    // 💰 PRICING & TAX
    // ==============================
    pricing: {
      mrp: { type: Number, min: 0 },
      selling_price: {
        type: Number,
        required: true,
        min: 0,
        // Validation: Prevent Selling Price > MRP
        validate: {
          validator: function (value) {
            if (this.pricing?.mrp != null) {
              return value <= this.pricing.mrp;
            }
            return true;
          },
          message: "Selling price cannot be greater than MRP",
        },
      },
      gst_percentage: { type: Number, default: 18 },
    },

    hsn_code: {
      type: String,
      default: "3604", // Default HSN for Fireworks
    },

    // ==============================
    // 📂 CATEGORIZATION (Hybrid)
    // ==============================
    category: {
      main: { type: String, required: true, index: true },      // "Sparklers"
      main_slug: { type: String, required: true, index: true }, // "sparklers"
      sub: { type: String, index: true },                       // "10cm"
      sub_slug: { type: String, index: true },                  // "10cm"
      refId: { type: Types.ObjectId, ref: "Category" },         // Admin Reference
    },

    // ==============================
    // 🧪 SPECS & MEDIA
    // ==============================
    specifications: {
      type: [SpecificationSchema],
      default: [],
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0 && v.length <= 5,
        message: "You must upload between 1 and 5 images",
      },
    },

    video_url: { type: String, trim: true },

    // ==============================
    // 🏭 INVENTORY (Wholesale Logic)
    // ==============================
    stock_control: {
      total_boxes: { type: Number, default: 0, min: 0 },
      pieces_per_box: { type: Number, default: 1, min: 1 },
      // Calculated via middleware (boxes * pieces)
      available_pieces: { type: Number, default: 0, index: true },
      min_order_qty: { type: Number, default: 1, min: 1 },
    },

    // ==============================
    // 🔞 COMPLIANCE & DELIVERY
    // ==============================
    safety: {
      age_limit: { type: Number, default: 12 },
      instructions: String,
      explosive_class: String,
    },

    license_required: {
      type: Boolean,
      default: false,
    },

    delivery: {
      allowed: { type: Boolean, default: true },
      pickup_only: { type: Boolean, default: false },
      restricted_states: { type: [String], default: [] },
    },

    // ==============================
    // 🎉 METADATA
    // ==============================
    festival_tags: {
      type: [String],
      enum: ["Diwali", "NewYear", "Wedding", "Karthigai"],
      index: true,
    },

    is_combo: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    sold_count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* -------------------------------------------------------------------------- */
/* MIDDLEWARE (FIXED FOR MONGOOSE 8+)                                         */
/* -------------------------------------------------------------------------- */

// 🟢 FIX 1: Removed 'next' parameter and 'next()' call. 
// Using async function implicitly handles the flow.
ProductSchema.pre("save", async function () {
  
  // 1. Generate SEO-friendly Slug (with random suffix to avoid collision)
  if (this.isModified("name") || !this.slug) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Remove special chars
        .replace(/(^-|-$)+/g, "")    // Trim dashes
        + `-${randomSuffix}`;
  }

  // 2. Generate Category Slugs
  if (this.isModified("category.main")) {
    this.category.main_slug = this.category.main
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }

  if (this.category.sub && this.isModified("category.sub")) {
    this.category.sub_slug = this.category.sub
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }

  // 3. Normalize Specification Keys (e.g., "Burn Time" -> "burn_time")
  if (Array.isArray(this.specifications)) {
    this.specifications.forEach((spec) => {
      if (spec.key) {
        spec.key_slug = spec.key
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "_");
      }
    });
  }

  // 4. Calculate Total Available Pieces (Seller Dashboard Logic)
  if (
    this.isModified("stock_control.total_boxes") ||
    this.isModified("stock_control.pieces_per_box")
  ) {
    const boxes = this.stock_control.total_boxes || 0;
    const perBox = this.stock_control.pieces_per_box || 1;
    this.stock_control.available_pieces = boxes * perBox;
  }
});

// 🟢 FIX 2: Correct Error Handling for Duplicates
ProductSchema.post("save", async function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000 && error.keyPattern?.slug) {
    try {
      // Logic: If slug exists, add a new random number and UPDATE directly
      // Using updateOne prevents infinite loops of hooks
      const newRandom = Math.floor(Math.random() * 100000);
      const newSlug = `${doc.slug}-${newRandom}`;
      
      await doc.constructor.updateOne({ _id: doc._id }, { $set: { slug: newSlug } });
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next(error);
  }
});

/* -------------------------------------------------------------------------- */
/* VIRTUALS                                                                   */
/* -------------------------------------------------------------------------- */

// Calculate Discount Percentage on the fly
ProductSchema.virtual("discount_percentage").get(function () {
  const { mrp, selling_price } = this.pricing || {};
  if (!mrp || !selling_price) return 0;
  if (mrp <= selling_price) return 0;
  
  return Math.round(((mrp - selling_price) / mrp) * 100);
});

/* -------------------------------------------------------------------------- */
/* INDEXES                                                                    */
/* -------------------------------------------------------------------------- */

// 1. Full Text Search (Name, Desc, Brand, Category)
ProductSchema.index(
  { name: "text", description: "text", brand: "text", "category.main": "text" },
  { weights: { name: 10, brand: 5, "category.main": 3 } }
);

// 2. Main Browsing Filter (Optimized for active products)
ProductSchema.index(
  { "category.main_slug": 1, "pricing.selling_price": 1 },
  { partialFilterExpression: { status: "approved", is_deleted: false } }
);

// 3. Specification Filtering (e.g. Filter by "Burn Time")
ProductSchema.index({
  "specifications.key_slug": 1,
  "specifications.value_num": 1,
});

// 4. Seller Dashboard Sort
ProductSchema.index({ sellerId: 1, createdAt: -1 });

export default mongoose.model("Product", ProductSchema);