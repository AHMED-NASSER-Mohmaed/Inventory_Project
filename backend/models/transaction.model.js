const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    orderContainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderContainer",
    },
    stripeSessionId: { type: String },
    amount: { type: Number }, // Amount in cents
    currency: { type: String },
    paymentStatus: { type: String },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
