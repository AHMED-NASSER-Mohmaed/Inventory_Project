const SupplierRepository = require("../repos/supplier.repo");
const CInventoryRepository = require("../repos/cinventory.repo")
const AppError = require("../utils/appError");
const CInventory = require("../models/cinventory.model");

class SupplierService {
  
    async createSupplier(supplierData) {
        try {
            const supplier = await SupplierRepository.createSupplier(supplierData);
            return supplier;
        } catch (err) {
            throw err;
        }
    }

    async getSupplierById(supplierId) {
        try {
            const supplier = await SupplierRepository.getSupplierById(supplierId);
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
            const suppliers = await SupplierRepository.getAllSuppliers();
            return suppliers;
        } catch (err) {
            throw err;
        }
    }

    async updateSupplierById(supplierId, updateData) {
        try {
            const { companyName, ...rest } = updateData;
            const supplier = await SupplierRepository.updateSupplierById(supplierId, updateData);
            if (!supplier) {
                throw new AppError('Supplier not found', 404);
            }
            if(companyName){
                const result = await CInventoryRepository.updateInventoriesByProviderId(supplierId, companyName);
            }
            return supplier;
        } catch (err) {
            throw err;
        }
    }

    async deleteSupplierById(supplierId) {
        try {
            const supplier = await SupplierRepository.deleteSupplierById(supplierId);
            if (!supplier) {
                throw new AppError('Supplier not found', 404);
            }
            return supplier;
        } catch (err) {
            throw err;
        }
    }

    async activateSupplierById(supplierId) {
        try {
            const supplier = await SupplierRepository.activateSupplierById(supplierId);
            if (!supplier) {
                throw new AppError('Supplier not found', 404);
            }
            return supplier;
        } catch (err) {
            throw err;
        }
    }

    async isSupplierExist(supplierId) {
        try {
            const exists = await SupplierRepository.isSupplierExist(supplierId);
            return exists;
        } catch (err) {
            throw err;
        }
    }

    async isSupplierActive(supplierId) {
        try {
            const isActive = await SupplierRepository.isSupplierActive(supplierId);
            return isActive;
        } catch (err) {
            throw err;
        }
    }

    async getActiveSuppliers() {
        try {
            const suppliers = await SupplierRepository.getActiveSuppliers();
            return suppliers;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new SupplierService();