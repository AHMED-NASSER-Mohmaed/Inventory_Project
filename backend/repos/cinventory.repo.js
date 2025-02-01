const CInventory = require('../models/cinventory.model');
const AppError = require('../utils/appError');

class CInventoryRepository {
  
  async createInventory(inventoryData) {
    try {
      const inventory = await CInventory.create(inventoryData);
      return inventory;
    } catch (err) {
      throw err;
    }
  }

  async getInventoryById(inventoryId) {
    try {
      const inventory = await CInventory.findById(inventoryId);
      return inventory;
    } catch (err) {
      throw err;
    }
  }

  async getAllInventories() {
    try {
      const inventories = await CInventory.find();
      return inventories;
    } catch (err) {
      throw err;
    }
  }

  async updateInventoryById(inventoryId, updateData) {
    try {
      const inventory = await CInventory.findByIdAndUpdate(inventoryId, updateData, { new: true, runValidators: true });
      return inventory;
    } catch (err) {
      throw err;
    }
  }

  
}

module.exports = new CInventoryRepository();