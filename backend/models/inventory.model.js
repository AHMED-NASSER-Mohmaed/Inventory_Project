const mongoose = require('mongoose');


const InventorySchema = new mongoose.Schema({
    
    product: { 
        type: mongoose.Schema.ObjectId, 
        required: [true, "Please provide the product"], 
        ref: "Product" 
    },
    providerID: { 
        type: mongoose.Schema.ObjectId, 
        required: [true, "Please provide the provider ID"] 
    },
    providerName: { 
        type: String, 
        required: [true, "Please provide the provider name"] 
    },
    currentStock: { 
        type: Number, 
        required: [true, "Please provide the current stock"],
        min: [0, "Current stock cannot be negative"]
    }

}, { discriminatorKey: 'providerType' });


const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
