const SInventory = require('../models/sinventory.model');
const AppError = require('../utils/appError');

class SInventoryRepository {
  
  async createInventory(inventoryData) {
    try {
      const inventory = await SInventory.create(inventoryData);
      return inventory;
    } catch (err) {
      throw err;
    }
  }

  async getInventoryById(inventoryId) {
    try {
      const inventory = await SInventory.findById(inventoryId);
      if (!inventory) {
        throw new AppError('Inventory not found', 404);
      }
      return inventory;
    } catch (err) {
      throw err;
    }
  }

  async getAllInventories() {
    try {
      const inventories = await SInventory.find();
      return inventories;
    } catch (err) {
      throw err;
    }
  }

  async updateInventoryById(inventoryId, updateData) {
    try {
      const inventory = await SInventory.findByIdAndUpdate(inventoryId, updateData, { new: true, runValidators: true });
      if (!inventory) {
        throw new AppError('Inventory not found', 404);
      }
      return inventory;
    } catch (err) {
      throw err;
    }
  }

  async deleteInventoryById(inventoryId) { // soft delete
    try {
      const inventory = await SInventory.findByIdAndUpdate(
        inventoryId,
        { isActive: false },
        { new: true }
      );
      if (!inventory) {
        throw new AppError('Inventory not found', 404);
      }
      return inventory;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new SInventoryRepository();