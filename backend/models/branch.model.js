const mongoose= require("mongoose");

const { APP_CONFIG } = require("../config/app.config");

const validator = require('validator');

const BranchSchema = new mongoose.Schema({

    name: { type: String, default: APP_CONFIG.COMPANYNAME , trim: true },

    // we Added a type field to distinguish main stock from sub-branches.
    //be aware -- for separation perpose 

    type: {
        type: String,
        enum: ["main", "sub", "online"],
        default: "sub",
        required:true,
        trim: true
    },

    // in online is going to be [[url]]
    

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
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" , default:null,},

    //we have employees for our online site ...
    employees: [{ employee: { type: mongoose.Schema.ObjectId, ref: "Staff" , default:null} }],


    isActive: {
        type: Boolean,
        default: true,
        validate: {
            validator: function () {
                return this.isActive ? !!this.admin : true;
            },
            message: "An active branch must have an admin."
        }
    }
    


}, { timestamps: true });

module.exports= mongoose.model("Branch", BranchSchema);
