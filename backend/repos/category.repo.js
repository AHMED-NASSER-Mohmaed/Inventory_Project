const { APP_CONFIG } = require('../config/app.config');
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


  //this function will return array of child category or empty array
  //if the passed one is parent category 
  //if the passed one is child the the output will be array of only one id that represent the child category.

  async getCategoies(filters) {

    try {
      //filters = categoryId + isActive .

      console.log("filters:",filters);

      const selectedCategory = await Category.findOne(filters);

      // console.log(selectedCategory , " this is the selected cat from repo");



      //if parent id equal to null then this main category may have child categories.
      let arrOfCild = [];
      if (selectedCategory) { // this mean category is exit

        // console.log("fuck father:",selectedCategory['parentCatId']==null);
        if (selectedCategory['parentCatId'] == null) { // this mean this cat is parent

          arrOfCild = await Category.find({parentCatId:selectedCategory._id,isActive:true},{_id:1});

        }

        if (!arrOfCild.length) {
          arrOfCild.push(selectedCategory._id);
        }

        return arrOfCild;

      }

    } catch (error) {
      throw error;
    }

  }

}

module.exports = new CategoryRepository();