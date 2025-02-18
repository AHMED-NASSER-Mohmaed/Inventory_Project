const mongoose = require("mongoose");
const User = require("./user.model");

const SellerSchema = new mongoose.Schema(
  {
    
    SSN: { type: String, required: true, unique:true},
    companyName: { type: String, required: true ,  unique:true},
    companyRegistrationNumber: { type: String, required: true, unique:true },
    

    // 0 --> represent pending
    // 1 --> approved
    //-1 --> rejected

    status:{
      type: Number,
      default: 0,
    },


    /******************************************************************************/


    //online branch
    branch: { type: mongoose.Schema.Type.ObjectId, ref: "Bracnh", }
  },
  {
    timestamps: true,
  }
);

 



module.exports = User.discriminator("Seller", SellerSchema);
