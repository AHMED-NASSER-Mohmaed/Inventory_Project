const ProductRepository = require("../repos/product.repo");
const AppError = require('../utils/appError');

class ProductService {
  
    async createProduct(productData){
        return await ProductRepository.createProduct(productData); // if there were any errors here it will be delegated to the upper layer
    }
    
    async updateProductById(productId, updatedData){
        try {
            const product = await ProductRepository.updateProductById(productId, updatedData);
            if (!product) {
              throw new AppError('Product not found', 404);
            }
            return product;
        } catch (err) {
            throw err;
        }
    }

    async deleteProductById(productId){
        try {
            const product = await ProductRepository.deleteProductById(productId);
            if (!product) {
              throw new AppError('Product not found', 404);
            }
            return product;
        } catch (err) {
            throw err;
        }
    }

    async getProductById(productId){
        try{
            const product = await ProductRepository.getProductById(productId); //  .populate() has been removed since there's no ref anymore
            if (!product) {
            throw new AppError('Product not found', 404);
        }
        return product;
        } catch (err) {
            throw err;
        }
    }

    async getAllProducts(){
        return await ProductRepository.getAllProducts();
    }
}

module.exports = new ProductService();