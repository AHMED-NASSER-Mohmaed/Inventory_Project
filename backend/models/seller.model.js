const mongoose = require("mongoose");
const User = require("./user.model");

const SellerSchema = new mongoose.Schema(
  {
    SSN: { type: String, required: true, unique:true},
    companyName: { type: String, required: true ,  unique:true},
    companyRegistrationNumber: { type: String, required: true, unique:true },
    status:{
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

 



module.exports = User.discriminator("Seller", SellerSchema);
