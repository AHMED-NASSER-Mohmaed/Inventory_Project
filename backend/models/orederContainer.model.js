const mongoose = required("mongoose");

const OrderContainerSchema = new mongoose.Schema({

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate:requiredFieldsValidator(field)
    },

    customerNotes: { type: String },

    orderType: { type: String, enum: ['online', 'offline'], required: true },

    gov: { type: String,  validate:requiredFieldsValidator(Field) },
    address: { type: String, validate:requiredFieldsValidator(Field) },
    phone1: { type: String,  validate:requiredFieldsValidator(Field) },
    phone2: { type: String, },


    sellersOrders: [
        { order: { type: mongoose.Schema.ObjectId, requried: true, unique: true, ref: "Order" }, }
    ],


    status: {

        type: String,

        enum: ["pending", "processing", "shipped", "partially shipped",
            "partially delivered", "delivered",
            "completed", "canceled"],

        default: "pending"

    },


    branch: { type: mongoose.Schema.ObjectId, ref: "Branch" }

}, {
    timestamps: true,
});

module.exports = mongoose.module("OrderContainer", OrderContainerSchema);



function requiredFieldsValidator(field){
    
    return function() {
        if( (field && this.orderType == 'online') || (!field && this.orderType == 'offline') )
            return true;
        return false
    }
}
