const { sellerRepo } = require("../repos/sellers.repo");
const AppError = require("../utils/appError");
const APP_CONFIG = require("../config/app.config")


async function  getSellersWithCallBack(validatedParams, callBack)  {

    let sort = {};
    if (validatedParams.sort['field'] == "name") { // the other option is createdAt
        sort = {
            "firstName": validatedParams.sort['order'],
            "lastName": validatedParams.sort['order']
        }
    }

    try {
        return await callBack(validatedParams.page, validatedParams.limit, sort)
    } catch (err) {
        throw err;
    }
}
module.exports.sellerService = {

    //create seller
    //done
    createSeller: async (data) => {
        //repo will insert UserType for seller
        try {
            return await sellerRepo.createSeller(data);
        } catch (err) {
            throw err;
        }
    },
    //return acknowlage  , or throw an exception.
    //done
    deleteSeller: async (SSN) => {
        try {

            const ack = await sellerRepo.deleteSeller(SSN);

            if (!ack.acknowledged) {
                throw new AppError("user not found", APP_CONFIG.HTTP_BAD_REQUEST);
            }

            return ack;

        } catch (err) {
            throw err;
        }
    },

    //done
    activeSeller: async (SSN) => {
        try {

            const ack = await sellerRepo.activeSeller(SSN);



            if (!ack.acknowledged) {
                throw new AppError("user not found", APP_CONFIG.HTTP_BAD_REQUEST);
            }

            return ack;
        } catch (err) {
            //from database
            throw err;
        }
    },

    //done
    approveSeller: async (SSN) => {
        try {
            const ack = await sellerRepo.approveSeller(SSN);

            if (!ack.acknowledged) {
                throw new AppError("user not found", APP_CONFIG.HTTP_BAD_REQUEST);
            }

            console.log(ack);

            return ack;

        } catch (err) {
            throw err;
        }
    },


    /*
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     */

    
    getActiveSellersService: async (validatedParams) => {
        return await getSellersWithCallBack(validatedParams, sellerRepo.getActiveSellers);
    },

    getDeActiveSellersService: async (validatedParams) => {
        return await getSellersWithCallBack(validatedParams, sellerRepo.getActiveSellers)
    },
    getPendingSellersService: async (validatedParams) => {
        return await getSellersWithCallBack(validatedParams, sellerRepo.getPendingSellers);
    }
    ,


   

}