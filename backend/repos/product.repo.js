const Product = require('../models/product.model');
const { inboxResult } = require("../utils/apiFeatures")

module.exports.productRepo={


  addProduct:async(data)=>{
    try{

      await Product.create(data);
      
    }catch(error){
      throw error;
    }
  }



}










/*
const { filter } = require('lodash');
const Product = require('../models/product.model');
const AppError = require('../utils/appError');
const { inboxResult } = require("../utils/apiFeatures")

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
      const product = await Product.findById(productId)
        .select('-__v')
        .populate("category") //has been removed since there's no ref anymore
      return product;
    } catch (err) {
      throw err;
    }
  }

  async getAllProducts() {
    try {
      const products = await Product.find().select('-__v').populate() //has been removed since there's no ref anymore
      return products;
    } catch (err) {
      throw err;
    }
  }

  async updateProductById(productId, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true })
        .select('-__v')
        .populate("category");
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
      ).select('-__v').populate("category");
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

  async getProductsByCategoryForEndUser(categoryId) { // for gusts & customers
    try {
      const products = await Product.find({ category: categoryId, isActive: true })
      //.select('-createdAt -updatedAt -__v'); // - means to exclude if you wanna include don't use -
      return products;
    } catch (err) {
      throw err;
    }
  }

  async getProductsByCategoryForDeactivatedProducts(categoryId) { // for super admin, admin, seller
    try { // to be used later
      const products = await Product.find({ category: categoryId, isActive: false })
      //.select('-createdAt -updatedAt -__v'); // - means to exclude if you wanna include don't use -
      return products;
    } catch (err) {
      throw err;
    }
  }

  async getProductsByCategoryForStaff(categoryId) {
    try {
      const products = await Product.find({ category: categoryId }) // so the seller and the admin can be able to handle the isActive and for the admin to handle the status of the pending products
      //.select('-createdAt -updatedAt -__v'); // - means to exclude if you wanna include don't use -
      return products;
    } catch (err) {
      throw err;
    }
  }

  async getProductsByCategoryForSeller(categoryId, sellerId_) {
    try {
      const products = await Product.find({ category: categoryId, sellerId: sellerId_ }) // so the seller and the admin can be able to handle the isActive and for the admin to handle the status of the pending products
      //.select('-createdAt -updatedAt -__v'); // - means to exclude if you wanna include don't use -
      return products;
    } catch (err) {
      throw err;
    }
  }

  async addProducts(productsArray) { // add an array of products
    try {
      if (!Array.isArray(productsArray)) {
        productsArray = [productsArray];
      }
      const products = await Product.insertMany(productsArray);
      return products;
    } catch (err) {
      throw err;
    }
  }

  async approveProductForSeller(productId) {
    try {
      let product = await Product.findByIdAndUpdate(
        productId,
        { status: true },
        { new: true }
      ).select('-createdAt -updatedAt -__v');
      product = this.activateProduct(productId);
      return product;
    } catch (err) {
      throw err;
    }
  }

  async activateProduct(productId) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { isActive: true },
        { new: true }
      ).select('-createdAt -updatedAt -__v');
      return product;
    } catch (err) {
      throw err;
    }
  }

  async updateProductBysellerId(providerId, updateData){ // only to update the seller name if it was changed by the seller in his profile or by the admin
    try{
      const {companyName, ...rest} = updateData;
      const sellerName = companyName;

      await Product.updateMany(
        { sellerId: providerId },
        { sellerName },
        { new: true, runValidators: true }
      );
      return true;
    }catch(err){
      throw err;
    }
  }

  async getProducts(page, limit, sort, filters, prjection={}) {
    try {

      if( filters['category']){
        const [results, total] = await Promise.all([

          await Product.find({
            isActive: filters['isActive'], // Ensure filters['isActive'] is defined
            status: filters['status'],     // Ensure filters['status'] is defined
            category: { $in: filters['category'] } }// Ensure filters['category'] is an array
            ,prjection)
            .sort(sort)
            .skip((page - 1) * limit) // (starting index = page-1)*limit
            .limit(limit)
            .select("-__v")
            .lean()
          ,
  
          await Product.countDocuments({
  
            isActive: filters['isActive'], // Ensure filters['isActive'] is defined
            status: filters['status'],     // Ensure filters['status'] is defined
            category: { $in: filters['category'] } // Ensure filters['category'] is an array
  
          }).exec()
  
        ]);
        console.log(results);

        return inboxResult(results, total, page, limit);
      }else{

        const [results, total] = await Promise.all([
  
          await Product.find({ isActive: filters['isActive'], status: filters['status'] } ,prjection)
            .sort(sort)
            .skip((page - 1) * limit) // (starting index = page-1)*limit
            .limit(limit)
            .select("-__v")
            .lean()
          ,
  
          await Product.countDocuments({ isActive: filters['isActive'], status: filters['status']}).exec()
  
        ]);

        

        return inboxResult(results, total, page, limit);
      }


    } catch (err) {
      throw err;
    }

  }

  async updateProductMedia(id,productRepo){

    try{

      return await Product.updateOne({_id:id},
        {$set:{images:productRepo}}
      );

    }catch(error){
      throw error;
    }

  }

}

module.exports = new ProductRepository();

*/