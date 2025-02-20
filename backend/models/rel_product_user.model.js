const mongoose = require("mongoose");

const userProductSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.ObjectId,
  },
  productIds: [
    {
      type: mongoose.Schema.ObjectId,
    },
  ],
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

userProductSchema.index({ customerId: 1, productIds: 1 }); // for faster lookups

const userProduct = mongoose.model("UserProduct", userProductSchema);

module.exports = userProduct;
