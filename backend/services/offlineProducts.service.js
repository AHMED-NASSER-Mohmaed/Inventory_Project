const {productService}=require("../services/product.service");
const {OfflineProductsRepo} = require("../repos/offlineProducts.repo");
const { APP_CONFIG } = require("../config/app.config");

module.exports.OfflineProductsService={
    
    addOfflineProduct:async(data)=>{
        try{
            data.status='approved'

            let newProduct = await productService.addProduct(data);
            
            return await OfflineProductsRepo.addOfflineProduct({branch:APP_CONFIG.MAIN_BRANCH_ID,
                product:newProduct._id,stock:data.stock
            });



        }catch(error){
            throw error;
        }
    }
}