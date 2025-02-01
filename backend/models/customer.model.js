const mongoose = require("mongoose");
const User = require("./user.model");

const customerSchema = new mongoose.Schema({
  wishlist: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
});

const customer = User.discriminator("Customer", customerSchema);

module.exports = customer;
