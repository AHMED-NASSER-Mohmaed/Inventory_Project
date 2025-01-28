
const ProductSchema = new mongoose.Schema({
   
    name: { type: String, required: true },
    
    code: {type: String , required : true },

    price: { type: Number, required: true },
    
    images: [ { type: [String] }], //pathes

    description: { type: String },
    
    quantity: { type: Number, required: true },
    
    category: { type: mongoose.Schema.ObjectId, required: true , ref:'Category' },
    
    seller: {  type: mongoose.Schema.ObjectId ,required:true , ref:'Seller' },

    isActive:{ type:Boolean , default:false },

    reviews:[ { reviewId:{ type:mongoose.Schema.ObjectId }}]
  },
  {
    timestamps: true,
  });
  
  const product= mongoose.model("Product", ProductSchema);
  

  module.exports =product;