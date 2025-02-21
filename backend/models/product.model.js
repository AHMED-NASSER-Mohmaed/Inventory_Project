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
    category: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Please provide the product category"],
      ref: "Category", // it should be uncommented but till we make the category CRUD operations it will stay commented
    },


    isActive: {
      type: Boolean,
      default: true,
    },


    //default is false for the seller
    satus: {                                    // "pending", "approved", or "rejected"
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

     // Array of seller product references
     sellers: [{ type: mongoose.Schema.Types.ObjectId, ref: "SellerProduct" }],

     // Array of supplier product references
     supplier: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierProduct" }, // tells wether we sell some product or not

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

  },
  {
    timestamps: true,
  }
);


// Create a compound index on Code and category to ensure uniqueness
// for adding product also , we don't need to combine also is Active --
ProductSchema.index({ productCode: 1, category: 1 }, { unique: true });


const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
