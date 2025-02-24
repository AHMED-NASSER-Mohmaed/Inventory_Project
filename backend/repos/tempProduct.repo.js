const Product = require("../models/product.model");

class ProductRepository {
  async createProduct(productData) {
    return await Product.create(productData);
  }

  async getProductById(productId) {
    return await Product.findById(productId).populate("category sellers supplier");
  }

  async updateProduct(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, { new: true });
  }

  async deleteProduct(productId) {
    return await Product.findByIdAndDelete(productId);
  }

  async getAllProducts(filters = {}) {
    return await Product.find(filters).populate("category sellers supplier");
  }
}

module.exports = new ProductRepository();
