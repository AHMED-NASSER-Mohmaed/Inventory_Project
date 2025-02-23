const mongoose = require("mongoose");


const brandSchema = new mongoose.Schema({
    
    Bname: { type: String, required: true, unique: true },

    isActive: { type: Boolean, default: false },  // Soft delete field


},{
    timestamps:true
});

module.exports.Brand= mongoose.model('Brand',brandSchema);

