
const categoryModel = require('../models/category.model');
const Category = require('../models/category.model');


module.exports.categoryRepo = {

    // done
    addCategory: async (data) => {
        try {
          
            return await Category.create(data);
        } catch (error) {
            throw error;
        }
    },

    // done 
    updateCategory: async (id, data) => {
        try {
          
            return await Category.updateOne({_id:id}, { $set: data });
        } catch (error) {
            throw error;
        }
    },

    //done 
    deleteCategory: async (id) => {
        try {
            return await Category.updateOne({_id:id}, { $set: { isActive: false } });
        } catch (error) {
            throw error;
        }
    },

    //done 
    activateCategory: async (id) => {
        try {
            return await Category.updateOne({_id:id}, { $set: { isActive: true } } );
        } catch (error) {
            throw error;
        }
    },

    // done --> apgination + search 
    getCategories: async (filters = {}, sort = {}, page = 1, limit = 10) => {
        try {
            //is active or not 
            const [results, total] = await Promise.all([
                await Category.find(filters)
                    .sort(sort)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),
                await Category.countDocuments(filters).exec(),
            ]);

            return { results, total, page, limit };
        } catch (error) {
            throw error;
        }
    },

    // done
    getCategoryById: async (id) => {
        try {
            return await Category.findById(id)
        } catch (error) {
            throw error;
        }
    },

    //done 
    isCategoryActive: async (categoryId) => {
      try {
          const category = await Category.findById(categoryId).select("isActive").lean();
          return category ? category.isActive : null; // Returns true, false, or null if not found
      } catch (error) {
          throw error;
      }
  },

  getCount:async(filters)=>{
    try{
      return await Category.countDocuments(filters).exec();
    }catch(error){
      return error;
    }
  },

  getAllActiveCategoryIdsNames:async()=>{
    try{
      return await categoryModel.find({isActive:true},"_id Cname");
    }catch(error){
      throw error;
    }
  },

  

};






/*
const Category = require("../models/category.model");
class CategoryRepository {

  

  //you have to tell to which parent that brancd belong..
  async createCategory(categoryData) {
    try {

      return  await Category.create(categoryData);
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

  async getdeActiveCategories() {
    try {
      const categories =await Category.find({ isActive: false }).select('-createdAt -updatedAt -__v');
      return categories;
    } catch (err) {
      throw err;
    }
  }

  async getCountByFilter (filters) {
  try {
    
    return await Category.countDocuments(filters);

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

    console.log("filters:", filters);

    const selectedCategory = await Category.findOne(filters);

    // console.log(selectedCategory , " this is the selected cat from repo");



    //if parent id equal to null then this main category may have child categories.
    let arrOfCild = [];
    if (selectedCategory) { // this mean category is exit

      // console.log("fuck father:",selectedCategory['parentCatId']==null);
      if (selectedCategory['parentCatId'] == null) { // this mean this cat is parent

        arrOfCild = await Category.find({ parentCatId: selectedCategory._id, isActive: true }, { _id: 1 });

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
*/