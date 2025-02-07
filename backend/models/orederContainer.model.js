const mongoose = required("mongoose");

const OrderContainerSchema = new mongoose.Schema({

    customerId: { type: mongoose.Schema.ObjectId, required: true, },
    customerNotes: { type: String },
    paymentMethod: { type: String, enum: ["Cash", "Card"], required: true },
    gov: { type: String, required: true },
    address: { type: String, required: true },
    phone1: { type: String, required: true },
    phone2: { type: String,},


    sellersOrders: [
        { order: { type: mongoose.Schema.ObjectId, requried: true, unique: true, ref: "Order" } }
    ],

    

    cashierId: { type: String, required: true },

},{
    timestamps: true,
  });

  module.exports= mongoose.module("OrderContainer",OrderContainerSchema);