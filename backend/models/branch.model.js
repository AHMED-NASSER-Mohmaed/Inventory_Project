const mongoose = require("mongoose");

const Counter = require("./counter.model"); // Import Counter model


const BranchSchema = new mongoose.Schema({

    _id: { type: Number, unique: true },
    
    // we Added a type field to distinguish main stock from sub-branches.
    //be aware -- for separation perpose 

    //the only one who can create main stock and online the supper admin 
    type: {
        type: String,
        enum: [ "main" , "sub" , "online" ],
        default: "sub",
        trim: true
    },

    registrationNumber:{ type :String , required:true  },

    // in online is going to be [[url]]

    governate: { type: Number, min: 1, max: 27, require:true , unique:true }, 

    //only one online site
    location: {
        type: String,
        required: true,
        trim: true
    },


    //we have a manget for online branch 
    //only the active one 
    admins: {
        adminWorksOnRel: { type: mongoose.Schema.ObjectId, ref: "WorksOn", default: null, },
    },

    //we have employees for our online site ...
    //only the active ones 
    employees: [
        {
            employeeWorksOnRel: { type: mongoose.Schema.ObjectId, ref: "WorksOn" },

        }],


    isActive: {
        type: Boolean,
    }


}, { timestamps: true });

module.exports = mongoose.model("Branch", BranchSchema);

BranchSchema.pre('save',function(next){

    this.isActive = this.admin? true : false ;

    next();
})

// Auto-increment ID before saving
BranchSchema.pre("save", async function (next) {
    
    if (!this._id) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: "branch" }, // Identify this counter
            { $inc: { seq: 1 } }, // Increment by 1
            { new: true, upsert: true } // Create if not exist
        );
        this._id = counter.seq; // Assign new number
    }
    next();
});

BranchSchema.index({ governate: 1, registrationNumber: 1 }, { unique: true });