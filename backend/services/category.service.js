const { APP_CONFIG } = require("../config/app.config");
const CategoryRepository = require("../repos/category.repo");
const AppError = require("../utils/appError");

class CategoryService {


    //i have cheack on the required fields
    async createCategory(categoryData) {
        try {

            feilds=['name','parentCatId']

            Object.keys(categoryData).forEach(elememt=>{

                if(!feilds.includes(elememt)){
                    throw new AppError("invalid fields",APP_CONFIG.HTTP_BAD_REQUEST);
                }
            })

           return await CategoryRepository.createCategory(categoryData);
             
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
            return await CategoryRepository.getAllCategories();

        } catch (err) {
            throw err;
        }
    }

    async getCountByFilter(filters) {
        try {

            return CategoryRepository.getCountByFilter(filters);

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
    async getCategoies(validatedParams) {
            //validated params --> represent only filters
            try {

                return await CategoryRepository.getCategoies(validatedParams);

            } catch (error) {
                throw error
            }


        }

    async getdeActiveCategories(){
            try {
                const categories = await CategoryRepository.getdeActiveCategories();
                return categories;
            } catch (err) {
                throw err;
            }
        }


    
}

module.exports = new CategoryService();