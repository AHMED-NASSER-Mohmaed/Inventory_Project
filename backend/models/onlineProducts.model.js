const mongoose = require("mongoose");

//onlineProducts 
const OnlineProductsSchema = new mongoose.Schema({

    //refernce to seller 
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },


    //reference to product 
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    
    stock: { type: Number, required: true, default: 0 },



    //actual price from the seller this one is going to appear for the customer 
    price: { type: Number, required: true },


    // Product availability from this seller

    //who can manage this --> admins only  
    isActive: { type: Boolean, default: true },

    //seller ratings.......... fairouz
    


    //default is false for the seller
    satus: {                                    // "pending", "approved", or "rejected"
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },


    branch: { type: mongoose.Schema.ObjectId, ref: "Branch", required: true },//online branches only 

}, { timestamps: true });



//very important one...
await OnlineProductsSchema.createIndex({ isActive: 1 , satus:"approved" });

model.exports= mongoose.model("OnlineProducts",SellerProductSchema);