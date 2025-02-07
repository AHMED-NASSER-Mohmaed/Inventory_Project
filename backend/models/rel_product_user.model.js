const mongoose=require("../mongoose");

//make realtion 

const userProductSchema=mongoose.Schema({
	customerId: {type:mongoose.Schema.ObjectId},
	productId:[ {type : mongoose.Schema.ObjectId}] ,
})


const userProduct=  mongoose.model("UserProduct",userProductSchema);

exports.userProduct=userProduct;
