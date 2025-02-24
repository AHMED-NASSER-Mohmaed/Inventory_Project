const {productService}=require("../services/product.service");
const {OfflineProductsRepo} = require("../repos/offlineProducts.repo");
const { APP_CONFIG } = require("../config/app.config");
const AppError = require("../utils/appError");
const branch = require("../services/branch.service");
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
    },


    increaseStock:async(offProductId,qty)=>{

        try{
            
            if(qty<1)
                throw new AppError("invalid quantity",APP_CONFIG.HTTP_BAD_REQUEST);

            
            let offProduct=await OfflineProductsRepo.getOffProductById(offProductId);



            if(!offProduct)
                throw new AppError("product dose not exist",APP_CONFIG.HTTP_NOT_FOUND);

            await productService.isProductExist();

            return await OfflineProductsRepo.updateQuantity(offProductId,offProduct.stock+qty);


        }catch(error){
            throw error;
        }
    }
}