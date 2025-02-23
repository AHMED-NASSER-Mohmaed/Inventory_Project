const {Brand} = require("../models/brand.model");
const { inboxResult } = require("../utils/apiFeatures");

module.exports.brandRepo = {

    addBrand: async (data) => {
        try {
            return await Brand.create(data);
        } catch (error) {
            throw error;
        }
    },

    updateBrand: async (id, data) => {
        try {
            return await Brand.updateOne({ _id: id }, { $set: data });
        } catch (error) {
            throw error;
        }
    },

    deleteBrand: async (id) => {
        try {
            return await Brand.updateOne({ _id: id }, { $set: { isActive: false } });
        } catch (error) {
            throw error;
        }
    },

    activeBrand: async (id) => {
        try {
            return await Brand.updateOne({ _id: id }, { $set: { isActive: true } });
        } catch (error) {
            throw error;
        }
    },
    
    //pagination
    getBrands: async (filters, sort, page, limit) => {

        try {
            const [results, total] = await Promise.all([
                await Brand.find(filters)
                    .sort(sort)
                    .skip((page - 1) * limit) // (starting index = page-1)*limit
                    .limit(limit)
                    .select("-__v -kind")
                    .lean(),

                await Brand.countDocuments(filters).exec()
            ])
            return inboxResult(results, total, page, limit);
        } catch (error) {
            throw error;
        }

    },

    getCountByFilter:async(filters)=>{
        try{
            return await Brand.countDocuments(filters).exec();
        }catch(error){
            throw error;
        }
    }


}
