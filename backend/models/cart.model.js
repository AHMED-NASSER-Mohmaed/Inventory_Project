const { validate } = require("./product.model");
const {User}=require("./user.model");
const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({

    products: [
      {
        product : { type:[mongoose.Schema.ObjectId, "invalid product id"] , ref:"Product" , required:true },
        requiredQty: { type: Number, required: true ,default: 1, min: [1, "Quantity cannot be less than 1"], },
      },
    ],
    
    customerId : { type : [mongoose.Schema.ObjectId,"not valid user id"] , required:true , },

    isGuest:{ type:Boolean , default:false },

    expireAt: { type: [Date,"not a valid date"] },

  },
  {
    timestamps: true,
  });

  CartSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
  
  module.exports = mongoose.model("Cart", CartSchema);
  
 