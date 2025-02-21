const mongoose = require("mongoose");

const OrderContainerSchema = new mongoose.Schema({

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate: requiredFieldsValidator("customer") // Pass the field name as a string
    },

    customerNotes: { type: String },

    orderType: { type: String, enum: ['online', 'offline'], required: true },

    gov: { type: String, validate: requiredFieldsValidator("gov") }, // Pass the field name as a string
    address: { type: String, validate: requiredFieldsValidator("address") }, // Pass the field name as a string
    phone1: { type: String, validate: requiredFieldsValidator("phone1") }, // Pass the field name as a string
    phone2: { type: String },

    sellersOrders: [
        { 
            order: { 
                type: mongoose.Schema.Types.ObjectId, // Fixed ObjectId
                required: true, // Fixed typo in "required"
                ref: "Order" 
            } 
        }
    ],

    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "partially shipped",
            "partially delivered", "delivered",
            "Completed", "canceled"],
        default: "pending"
    },

    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" } // Fixed ObjectId

}, {
    timestamps: true,
});

// Fixed mongoose.module to mongoose.model
const OrderContainer = mongoose.model("OrderContainer", OrderContainerSchema);// Corrected mongoose.module to mongoose.model

module.exports = OrderContainer;
// Updated requiredFieldsValidator function
function requiredFieldsValidator(field) {
    return function() {
        // If orderType is 'online', the field is required
        if (this.orderType === 'online' && !this[field]) {
            return false; // Validation fails if the field is missing
        }
        // If orderType is 'offline', the field is not required
        return true;
    };
}