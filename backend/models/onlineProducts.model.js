const mongoose = require("mongoose");
const { APP_CONFIG } = require("../config/app.config");
const AppError = require("../utils/appError");

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

    isDeleted: {type: Boolean, default: false},

    //default is false for the seller -- for us approved in case we are the people who add this product to the system 
    status: {                                    // "pending", "approved", or "rejected"
      type: String,
      enum:["pending","approved", "rejected",]
    },

    // Online branches only
    branch: { type: Number, ref: "Branch", required: true , default:APP_CONFIG.ONLINE_BRANCH_ID},
  },
  { timestamps: true }
);

// Create index on isActive and status for efficient queries
OnlineProductsSchema.index({ isActive: 1 });



OnlineProductsSchema.pre('save', function(next) {
  if (this.price < 1 && this.stock < 1) {
    throw new AppError("invalid field!", APP_CONFIG.HTTP_BAD_REQUEST);
  }
  next(); // ✅ Call next() when validation passes
});


OnlineProductsSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function (next) {
  const update = this.getUpdate();

  // Extracting values safely
  const price = update?.$set?.price ?? update?.price;
  const stock = update?.$set?.stock ?? update?.stock;

  // Validate stock and price
  if (price !== undefined && price < 1) {
    return next(new AppError("Invalid field! Price must be at least 1.", APP_CONFIG.HTTP_BAD_REQUEST));
  }
  if (stock !== undefined && stock < 0) {
    return next(new AppError("Invalid field! Stock must be greater than 0.", APP_CONFIG.HTTP_BAD_REQUEST));
  }

  next();
});



OnlineProductsSchema.index({ seller: 1, product: 1 }, { unique: true });

const OnlineProducts = mongoose.model("OnlineProducts", OnlineProductsSchema);

module.exports = OnlineProducts;
