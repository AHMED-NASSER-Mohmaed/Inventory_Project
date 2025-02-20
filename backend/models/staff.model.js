const mongoose=require("mongoose");
const User = require("./user.model");

const StaffSchema = new mongoose.Schema({

	managerId:{ type:mongoose.Schema.ObjectId , ref:"StaffSchema",default:null },
  SSN:{ type:String , required:true , unique:true },
  role: { type: String, enum: ["super_admin", "clerk", "cashier" , "admin"] , required: true , select:true },
    

  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: undefined },

  
},{
    timestamps: true,
  }
);




module.exports = User.discriminator("Staff", StaffSchema);
