const mongoose = require("mongoose");


const BranchInventorySchema = new mongoose.Schema({

    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    quantity: { type: Number, required: true, default: 0 },

    isActive:{  type:Boolean , default:true, }

}, { timestamps: true });

  
const BranchInventory = mongoose.model("BranchInventory", BranchInventorySchema);
  