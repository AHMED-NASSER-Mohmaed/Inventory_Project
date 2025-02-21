const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

  orderContainer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "OrderContainer" }, 
  seller: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Seller" },

  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "partially shipped",
      "shipped",
      "delivered",
      "completed",
      "canceled",
    ],
    default: "pending",
  },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      //we will set this var with undefined when we are going to set order via internet for seller.

      quantity: { // requested quantity
        type: Number,
        required: true
      },

      // New fields for tracking fulfillment and cancellations:
      fulfilledQuantity: {
        type: Number,
        default: 0
      },

      canceledQuantity: {
        type: Number,
        default: 0
      },

      price: { type: Number }, //must be exsit for old price ...

      //driven attribute 
      totalPrice: { type: Number }, // changed from String to Number

    },

  ],

  totalPrice: { type: Number, required: true, default: 0},

  totalQty: { type: Number, required: true, default: 0 },

  clerk: { type: mongoose.Schema.Types.ObjectId, default: null, },  // clerk would be the seller in case of external seller

  cashier: { type: mongoose.Schema.Types.ObjectId, default: null, }, // Changed from String to ObjectId (in case of external seller) to take our rate

}, {
  timestamps: true,
})

const Order = mongoose.model("Order", OrderSchema); // Corrected mongoose.module to mongoose.model

module.exports = Order; // Corrected module. Exports to module.exports