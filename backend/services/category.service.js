const { APP_CONFIG } = require("../config/app.config");
const CategoryRepository = require("../repos/category.repo");
const AppError = require("../utils/appError");

class CategoryService {

    async createCategory(categoryData) {
        try {
            const category = await CategoryRepository.createCategory(categoryData);
            return category;
        } catch (err) {
            throw err;
        }
    }

    async getCategoryById(categoryId) {
        try {
            const category = await CategoryRepository.getCategoryById(categoryId);
            if (!category) {
                throw new AppError('Category not found', 404);
            }
            return category;
        } catch (err) {
            throw err;
        }
    }

    async getAllCategories() {
        try {
            const categories = await CategoryRepository.getAllCategories();
            return categories;
        } catch (err) {
            throw err;
        }
    }

    async updateCategoryById(categoryId, updateData) {
        try {
            const category = await CategoryRepository.updateCategoryById(categoryId, updateData); // no need to update since we're using ref on the products scheme
            if (!category) {
                throw new AppError('Category not found', 404);
            }
            return category;
        } catch (err) {
            throw err;
        }
    }

    async deleteCategoryById(categoryId) {
        try {
            const category = await CategoryRepository.deleteCategoryById(categoryId);
            if (!category) {
                throw new AppError('Category not found', 404);
            }
            return category;
        } catch (err) {
            throw err;
        }
    }

    async activateCategoryById(categoryId) {
        try {
            const category = await CategoryRepository.activateCategoryById(categoryId);
            if (!category) {
                throw new AppError('Category not found', 404);
            }
            return category;
        } catch (err) {
            throw err;
        }
    }

    async isCategoryExist(categoryId) {
        try {
            const exists = await CategoryRepository.isCategoryExist(categoryId);
            return exists;
        } catch (err) {
            throw err;
        }
    }

    // async getCategoriesByCategory(categoryId) {
    //     try {
    //         const categories = await CategoryRepository.getCategoriesByCategory(categoryId);
    //         return categories;
    //     } catch (err) {
    //         throw err;
    //     }
    // }

    async isCategoryActive(categoryId) {
        try {
            const isActive = await CategoryRepository.isCategoryActive(categoryId);
            return isActive;
        } catch (err) {
            throw err;
        }
    }

    async getActiveCategories() {
        try {
            const categories = await CategoryRepository.getActiveCategories();
            return categories;
        } catch (err) {
            throw err;
        }
    }

    //get child categories
    async getChildCategoies(categoryId) {

        try {

            return await CategoryRepository.getChildCategoies(categoryId);
            
        } catch (error) {
            throw error
        }


    }



}

module.exports = new CategoryService();