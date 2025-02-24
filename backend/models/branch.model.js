const mongoose = require("mongoose");
const Counter = require("./counter.model"); 

const BranchSchema = new mongoose.Schema(
    {
        _id: { type: Number },

        type: {
            type: String,
            enum: ["main", "sub", "online"],
            default: "sub",
            trim: true,
        },

        registrationNumber: { type: String, required: true },

        governate: { type: Number, min: 1, max: 27, required: true },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        admin: { type: mongoose.Schema.ObjectId, ref: "WorksOn", default: null  },

        employees: [
            {
                employeeWorksOnRel: { type: mongoose.Schema.ObjectId, ref: "WorksOn" },
            },
        ],

        isActive: {
            type: Boolean,
            default:false,
        },
    },
    { timestamps: true }
);


BranchSchema.pre("validate", async function (next) {

    if (!this._id) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: "branch" }, 
            { $inc: { seq: 1 } }, 
            { new: true, upsert: true } 
        );
        this._id = counter.seq;
    }

    // if (this.isActive) {
    //     return next(new Error("Branch cannot be active without an admin."));
    // }

    next();
});
/*
BranchSchema.pre("updateOne", async function (next) {
    const update = this.getUpdate();
    if (update.isActive === true) {
        const branch = await this.model.findOne(this.getQuery());
        if (!branch.admin) {
            return next(new Error("Branch cannot be active without an admin."));
        }
    }
    next();
});
*/
BranchSchema.index({ governate: 1, registrationNumber: 1 }, { unique: true });

module.exports = mongoose.model("Branch", BranchSchema);
