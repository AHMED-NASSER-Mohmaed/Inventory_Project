const { update, first } = require('lodash');
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
      const inventory = await SInventory.findById(inventoryId).populate('product') // Replace 'product' with the actual field name if different
      return inventory;
    } catch (err) {
      throw err;
    }
  }

  async getAllInventories() {
    try {
      const inventories = await SInventory.find().populate('product');
      return inventories;
    } catch (err) {
      throw err;
    }
  }

  async updateInventoryById(inventoryId, updateData) {
    try {
      const inventory = await SInventory.findByIdAndUpdate(inventoryId, updateData, { new: true, runValidators: true });
      return inventory;
    } catch (err) {
      throw err;
    }
  }

  async updateInventoryByProductId(productId, updateData) {
    try {
      const { currentStock, ...rest } = updateData;

      const inventory = await SInventory.findOne({ product: productId });

      if (currentStock !== undefined) {
        inventory.currentStock += currentStock;
      }

      Object.assign(inventory, rest);

      await inventory.save({ runValidators: true });
      const inv = await SInventory.findById(inventory._id).populate('product')
      return inv;
    } catch (err) {
      throw err;
    }
  }

  async updateInventoryByProviderId(providerId, updateData) {
    try {
      const { companyName, ...rest} = updateData; 
      const providerName = companyName;

       await SInventory.updateMany(
        { providerID: providerId },
        { providerName },
        { new: true, runValidators: true }
      );

      return true;
    } catch (err) {
      throw err;
    }
  }

  
}

module.exports = new SInventoryRepository();