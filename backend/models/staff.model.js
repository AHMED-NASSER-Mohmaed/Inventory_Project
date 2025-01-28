const User = require("./User");

const StaffSchema = new mongoose.Schema({

	managerId:{ type:number , ref:StaffSchema },
    role: { type: String, enum: ["super_admin", "clerk", "cashier" , "manager"], required: true },
},{
    timestamps: true,
  }
);

module.exports = User.discriminator("Staff", StaffSchema);
