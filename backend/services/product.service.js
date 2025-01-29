const ProductRepository = require("../repos/product.repo");


class ProductService {
  
    async createProduct(productData){
        return await ProductRepository.createProduct(productData); // if there were any errors here it will be delegated to the upper layer
    }
    
    async updateProductById(productId, updatedData){
        return await ProductRepository.updateProductById(productId, updatedData);
    }

    async deleteProductById(productId){
        return await ProductRepository.deleteProductById(productId);
    }

    async getProductById(productId){
        return await ProductRepository.getProductById(productId);
    }

    async getAllProducts(){
        return await ProductRepository.getAllProducts();
    }
}

module.exports = new ProductService();