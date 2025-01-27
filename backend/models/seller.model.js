const User = require("./User");

const SellerSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    companyRegistrationNumber: { type: String, required: true},
    SSN:{type:String,required:true}
},{
    timestamps: true,
  });

module.exports = User.discriminator("Seller", SellerSchema);
