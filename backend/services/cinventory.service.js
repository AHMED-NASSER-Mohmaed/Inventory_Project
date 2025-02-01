const CInventoryRepository = require("../repos/cinventory.repo");

class CInventoryService {
  
    async createInventory(inventoryData){
        return await CInventoryRepository.createInventory(inventoryData);
    }
    
    async updateInventoryById(inventoryId, updatedData){
        try {
            const inventory = await CInventoryRepository.updateInventoryById(inventoryId, updatedData);
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
}

module.exports = new CInventoryService();