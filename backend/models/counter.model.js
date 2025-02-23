const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true , unique:true}, // Collection name (e.g., "branch")
    seq: { type: Number, default: 3 }   // Start from 1000 (Change as needed)
});

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;
