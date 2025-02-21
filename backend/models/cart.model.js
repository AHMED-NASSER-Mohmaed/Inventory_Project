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
    // session id 
    // 

    cartType: { type: String, enum: ['online', 'offline'], required: true },

    isGuest:{ type:Boolean , default:false },

    clerck: { type: mongoose.Schema.ObjectId,required: true },

    cashier: { type: String, 

      validate:function(){
        
        if(this.cartType == "online" && !cashier)
          return true;

        return false;
      }
      
     },

    branch: { type: mongoose.Schema.ObjectId, ref: "Branch" ,required: true },



    expireAt: { type: [Date,"not a valid date"] },

  },
  {
    timestamps: true,
  });

  CartSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
  
  module.exports = mongoose.model("Cart", CartSchema);
  
 