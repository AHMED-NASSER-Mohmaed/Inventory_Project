const mongoose = require("mongoose");
const validate = require("validator");

const SupplierSchema = new mongoose.Schema({
    
    companyName: { type: String, required: [true , "please provide a company name"] , unique:true,
      validate:{
        validator:uniquenessVal("companyName"),
        message: "company name is aleardy exist. Please use a different company name."
      }
     },

    email: { type: String, required:[true,"please provide a email"], unique: true,
      validate:[
        {
          validator:validator.isEmail,
          message: "Please provide a valid email address.",
        },
        {
        validator: uniquenessVal("email"),
        message: "Email already exists. Please use a different email.",
      
      }],
      }//end of email validation.
    ,

    phoneNumber: { type: String, required:[true,"please provide a company name"], unique:true,
      validate: {
        validator: uniquenessVal('phoneNumber'),
        message: "Phone number already exists. Please use a different phone number.", // Custom error message
      }
     },

    companyRegistrationNumber: { type: String, required: true, unique:true },
    
  });
  
  module.exports = mongoose.model("Supplier", SupplierSchema);

  function uniquenessVal(field){

    return async function(value){

      const selectedFileds={field:value};

      const user = await this.constructor.findOne(selectedFileds);

      return !user; // Return `true` if no user is found with passed value for  the returning fun
    }

  }

 
  
   
  