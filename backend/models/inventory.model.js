const mongoose = require('mongoose');


const InventorySchema = new mongoose.Schema({
    
    product: { type: mongoose.Schema.ObjectId, required: true, ref: "Product" },

    providerID: { type: mongoose.Schema.ObjectId, required: true },

    providerName: { type: String, required: true },

    currentStock: { type: Number, required: true },

}, { discriminatorKey: 'providerType' });


const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
