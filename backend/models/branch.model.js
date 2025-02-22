const mongoose = require("mongoose");

const { APP_CONFIG } = require("../config/app.config");

const validator = require('validator');

const BranchSchema = new mongoose.Schema({

    name: { type: String, default: APP_CONFIG.COMPANYNAME, trim: true },

    // we Added a type field to distinguish main stock from sub-branches.
    //be aware -- for separation perpose 

    //the only one who can create main stock and online the supper admin 
    type: {
        type: String,
        enum: [ "main" , "sub" , "online"],
        default: "sub",
        trim: true
    },

    registrationNumber:{ type :Number , required:true  },

    // in online is going to be [[url]]

    governate: { type: Number, min: 1, max: 27 },

    //only one online site
    location: {
        type: String,
        required: true,
        validate: {
            validator: function (field) {
                if (this.type === 'online') {
                    return validator.isURL(field); // Properly call isURL function
                }
                return true; // Allow other types of locations
            },
            message: "Invalid location"
        },
        trim: true
    },


    //we have a manget for online branch 
    //only the active one 
    admins: {
        adminWorksOnRel: { type: mongoose.Schema.ObjectId, ref: "WorksOn", default: null, },
    }
    ,

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

BranchSchema.index({ governate: 1, registrationNumber: 1 }, { unique: true });