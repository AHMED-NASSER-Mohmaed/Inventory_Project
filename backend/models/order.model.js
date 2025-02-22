const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, required: true },
    orderContainer: { type: mongoose.Schema.Types.ObjectId, required: true }, // added to able to update the status of the order container dircetly after updating the suborder here
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "partially shipped",
        "shipped",
        "partially delivered",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        onlineProduct: { type: mongoose.Schema.Types.ObjectId, ref: "OnlineProducts" }, // added just for stock in update i need that id to check on the stock if could fit or not
        offlineProduct: { type: mongoose.Schema.Types.ObjectId, ref: "OfflineProducts" },
        requestedQuantity: { // requested quantity
          type: Number,
          required: true,
        },

        // stock:{ // seller stock in inventory // but i cannot use it bc might be changed after the order is placed
        //   type: Number,
        //   required: true,
        // }, // added

        fulfilledQuantity: {
          type: Number,
          default: 0,
        },

        canceledQuantity: {
          type: Number,
          default: 0,
        },

        price: { type: Number }, // Old price reference

        totalPrice: { type: Number }, // Fixed type from String to Number
      },
    ],

    totalPrice: { type: Number },

    totalQty: { type: Number },

    clerk: { type: mongoose.Schema.Types.ObjectId },

    cashier: { type: mongoose.Schema.Types.ObjectId, default: null }, // Removed required or add a default string
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
