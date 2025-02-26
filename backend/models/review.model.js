const mongoose = require("mongoose");
const OnlineProduct = require("./onlineProducts.model");

const ReviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
      required: [true, "Review must belong to a customer."],
    },
    productId: {
      type: mongoose.Schema.ObjectId, // why fairooze
      required: [true, "Review must belong to a product."],
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      minlength: [5, "Review must be at least 5 characters"],
      maxlength: [500, "Review cannot exceed 500 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ customerId: 1, productId: 1 }, { unique: true });

ReviewSchema.statics.calcAverageRatings = async function (productId) {
  // this keyword points to the current model
  const stats = await this.aggregate([
    {
      $match: { productId: productId },
    },
    {
      $group: {
        _id: "$productId",
        nRatings: { $sum: 1 },
        avgRatings: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await OnlineProduct.findByIdAndUpdate(productId, {
      rating: stats[0].avgRatings,
      ratingsQuantity: stats[0].nRatings,
    });
  }
};

ReviewSchema.post("save", function () {
  // this points to current document (review), constructor is the model (Review)
  this.constructor.calcAverageRatings(this.productId);
});

ReviewSchema.post(/^findByIdAnd/, async function (docs) {
  // docs represents the document returned by the query
  await docs.constructor.calcAverageRatings(docs.productId);
});

module.exports = mongoose.model("Review", ReviewSchema);
