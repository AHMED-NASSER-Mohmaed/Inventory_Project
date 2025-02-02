const Product = require('../models/product.model');
const AppError = require('../utils/appError');

class ProductRepository {
  
  async createProduct(productData) {
    try {
      const product = await Product.create(productData);
      const res = await Product.findById(product._id).select('-createdAt -updatedAt -__v');
      return res;
    } catch (err) {
      throw err;
    }
  }

  async getProductById(productId) {
    try {
      const product = await Product.findById(productId).select('-createdAt -updatedAt -__v'); //  .populate() has been removed since there's no ref anymore
      return product;
    } catch (err) {
      throw err;
    }
  }

  async getAllProducts() {
    try {
      const products = await Product.find().select('-createdAt -updatedAt -__v'); //  .populate() has been removed since there's no ref anymore
      return products;
    } catch (err) {
      throw err;
    }
  }

  async updateProductById(productId, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true }).select('-createdAt -updatedAt -__v');
      return product;
    } catch (err) {
      throw err;
    }
  }

  // async deleteProductById(productId) { // hard delete
  //   try {
  //     const product = await Product.findByIdAndDelete(productId);
  //     if (!product) {
  //       throw new AppError('Product not found', 404);
  //     }
  //     return product;
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  async deleteProductById(productId) { // soft delete
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { isActive: false },
        { new: true }
      ).select('-createdAt -updatedAt -__v');;
      return product;
    } catch (err) {
      throw err;
    }
  }

  async isProductExist(productId) {
    try {
      const product = await Product.findById(productId);
      return !!product;
    } catch (err) {
      throw err;
    }
  }

  async getProductsByCategory(categoryId) {
    try {
      const products = await Product.find({ category: categoryId }).select('-createdAt -updatedAt -__v'); // - means to exclude if you wanna include don't use -
      return products;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new ProductRepository();