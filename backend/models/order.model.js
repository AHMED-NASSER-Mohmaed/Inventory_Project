const mongoose=require('mongoose')

const OrderSchema = new mongoose.Schema({
	sellier:{ type:mongoose.Schema.ObjectID , required:true ,},
	status: {
      type: String,
      enum: [
        "Pending",
        "preparing",
        "OnComplete",
        "Completed",
        "OnTheWay",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    products:[ 
    {
	    productId:{type:mongoose.Schema.ObjectId, required:true , unique:true},
        //we will set this var with undefined when we are going to set order via internet for seller.
	    productName:{type:String},
	    productCode:{type:number},
	    productImage:{ type:String , default:"default.png" },
	    price:{type:Number},
	    totalPrice:{type:String},
	    requiredQty:{type:number,},
	    isAvailable:{type:Boolean , default:true},
    
    },
    ],
    totalPrice:{type:number , },
    totalQty:{type:number,},
    isAllAvailable:{ type:Boolean , default:true }
    
}, {
    timestamps: true,
  })

const order=mongoose.module("Order",OrderSchema);

module.exports=order;