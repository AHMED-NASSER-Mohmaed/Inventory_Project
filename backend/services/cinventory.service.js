const CInventoryRepository = require("../repos/cinventory.repo");

class CInventoryService {
  
    async createInventory(inventoryData){
        return await CInventoryRepository.createInventory(inventoryData);
    }
    
    async updateInventoryById(inventoryId, updatedData){
        return await CInventoryRepository.updateInventoryById(inventoryId, updatedData);
    }

    async deleteInventoryById(inventoryId){
        return await CInventoryRepository.deleteInventoryById(inventoryId);
    }

    async getInventoryById(inventoryId){
        return await CInventoryRepository.getInventoryById(inventoryId);
    }

    async getAllInventories(){
        return await CInventoryRepository.getAllInventories();
    }
}

module.exports = new CInventoryService();