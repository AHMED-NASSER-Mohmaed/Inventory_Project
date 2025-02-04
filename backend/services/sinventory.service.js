const SInventoryRepository = require("../repos/sinventory.repo");
const ProductService = require("../services/product.service");

class SInventoryService {
  
    async createInventory(user, inventoryData){
        try{
            const createdProduct = await ProductService.createProductForSeller(user, inventoryData);
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
                
                const updatedProduct = await ProductService.updateProductById(inventory.product, updatedData, userType, userId, true); // true refers here that it's a sinventory
                return updatedProduct;
            } catch (err) {
                throw err;
            }
    }


    async getInventoryById(inventoryId){
        try {
            const inventory = await SInventoryRepository.getInventoryById(inventoryId);
            if (!inventory) {
              throw new AppError('Inventory not found', 404);
            }
            return inventory;
        } catch (err) {
            throw err;
        }
    }

    async getAllInventories(){
        return await SInventoryRepository.getAllInventories();
    }
}

module.exports = new SInventoryService();