const CustomerOrderSchema = new mongoose.Schema({
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "preparing",
        "OnComplete",
        "Completed",
        "OnTheWay",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
     
    products: [
      {
        // productId: { type: mongoose.Schema.ObjectId , required: true  , unique:true},

        code: {type : String , required:true},

        productName:{ type: String, required: true },

        productImage:{ type: String, required: true },

        quantity: { type: Number, required: true },

        price: { type: Number, required: true },
      },
    ],
    
    customer : {  type: mongoose.Schema.ObjectId , required: true , ref:'User'},

    totalAmount: { type: Number, required: true },

    totalQty: { type: Number, required: true },

    clerkId: {  type: String, required: true },

    cashierId: { type: String, required: true },

    paymentMethod: { type: String, enum: ["Cash", "Card"], required: true },

    customerNotes: { type: String },

    // isOffline: { type: Boolean, default: false },

    gov: { type: String ,required: true},
    address: { type: String, required: true },
    phoneNumber:{ type: String, required: true },

  });
  
  module.exports = mongoose.model("CustomerOrder", CustomerOrderSchema);
  
  