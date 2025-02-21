const mongoose = require("mongoose");
const validator = require("validator");

const SupplierSchema = new mongoose.Schema({

  companyName: {
    type: String, required: [true, "please provide a company name"], unique: true,
  },

  email: {
    type: String, required: [true, "please provide a email"], unique: true,
    validate: [validator.isEmail, "Please provide a valid email"]
  }//end of email validation.
  ,

  phoneNumber: {
    type: String, required: [true, "please provide a phone number"], unique: true,
  },

  companyRegistrationNumber: { type: String, required: true, unique: true },

  isActive: { type: Boolean, default: true },


  //product commision different from one to another....
  commissionPercentage:Number,
   

  


},{ strict: true });


module.exports = mongoose.model("Supplier", SupplierSchema);

/*
function uniquenessVal(field) {

  return async function (value) {

    const selectedFileds = { field: value };

    const user = await this.constructor.findOne(selectedFileds);

    return !user; // Return `true` if no user is found with passed value for  the returning fun
  }

}
*/


