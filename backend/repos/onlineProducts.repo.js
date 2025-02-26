const { APP_CONFIG } = require("../config/app.config");
const OnlineProducts = require("../models/onlineProducts.model");

const OnlineProductsRepository = {

  isProductExist: async (productId) => {
    try {
      return await OnlineProducts.findById(productId);
    } catch (err) {
      throw err;
    }
  },

  updateOurSellerRecordQty: async (productId, sellerId, newQty) => {
    try {

      return await OnlineProducts.updateOne({ product: productId, sellerId }, { $set: { stock: newQty } })

    } catch (error) {
      throw error;
    }
  },

  //for online bracnh usage
  upsertOurSellerRecord: async (productId, newQty) => {
    try {
      return await OnlineProducts.findOneAndUpdate(
        { _id: productId, seller: APP_CONFIG.COMPANY_ID }, // Search condition
        {
          $inc: { stock: newQty }, // Only increment stock if the document exists
          $setOnInsert: { product: productId, seller: APP_CONFIG.COMPANY_ID } // Ensure new document can be created without conflicting stock updates
        },
        { upsert: true, new: true } // Ensure upsert + return updated document
      );
    } catch (error) {
      throw error;
    }
  }


}

module.exports = OnlineProductsRepository
