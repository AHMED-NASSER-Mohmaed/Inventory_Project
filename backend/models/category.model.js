const mongoose=required("mongoose");

const CategorySchema = new mongoose.Schema({

    parentCatId:{ type:mongoose.Schema.ObjectId , default:null , ref:"Category"},
    name: { type: String, required: true },

});
  
module.exports = mongoose.model("Category", CategorySchema);
  

  