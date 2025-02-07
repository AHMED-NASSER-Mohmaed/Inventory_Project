const Category = require('../models/category.model');
const AppError = require('../utils/appError');

class CategoryRepository {
  
  async createCategory(categoryData) {
    try {
      const category = await Category.create(categoryData);
      return category;
    } catch (err) {
      throw err;
    }
  }

  async getCategoryById(categoryId) {
    try {
      const category = await Category.findById(categoryId).select('-createdAt -updatedAt -__v');
      return category;
    } catch (err) {
      throw err;
    }
  }

  async getAllCategories() {
    try {
      const categories = await Category.find().select('-createdAt -updatedAt -__v');
      return categories;
    } catch (err) {
      throw err;
    }
  }

  async updateCategoryById(categoryId, updateData) {
    try {
      const category = await Category.findByIdAndUpdate(categoryId, updateData, { new: true, runValidators: true }).select('-createdAt -updatedAt -__v');
      if (!category) {
        throw new AppError('Category not found', 404);
      }
      return category;
    } catch (err) {
      throw err;
    }
  }

  async deleteCategoryById(categoryId) { // soft delete
    try {
      const category = await Category.findByIdAndUpdate(
        categoryId,
        { isActive: false },
        { new: true }
      ).select('-createdAt -updatedAt -__v');
      return category;
    } catch (err) {
      throw err;
    }
  }

  async activateCategoryById(categoryId) { // soft delete
    try {
      const category = await Category.findByIdAndUpdate(
        categoryId,
        { isActive: true },
        { new: true }
      ).select('-createdAt -updatedAt -__v');
      return category;
    } catch (err) {
      throw err;
    }
  }

  async isCategoryExist(categoryId) {
    try {
      const category = await Category.findById(categoryId);
      return !!category;
    } catch (err) {
      throw err;
    }
  }

  // async getCategoriesByCategory(categoryId) {
  //   try {
  //     const categories = await Category.find({ category: categoryId }).select('-createdAt -updatedAt -__v');
  //     return categories;
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  async isCategoryActive(categoryId) {
    try {
      const category = await Category.findById(categoryId).select('isActive');
      if (!category) {
        throw new AppError('Category not found', 404);
      }
      return category.isActive;
    } catch (err) {
      throw err;
    }
  }

  async getActiveCategories() {
    try {
      const categories = await Category.find({ isActive: true }).select('-createdAt -updatedAt -__v');
      return categories;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new CategoryRepository();