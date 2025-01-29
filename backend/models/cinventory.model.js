const mongoose = require("mongoose");


const CInventorySchema = new mongoose.Schema({

    product: { type: mongoose.Schema.ObjectId , required: true , ref:"Product" },

    providerID: { type: mongoose.Schema.ObjectId , required: true} ,

    providerName: { type: String, required: true },

    currentStock: { type: Number, required: true },
 
});

const CInventory=mongoose.model("CInventory", CInventorySchema);
  
module.exports = CInventory;
  
  