const mongoose = require("mongoose");

const OrderContainerSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function () {
          return requiredFieldsValidator(this.customer, this.orderType);
        },
        message: "Customer is required for online orders.",
      },
    },

    customerNotes: { type: String },

    orderType: { type: String, enum: ["online", "offline"], required: true },

    gov: {
      type: String,
      validate: {
        validator: function () {
          return requiredFieldsValidator(this.gov, this.orderType);
        },
        message: "Governorate is required for online orders.",
      },
    },

    address: {
      type: String,
      validate: {
        validator: function () {
          return requiredFieldsValidator(this.address, this.orderType);
        },
        message: "Address is required for online orders.",
      },
    },

    phone1: {
      type: String,
      validate: {
        validator: function () {
          return requiredFieldsValidator(this.phone1, this.orderType);
        },
        message: "Phone number is required for online orders.",
      },
    },

    phone2: { type: String },

    sellersOrders: [
      {
        order: {
          type: mongoose.Schema.Types.ObjectId,
          // required: true,
          ref: "Order",
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "partially shipped", // means some orders have been shipped and some are not (those status here don't have the same meaning as in the order scheme)
        "partially delivered", // means some orders have been delivered and some are not
        "delivered",
        "partially completed", // means that only some orders we have received our rate from the external seller
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    branch: { type: Number, ref: "Branch" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrderContainer", OrderContainerSchema);

function requiredFieldsValidator(fieldValue, orderType) {
  return orderType === "online" ? !!fieldValue : true;
}
