const seller = require("../models/seller.model");
const { inboxResult } = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
// const { activeUser } = require("./user.repo");



// filter is an object
async function getSellerByFilter(page, limit, sort, filter) {

    try {

        const [results, total] = await Promise.all([
            await seller.find(filter)
                .sort(sort)
                .skip((page - 1) * limit) // (starting index = page-1)*limit
                .limit(limit)
                .lean(),

            await seller.countDocuments(filter).exec()
        ]);



        return inboxResult(results, total, page, limit);


    } catch (err) {
        throw err;
    }

}
const pendingFilter = { isActive: true, status: false }
const activeFilter = { isActive: true, status: true }
const deactiveFilter = { isActive: false, status: true }


module.exports.sellerRepo = {


    /**
     * create seller function
     * who can call this function : super admin , admin , seller registration
     * data that is required for creation
     * 
     * fisrtname 
     * lastname , 
     * email
     * phoneNumber
     * password
     * passwordConfirm
     * userType : seller
     * 
     * companyRegistrationNumber
     * SSN 
     * companyName,
     * 
     * 
     * possible return type : user , throw an exception
     */


    createSeller: async (sellerData) => {
        try {
            sellerData.userType = "seller";
            return await seller.create(sellerData);
        } catch (err) {
            throw err;
        }

    },
    getSellerById: async (sellerId) => {
        try {
            return await seller.findById(sellerId);
        } catch (err) {
            throw err;
        }
    },

    //retun acknowlage , or throw exception
    deleteSeller: async (id) => {

        try {
            return await seller.updateOne({ _id: id }, {
                $set: { isActive: false }
            })

        } catch (erro) {
            throw erro;
        }

    },

    //retun acknowlage , or throw exception
    approveSeller: async (id) => {
        try {

            return await seller.updateOne({ _id: id }, {
                $set: { status: 1 }
            });

        } catch (err) {
            throw err;
        }
    },

    updateSellerById: async (sellerId, updateData) => {
        try {
            const updatedSeller = await seller.findByIdAndUpdate(
                sellerId,
                updateData,
                { new: true, runValidators: true }
            );
            return updatedSeller;
        } catch (err) {
            throw err;
        }
    },

    getSeller: async (id) => {
        try {
            return await seller.findOne({ _id: id });
        } catch (err) {
            throw err;
        }
    },

    activeSeller: async (id) => {
        try {
            //return acknowlage

            return await seller.updateOne({ _id: id}, { isActive: true })
        } catch (err) {
            throw err;
        }
    },

    rejectSeller: async (id) => {
        try {
            //return acknolage

            return await seller.updateOne({ _id: id }, { status: -1 })
        } catch (err) {
            throw err;
        }
    },




    /*
    * 
    * filter for pending {isActive:true,status:false}
    * 
    *filter for active {isActive:true,status:true}
    *
    * filter for deactive {isActive:false,status:true}
    *  
    */


    getActiveSellers: async (page, limit, sort) => {
        return await getSellerByFilter(page, limit, sort, activeFilter);
    },

    getDeActiveSellers: async (page, limit, sort) => {
        return await getSellerByFilter(page, limit, sort, deactiveFilter);
    },

    getPendingSellers: async (page, limit, sort) => {

        console.log(page, limit, sort);

        return await getSellerByFilter(page, limit, sort, pendingFilter)
    },

    /****************************************************** */

    getSellers: async (filters, sort, page, limit) => {

        try {

            console.log("sort.... ",sort);

            const [results, total] = await Promise.all([

                await seller.find(filters)
                    .collation({ locale: 'en', strength: 1 })
                    .sort(sort)
                    .skip((page - 1) * limit) // (starting index = page-1)*limit
                    .limit(limit)
                    .lean(),

                await seller.countDocuments(filters).collation({ locale: 'en', strength: 1 }).exec()
            ]);

            // console.log("from repo" , results , total);

            return inboxResult(results, total, page, limit);


        } catch (err) {
            throw err;
        }
    },


    getCountByFilter: async (filter)=>{
        try {

            return  await seller.countDocuments(filter);

        } catch (err) {

            throw err;

        }

    }


}