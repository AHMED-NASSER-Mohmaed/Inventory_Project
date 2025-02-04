const  seller= require("../models/seller.model");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");

module.exports.sellerRepo={


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

    
    createSeller: async (sellerData)=>{
        try{
            sellerData.userType="seller";
            return await seller.create(sellerData);
        }catch(err){
            throw err;
        }

    },

    //retun acknowlage , or throw exception
    deleteSeller: async (SSN_)=>{

        try{
            return await seller.updateOne({SSN:SSN_},{
                $set:{isActive:false}
            }) 

        }catch(erro){
            throw erro;
        }

    },

    //retun acknowlage , or throw exception
    approveSeller:async (SSN_)=>{
        try{
            return await seller.updateOne({SSN:SSN_},{
                $set:{status:true}
            });
        }catch(err){
            throw err;
        }
    },

    getSeller:async (SSN)=>{
        try{
             return await seller.findOne({SSN:SSN_});
        }catch(err){
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

    activeSeller:async (SSN_)=>{
        try{
            //return acknolage
            return await seller.updateOne({SSN:SSN_},{isActive:true})
        }catch(err){
            throw err;
        }
    }
}