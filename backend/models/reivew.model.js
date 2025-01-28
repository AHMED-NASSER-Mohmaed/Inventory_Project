const mongoose=require("mongoose");

const ReviewSchema=mongoose.Schema({
	customerId:{type:mongoose.Schema.ObjectId,required:true},
	productId:{type:mongoose.Schema.ObjectId,require:true},
	content:{type:String},
	rate:{type:number}

}, {
    timestamps: true,
})

module.exports=mongoose.module("Review",ReviewSchema);