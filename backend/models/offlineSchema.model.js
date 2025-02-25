const mongoose = require("mongoose");

// offlineProducts

const OfflineProductsSchema = new mongoose.Schema({
    
    branch: { type: Number, ref: "Branch", required: true },//offline branches only 

    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    stock: { type: Number, required: true, default: 0 },

    
}, { timestamps: true });

// OfflineProductsSchema.index({ branch: 1, _id: 1 }, { unique: true });

// isActive:{  type:Boolean , default:true, }

  
module.exports= mongoose.model("OfflineProducts", OfflineProductsSchema);
  