const mongoose = required("mongoose");

const CartSchema = new mongoose.Schema({

    products: [
      {
        product : { type: mongoose.Schema.ObjectId , ref:Product , require:true, unique:true },
        requiredQty: { type: Number, required: true },
      },

    ],
    
    customerId : { type : mongoose.Schema.ObjectId },

    sessionId: {
      type: String, // For guests
      required: function () {
          return !this.customerId;  // Guest ID is required if no user is provided
      },
  }

  },{
    timestamps: true,
  });
  
  module.exports = mongoose.model("Cart", CartSchema);
  
 