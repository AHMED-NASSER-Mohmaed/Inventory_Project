const OfflineProducts = require("../models/offlineSchema.model"); 

module.exports.OfflineProductsRepo={

    
    addOfflineProduct:async (data)=> {
        try{
            return await OfflineProducts.create(data);

        }catch(error){
            throw error;
        }
        

    }
}