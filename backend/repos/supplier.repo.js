const Supplier = require('../models/supplier.model');
const AppError = require('../utils/appError');

class SupplierRepository {
  
  async createSupplier(supplierData) {
    try {
      const supplier = await Supplier.create(supplierData);
      return supplier;
    } catch (err) {
      throw err;
    }
  }

  async getSupplierById(supplierId) {
    try {
      const supplier = await Supplier.findById(supplierId).select('-createdAt -updatedAt -__v');
      if (!supplier) {
        throw new AppError('Supplier not found', 404);
      }
      return supplier;
    } catch (err) {
      throw err;
    }
  }

  async getAllSuppliers() {
    try {
      const suppliers = await Supplier.find().select('-createdAt -updatedAt -__v');
      return suppliers;
    } catch (err) {
      throw err;
    }
  }

  async getActiveSuppliers() {
    try {
      const suppliers = await Supplier.find({ isActive: true }).select('-createdAt -updatedAt -__v');
      return suppliers;
    } catch (err) {
      throw err;
    }
  }

  async updateSupplierById(supplierId, updateData) {
    try {
      const supplier = await Supplier.findByIdAndUpdate(supplierId, updateData, { new: true, runValidators: true }).select('-createdAt -updatedAt -__v');
      return supplier;
    } catch (err) {
      throw err;
    }
  }

  async deleteSupplierById(supplierId) { // soft delete
    try {
      const supplier = await Supplier.findByIdAndUpdate(
        supplierId,
        { isActive: false },
        { new: true }
      ).select('-createdAt -updatedAt -__v');
      return supplier;
    } catch (err) {
      throw err;
    }
  }

  async activateSupplierById(supplierId) { 
    try {
      const supplier = await Supplier.findByIdAndUpdate(
        supplierId,
        { isActive: true },
        { new: true }
      ).select('-createdAt -updatedAt -__v');
      return supplier;
    } catch (err) {
      throw err;
    }
  }

  async isSupplierExist(supplierId) {
    try {
      const supplier = await Supplier.findById(supplierId);
      return !!supplier;
    } catch (err) {
      throw err;
    }
  }

  async isSupplierActive(supplierId) {
    try {
      const supplier = await Supplier.findById(supplierId).select('isActive');
      return supplier.isActive;
    } catch (err) {
      throw err;
    }
  }

  
}

module.exports = new SupplierRepository();