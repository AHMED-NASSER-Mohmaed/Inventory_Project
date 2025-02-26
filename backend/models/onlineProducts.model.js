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

    //default is false for the seller -- for us approved in case we are the people who add this product to the system 
    status: {                                    // "pending", "approved", or "rejected"
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },


    // // Default is "pending" for the seller
    // status: {
    //   type: String,
    //   enum: ["pending", "approved", "rejected"],
    //   default: "pending",
    // },

    // Online branches only
    branch: { type: Number, ref: "Branch", required: true },
  },
  { timestamps: true }
);

// Create index on isActive and status for efficient queries
OnlineProductsSchema.index({ isActive: 1 });


OnlineProductsSchema.index({ seller: 1, product: 1 }, { unique: true });

const OnlineProducts = mongoose.model("OnlineProducts", OnlineProductsSchema);

module.exports = OnlineProducts;
