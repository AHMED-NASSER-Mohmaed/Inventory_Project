const SellerProduct = require("../models/sellerProduct.model");

class SellerProductRepository {
  async createSellerProduct(sellerProductData) {
    return await SellerProduct.create(sellerProductData);
  }

  async getSellerProductById(sellerProductId) {
    return await SellerProduct.findById(sellerProductId).populate("seller product");
  }

  async updateSellerProduct(sellerProductId, updateData) {
    return await SellerProduct.findByIdAndUpdate(sellerProductId, updateData, { new: true });
  }

  async deleteSellerProduct(sellerProductId) {
    return await SellerProduct.findByIdAndDelete(sellerProductId);
  }

  async getApprovedSellerProducts(productId) {
    return await SellerProduct.find({ product: productId, status: "approved", isActive: true }).populate("seller");
  }
}

module.exports = new SellerProductRepository();
