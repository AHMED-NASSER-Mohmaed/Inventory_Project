const mongoose = require("mongoose");

// offlineProducts
const OfflineProductsSchema = new mongoose.Schema({
    
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },//offline branches only 

    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    stock: { type: Number, required: true, default: 0 },

    // isActive:{  type:Boolean , default:true, }

}, { timestamps: true });



  
module.exports= mongoose.model("OfflineProducts", OfflineProductsSchema);
  