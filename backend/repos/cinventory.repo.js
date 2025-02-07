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
      const inventory = await CInventory.findById(inventoryId).populate('product');
      return inventory;
    } catch (err) {
      throw err;
    }
  }

  async getAllInventories() {
    try {
      const inventories = await CInventory.find().populate('product');
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

  async updateInventoriesByProviderId(providerId, companyName) {
    try {
      const updateData = {providerName: companyName};
      const result =  await CInventory.updateMany(
        { providerID: providerId },
        updateData,
        {  runValidators: true }
      );
      return result;
      
    } catch (err) {
      throw err;
    }
  }


  async updateInventoryByProductId(productId, updateData) {
    try {
      const { currentStock, ...rest } = updateData;

      const inventory = await CInventory.findOne({ product: productId });

      if (currentStock !== undefined) {
        inventory.currentStock += currentStock;
      }

      Object.assign(inventory, rest);

      await inventory.save({ runValidators: true });
      const inv = await CInventory.findById(inventory._id).populate('product')
      return inv;
    } catch (err) {
      throw err;
    }
  }

  
}

module.exports = new CInventoryRepository();