const mongoose = require("mongoose");
const validator = require("validator");

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Please provide the product name"] 
    },
    code: {
        type: String, 
        required: [true, "Please provide the product code"],
        unique: true
    },
    price: { 
        type: Number, 
        required: [true, "Please provide the product price"],
        min: [0, "Price cannot be negative"]
    },
    images: [{ 
        type: [String],
        validate: {
            validator: function (array) {
                return array.every(url => validator.isURL(url));
            },
            message: "Please provide valid URLs for images"
        }
    }],
    description: { 
        type: String 
    },
    quantity: { 
        type: Number, 
        required: [true, "Please provide the product quantity"],
        min: [0, "Quantity cannot be negative"]
    },
    category: { 
        type: mongoose.Schema.ObjectId, 
        required: [true, "Please provide the product category"], 
        ref: 'Category' 
    },
    seller: {  // there will be an object in the seller model in order to used here when we wanna create a product without external seller
        type: mongoose.Schema.ObjectId, 
        required: [true, "Please provide the seller"], 
        ref: 'Seller' 
    },
    isActive: {
        type: Boolean, 
        default: false  
    }
}, {
    timestamps: true,
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;