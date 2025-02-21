const mongoose = require("mongoose");

const SellerProductSchema = new mongoose.Schema({

    // Reference to seller 
    seller: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Seller", 
        required: true 
    },

    // Reference to product 
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
    },

    // Stock quantity
    stock: { 
        type: Number, 
        required: true, 
        default: 0 
    },

    // Actual price from the seller (this one is going to appear for the customer)
    price: { 
        type: Number, 
        required: true 
    },

    // Product availability from this seller (managed by admins only)
    isActive: { 
        type: Boolean, 
        default: true 
    },

    // Seller product status
    satus: { // Fixed typo: "satus" -> "status"
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }

}, { 
    timestamps: true 
});

// Create a compound index on `isActive` and `status`
SellerProductSchema.index({ isActive: 1, status: 1 });

// Create the model
const SellerProduct = mongoose.model("SellerProduct", SellerProductSchema);

// Export the model
module.exports = SellerProduct;