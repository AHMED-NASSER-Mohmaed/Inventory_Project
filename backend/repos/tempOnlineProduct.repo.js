const OnlineProductsSchema = require("../models/onlineProducts.model");
const mongoose = require('mongoose');
class OnlineProductRepository {
  async createOnlineProduct(OnlineProductData) {
    return await OnlineProductsSchema.create(OnlineProductData);
  }

  async getOnlineProductById(OnlineProductId) {
   
    return await OnlineProductsSchema.findById(OnlineProductId).populate("seller product");
  }

  async updateOnlineProduct(OnlineProductId, updateData) {
    return await OnlineProductsSchema.findByIdAndUpdate(OnlineProductId, updateData, { new: true });
  }

  async deleteOnlineProduct(OnlineProductId) {
    return await OnlineProductsSchema.findByIdAndDelete(OnlineProductId);
  }

  async getApprovedOnlineProducts(productId) {
    return await OnlineProductsSchema.find({ product: productId, status: "approved", isActive: true }).populate("seller");
  }
}

module.exports = new OnlineProductRepository();
