const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema({

    
    companyName: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    
    phoneNumber: { type: String, unique: true, required: true },
    
  });
  
  module.exports = mongoose.model("Supplier", SupplierSchema);
  