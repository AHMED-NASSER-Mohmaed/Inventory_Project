const seller = require("../models/seller.model");
const inboxResult = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const { activeUser } = require("./user.repo");



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
    getSellerById: async (sellerId)=>{
        try{
            return await seller.findById(sellerId);
        }catch(err){
            throw err;
        }
    },

    //retun acknowlage , or throw exception
    deleteSeller: async (SSN_) => {

        try {
            return await seller.updateOne({ SSN: SSN_ }, {
                $set: { isActive: false }
            })

        } catch (erro) {
            throw erro;
        }

    },

    //retun acknowlage , or throw exception
    approveSeller: async (SSN_) => {
        try {
            return await seller.updateOne({ SSN: SSN_ }, {
                $set: { status: true }
            });
        } catch (err) {
            throw err;
        }
    },

    getSeller: async (SSN) => {
        try {
            return await seller.findOne({ SSN: SSN_ });
        } catch (err) {
            throw err;
        }
    },

    activeSeller: async (SSN_) => {
        try {
            //return acknolage
            return await seller.updateOne({ SSN: SSN_ }, { isActive: true })
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

        console.log(page,limit,sort);

        return await getSellerByFilter(page, limit, sort, pendingFilter)
    },



}