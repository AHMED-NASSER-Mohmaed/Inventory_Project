const SupplierOrder = require("../models/supplier_order.model");
const Product = require("../models/Product");
const OfflineProducts = require("../models/OfflineProducts");


const supplierOrderRepo = {

    //done
    addSupplierOrder: async (data) => {
        try {
            return await SupplierOrder.create(data);
        } catch (error) {
            throw error;
        }
    },







    updateSupplierOrder: async (id, data) => {
        try {
            return await SupplierOrder.findByIdAndUpdate(id, data, { new: true });
        } catch (error) {
            throw error;
        }
    },

    deleteSupplierOrder: async (id) => {
        try {
            return await SupplierOrder.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    },

    getSupplierOrders: async (filters = {}, sort = {}, page = 1, limit = 10) => {
        try {
            const [results, total] = await Promise.all([
                SupplierOrder.find(filters)
                    .sort(sort)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate("supplier")
                    .lean(),
                SupplierOrder.countDocuments(filters)
            ]);
            return { results, total, page, limit };
        } catch (error) {
            throw error;
        }
    },

    getSupplierOrderById: async (id) => {
        try {
            return await SupplierOrder.findById(id).populate("supplier");
        } catch (error) {
            throw error;
        }
    },
};

module.exports = supplierOrderRepo;
