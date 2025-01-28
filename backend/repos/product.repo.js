const Product = require('../models/product.model');
const AppError = require('../utils/appError');

class ProductRepository {
  
  async createProduct(productData) {
    try {
      const product = await Product.create(productData);
      return product;
    } catch (err) {
      throw err;
    }
  }

  async getProductById(productId) {
    try {
      const product = await Product.findById(productId).populate('category seller'); // in order to populate the category and seller fields in the product scheme
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      return product;
    } catch (err) {
      throw err;
    }
  }

  async getAllProducts() {
    try {
      const products = await Product.find().populate('category seller');
      return products;
    } catch (err) {
      throw err;
    }
  }

  async updateProductById(productId, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      return product;
    } catch (err) {
      throw err;
    }
  }

  async deleteProductById(productId) {
    try {
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      return product;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new ProductRepository();