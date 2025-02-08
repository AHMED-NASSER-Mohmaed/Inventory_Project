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
        min: [0, "Price cannot be negative"],
        default: 100,
    },
    images: [{ 
        type: String,
        validate: {
            validator: function (url) {
                return validator.isURL(url);
            },
            message: "Please provide valid URLs for images"
        }
    }],
    description: { 
        type: String , default : "this is a good product." 
    },
    quantity: { 
        type: Number, 
        // required: [true, "Please provide the product quantity"],
        min: [0, "Quantity cannot be negative"]
    },
    category: { 
        type: mongoose.Schema.ObjectId, 
        required: [true, "Please provide the product category"],
        // ref:"Category" // it should be uncommented but till we make the category CRUD operations it will stay commented
    }
    ,
    sellerId: { // there will be an object in the seller model in order to be used here when we wanna create a product without external seller
        type: mongoose.Schema.ObjectId, 
        required: [true, "Please provide the seller"] 
    },
    sellerName: { 
        type: String, 
        required: [true, "Please provide the seller name"] 
    },
    isActive: {
        type: Boolean, 
        default: false  
    },

    status: {
        type: Boolean, 
        default: false
    }
    
}, {
    timestamps: true,
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;