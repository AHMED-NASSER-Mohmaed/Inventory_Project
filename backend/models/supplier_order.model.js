const mongoose=require('mongoose')

const SupplierOrderSchema = new mongoose.Schema({

    products: [
      {
        product: { type : mongoose.Schema.ObjectId , required: true , ref:"Product" },

        reqQty: { type: Number, required: true },

        originalPrice: { type: Number, required: true },
        
        totalAmount: { type: Number, required: true },

      },
    ],

    /*
    status: {

      type: String,

      enum: ["Pending", "Delivered", "Cancelled"],

      default: "Pending",

    },

    */
    orderedDate: { type: Date, default: Date.now },
    arrivalDate: { type: Date },

    supplier: { type: mongoose.Schema.ObjectId , required: true , ref:'Supplier'},

    managerId: {  type: String, required: true },

    notes: { type: String },

  });
  
  module.exports = mongoose.model("SupplierOrder", SupplierOrderSchema);
  
  