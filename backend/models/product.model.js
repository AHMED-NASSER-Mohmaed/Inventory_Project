
const ProductSchema = new mongoose.Schema({
   
    name: { type: String, required: true },
    
    code: {type: String , required : true },

    price: { type: Number, required: true },
    
    images: [ { type: [String] } ], //pathes

    description: { type: String },
    
    quantity: { type: Number, required: true },
    
    categoryId: { type: mongoose.Schema.ObjectId, required: true},

    categoryName: {type:String,required:true},
    
    sellerId: { type: mongoose.Schema.ObjectId ,required:true },

    sellerName:{ type:String, required:true},

    isActive:{ type:Boolean , default:false },

    reviews:[ { reviewId:{ type:mongoose.Schema.ObjectId }}]
  },
  {
    timestamps: true,
  });
  
  const product= mongoose.model("Product", ProductSchema);
  

  module.exports =product;