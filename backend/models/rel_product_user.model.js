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

userProductSchema.index({ customerId: 1 });

const userProduct = mongoose.model("UserProduct", userProductSchema);

module.exports = userProduct;
