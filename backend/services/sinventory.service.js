const SInventoryRepository = require("../repos/sinventory.repo");

class SInventoryService {
  
    async createInventory(inventoryData){
        return await SInventoryRepository.createInventory(inventoryData);
    }
    
    async updateInventoryById(inventoryId, updatedData){
        try {
            const inventory = await SInventoryRepository.updateInventoryById(inventoryId, updatedData);
            if (!inventory) {
              throw new AppError('Inventory not found', 404);
            }
            return inventory;
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