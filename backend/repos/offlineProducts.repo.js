const OfflineProducts = require("../models/offlineSchema.model"); 

module.exports.OfflineProductsRepo={

    addOfflineProduct : async (data)=> {
        try{
            return await OfflineProducts.create(data);

        }catch(error){
            throw error;
        }
    },

    getOffProductById:async(id)=>{
        try{
            return await OfflineProducts.findById(id);
        }catch(error){
            throw error;
        }

    },

    updateQuantity :async (id , qty)=>{
        try{
            return await OfflineProducts.updateOne({_id:id},{$set:{stock:qty}});
        }catch(error){
            throw error;
        }
    },

    
    
}