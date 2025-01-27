const mongoose = required("mongoose")


const SInventorySchema = new mongoose.Schema({

    productID: { type: mongoose.Schema.ObjectId , required: true},

    providerID: { type: mongoose.Schema.ObjectId , required: true},

    providerName: { type: String, required: true },

    productCode: {type:String , required:true},

    productName: { type: String, required: true },

    currentStock: { type: Number, required: true },
 
});
  
module.exports = mongoose.model("SInventory", SInventorySchema);
  
  