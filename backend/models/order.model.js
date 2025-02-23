const { type } = require('jquery');
const mongoose = require('mongoose');
const { validate } = require('./branch.model');

const OrderSchema = new mongoose.Schema({

  sellier: { type: mongoose.Schema.ObjectID, required: true, },

  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "partially shipped",
      "shipped",
      "delivered",
      "completed",
      "canceled"
    ],
    default: "pending",
  },



  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true
      },
      //we will set this var with undefined when we are going to set order via internet for seller.

      quantity: {
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
      totalPrice: { type: String }, // calculated from price*fullfiledQty


    },

  ],

  totalPrice: { type: number, },

  totalQty: { type: number, },

  clerck: { type: mongoose.Schema.ObjectId, },



  cashier: { type: String, required: true, default: null, },

}, {
  timestamps: true,
})

const order = mongoose.module("Order", OrderSchema);

module.exports = order;