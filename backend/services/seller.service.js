const { sellerRepo } = require("../repos/sellers.repo");
const AppError = require("../utils/appError");
const APP_CONFIG = require("../config/app.config")

const sellerInventoryRepo = require("../repos/sinventory.repo");
const productRepo = require("../repos/product.repo");

//refactored
async function  getSellersWithCallBack(validatedParams, callBack)  {

    let sort = {};
    if (validatedParams.sort['field'] == "name") { // the other option is createdAt
        sort = {
            "firstName": validatedParams.sort['order'],
            "lastName": validatedParams.sort['order']
        }
    }

    try {
        return await callBack(validatedParams.page, validatedParams.limit, validatedParams.sort)
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

            const seller=await sellerRepo.getSeller(SSN);
            console.log(seller);
            if(!seller['status'])
                throw new AppError("you cannot de-active pending seller!!",APP_CONFIG.HTTP_BAD_REQUEST);

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

            const seller=await sellerRepo.getSeller(SSN);

            if(!seller['status'])
                throw new AppError("you cannot active pending seller!!",APP_CONFIG.HTTP_BAD_REQUEST);
                
                
            const ack= await sellerRepo.activeSeller(SSN);

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

    getAllSellers:async function (params) {
        try{

            return await sellerRepo.getSellers();

        }catch(err){
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
        return await getSellersWithCallBack(validatedParams, sellerRepo.getDeActiveSellers)
    },
    getPendingSellersService: async (validatedParams) => {
        return await getSellersWithCallBack(validatedParams, sellerRepo.getPendingSellers);
    }
    ,


   getSellers:async(data)=>{
        try{
            return await sellerRepo.getSellers(data.filters,data.sort,data.page,data.limit);
        }catch(err){
            throw err;
        }

   },

   updateSellerById: async(sellerId, updateData, userType)=>{

        try{

            const { firstName, lastName,  phoneNumber,  SSN, companyName, companyRegistrationNumber, ...rest} = updateData;

            
            
            if(userType == 'seller'){
                return await sellerRepo.updateSellerById(sellerId, {
                    ...(firstName !== undefined && { firstName }),
                    ...(lastName !== undefined && { lastName }),
                    ...(phoneNumber !== undefined && { phoneNumber })
                });
            }else if(userType == 'staff'){

                if(companyName){
                   const isUpdatedInventories = await sellerInventoryRepo.updateInventoryByProviderId(sellerId, {companyName});
                    const isUpdatedProducts = await productRepo.updateProductBysellerId(sellerId, {companyName});
                    if(!isUpdatedInventories || !isUpdatedProducts){
                        throw new AppError("Failed to update related schemes!!");
                    }
                }

                return await sellerRepo.updateSellerById(sellerId, {
                    ...(firstName !== undefined && { firstName }),
                    ...(lastName !== undefined && { lastName }),
                    ...(phoneNumber !== undefined && { phoneNumber }),
                    ...(SSN !== undefined && {SSN}),
                    ...(companyName !== undefined && { companyName }),
                    ...(companyRegistrationNumber !== undefined && { companyRegistrationNumber }),
                  });

            }
            
        }catch(err){

        }
   }

}