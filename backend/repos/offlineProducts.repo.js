
const OfflineProducts = require("../models/offlineSchema.model");
const { inboxResult } = require("../utils/apiFeatures");

const Product = require("../models/product.model");
module.exports.OfflineProductsRepo = {

    addOfflineProduct: async (data) => {
        try {
            return await OfflineProducts.create(data);
        } catch (error) {
            throw error;
        }
    },

    getOffProductById: async (id) => {
        try {
            return await OfflineProducts.findById(id).populate("branch");
        } catch (error) {
            throw error;
        }

    },

    updateQuantity: async (id, qty) => {
        try {
            return await OfflineProducts.updateOne({ _id: id }, { $set: { stock: qty } });
        } catch (error) {
            throw error;
        }
    },
    //isActive + deactive products
    getOffProducts: async (filters, sort, page, limit) => {

        try {

            const [result, total] = await Promise.all([

                await OfflineProducts.aggregate([
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    { $unwind: "$product" },
                    {
                        $match: {
                            ...filters
                        }

                    },
                    { $sort: sort },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    { $project: { __v: 0, kind: 0, "product.isActive": 0, "product.satus": 0 } }
                ]),
                await OfflineProducts.aggregate([
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    { $unwind: "$product" },
                    {
                        $match: {
                            ...filters
                        }
                    },
                    {
                        $count: "total"
                    }])


            ])
            return inboxResult(result, total[0]?.total || 0, page, limit);
        } catch (error) {
            throw error;
        }

    },

    getCount: async (filters) => {
        try {
            return await OfflineProducts.aggregate([
                {
                    $lookup: {
                        from: "products",
                        localField: "product",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                { $unwind: "$product" },
                {
                    $match: filters
                },
                {
                    $count: "total"
                }])

        } catch (error) {
            throw error;
        }
    },

    //for exporting a new product
    upsertOffProduct: async (productId, branchId, quantity) => {
        try {
            return await OfflineProducts.findOneAndUpdate(
                { _id: productId, branch: branchId }, // Search condition
                {
                    $inc: { stock: quantity }, // Increment stock if document exists
                    $setOnInsert: { stock: quantity } // If inserting, set stock to quantity
                },
                { upsert: true, new: true } // Ensure upsert + return updated document
            );

        } catch (error) {
            throw error;
        }
    }




}