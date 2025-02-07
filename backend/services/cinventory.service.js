const CInventoryRepository = require("../repos/cinventory.repo");
const ProductService = require("../services/product.service");

const productService= require("./product.service");

class CInventoryService {
  
    async createInventory(inventoryData){
        try{

            const createdProduct = await ProductService.createProductForStaff(inventoryData);
            return createdProduct;
        } catch(err){
            throw err;
        }
    }
    
    async updateInventoryById(inventoryId, updatedData, userType, userId){
        try {
            const inventory = await this.getInventoryById(inventoryId);
            if (!inventory) {
              throw new AppError('Inventory not found', 404);
            }
            
            const updatedProduct = await ProductService.updateProductById(inventory.product, updatedData, userType, userId, false); // false refers here that it's a cinventory
            return updatedProduct;
        } catch (err) {
            throw err;
        }
    }


    async getInventoryById(inventoryId){
        try {
            const inventory = await CInventoryRepository.getInventoryById(inventoryId);
            if (!inventory) {
              throw new AppError('Inventory not found', 404);
            }
            return inventory;
        } catch (err) {
            throw err;
        }
    }

    async getAllInventories(){
        return await CInventoryRepository.getAllInventories();
    }
    
    async addProductToInventory(productData){
        try{
            await productService.createProductForStaff(productData);
        }catch(err){
            throw err;
        }
    }


    
}

module.exports = new CInventoryService();