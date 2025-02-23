const mongoose=require('mongoose')

const SupplierOrderSchema = new mongoose.Schema({

    products: [
      {
        product: { type : mongoose.Schema.ObjectId , required: true , ref:"Product" },

        qty: { type: Number, required: true },

        //dose not change over the time....
        cost: { type: Number, required: true },
        
        //driven attribute = cost * qty
        totalAmount: { type: Number, required: true },

      },
    ],

    markupPercentage: { type: Number, default: 0 },
    
    orderedDate: { type: Date,},
    arrivalDate: { type: Date ,  default: Date.now },

    supplier: { type: mongoose.Schema.ObjectId , required: true , ref:'Supplier'},

    managerId: {  type: String, required: true },

    // notes: { type: String },

  });
  
  module.exports = mongoose.model("SupplierOrder", SupplierOrderSchema);
  
  