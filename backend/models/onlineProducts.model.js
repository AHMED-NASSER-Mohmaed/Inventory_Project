const mongoose = require("mongoose");

// Online Products Schema
const OnlineProductsSchema = new mongoose.Schema(
  {
    // Reference to seller
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },

    // Reference to product
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    stock: { type: Number, required: true, default: 0 },

    // Actual price from the seller (visible to the customer)
    price: { type: Number, required: true },

    // Product availability from this seller (managed by admins)
    isActive: { type: Boolean, default: true },

    // Default is "pending" for the seller
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Online branches only
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  },
  { timestamps: true }
);

// Create index on isActive and status for efficient queries
OnlineProductsSchema.index({ isActive: 1, status: 1 });
const OnlineProducts = mongoose.model("OnlineProducts", OnlineProductsSchema);
module.exports = OnlineProducts;
