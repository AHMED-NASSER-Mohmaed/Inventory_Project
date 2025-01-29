const SInventoryRepository = require("../repos/sinventory.repo");

class SInventoryService {
  
    async createInventory(inventoryData){
        return await SInventoryRepository.createInventory(inventoryData);
    }
    
    async updateInventoryById(inventoryId, updatedData){
        return await SInventoryRepository.updateInventoryById(inventoryId, updatedData);
    }

    async deleteInventoryById(inventoryId){
        return await SInventoryRepository.deleteInventoryById(inventoryId);
    }

    async getInventoryById(inventoryId){
        return await SInventoryRepository.getInventoryById(inventoryId);
    }

    async getAllInventories(){
        return await SInventoryRepository.getAllInventories();
    }
}

module.exports = new SInventoryService();