const OfflineProducts = require("../models/offlineSchema.model");
const {inboxResult}=require("../utils/apiFeatures");
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
            return await OfflineProducts.findById(id);
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

    getOffProducts: async (OffFilters, ProductFilters, sort, page, limit) => {

        try {
            //OffFilters related branch
            //ProductFilters :: represent isActive 

            const [results, total] = await Promise.all([

                await OfflineProducts.find(OffFilters)
                    .populate({
                        path: "product",
                        match: { ProductFilters, status: "approved" }
                    })
                    .sort(sort)
                    .skip((page - 1) * limit) // (starting index = page-1)*limit
                    .limit(limit)
                    .select("-__v -kind")
                    .lean(),


                await OfflineProducts.aggregate([
                    {
                        $lookup: {
                            from: "OfflineProducts",
                            localField: "product",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    { $match: { "product.isActive": ProductFilters.isActive , "product.status":"approved"  } },
                    { $count: "total" }
                ])
                  
            ])
            return inboxResult(results, total, page, limit);
        } catch (error) {
            throw error;
        }

    }


}