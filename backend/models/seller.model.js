const mongoose = require("mongoose");
const User = require("./user.model");

const SellerSchema = new mongoose.Schema(
  {
    SSN: { type: String, required: true, unique: true,},
    companyName: { type: String, required: true },
    companyRegistrationNumber: { type: String, required: true },
    status:{
      type: Boolean,
      default: false,
      select: false,
    }
  },
  {
    timestamps: true,
  }
);

 
// SellerSchema.index({ SSN: 1 }, { unique: true, partialFilterExpression: { kind: "Seller" } });


module.exports = User.discriminator("Seller", SellerSchema);
