const BranchSchema = new mongoose.Schema({


    name: { type: String, required: true },

    // we Added a type field to distinguish main stock from sub-branches.
    //be aware -- for separation perpose 

    type: {
        type: String,
        enum: ["main", "sub", "online"],
        default: "sub"
    },

    // in online is going to be [[url]]
    location: { type: String, required: true },

    //we have a manget for online branch 
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },

    //we have employees for our online site ...
    employees: [{ employee: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" } }],


    isActive: {
        type: Boolean,
        default: true,
    }

    

}, { timestamps: true });

const Branch = mongoose.model("Branch", BranchSchema);
