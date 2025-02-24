const mongoose = require("mongoose");
const validator = require("validator");
const { APP_CONFIG } = require("../config/app.config");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the product name"],
    },
    code: {
      type: String,
      required: [true, "Please provide the product code"],
      unique: true,
    },

    markupPercentage: { type: Number, default: 0.25 },

    cost: { type: Number, require: true },

    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: 100,
    },
    images: [
      {
        fileId: { type: String, default: APP_CONFIG.UDIAMGE_ID_VALUE },

        url: {
          type: String,
          default: APP_CONFIG.PDIAMGE_URL_VALUE,

          validate: {
            validator: function (url) {
              return validator.isURL(url);
            },
            message: "Please provide valid URLs for images",
          },
        },
      },
    ],
    description: {
      type: String,
      default: "this is a good product.",
    },
    //mandatory
    category: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Please provide the product category"],
      ref: "Category", // it should be uncommented but till we make the category CRUD operations it will stay commented
    },
    brand: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Please provide the product brand"],
      ref: "Brand",
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    //default is false for the seller
    satus: {
      // "pending", "approved", or "rejected"
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Array of seller product references
    sellers: [{ type: mongoose.Schema.Types.ObjectId, ref: "SellerProduct" }],

    // Array of supplier product references
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierProduct" },
  },
  {
    timestamps: true,
  }
);

// Create a compound index on Code and category to ensure uniqueness
// for adding product also , we don't need to combine also is Active --
ProductSchema.index(
  { productCode: 1, category: 1, brand: 1 },
  { unique: true }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
