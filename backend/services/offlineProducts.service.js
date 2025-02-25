const {productService}=require("../services/product.service");
const {OfflineProductsRepo} = require("../repos/offlineProducts.repo");
const { APP_CONFIG } = require("../config/app.config");
const AppError = require("../utils/appError");
const { filter } = require("lodash");
module.exports.OfflineProductsService={
    
    addOfflineProduct:async(data)=>{
        try{
            data.status='approved'
            
            let newProduct = await productService.addProduct(data);
            
            return await OfflineProductsRepo.addOfflineProduct({branch:APP_CONFIG.MAIN_BRANCH_ID,
                product:newProduct._id,stock:data.stock
            });



        }catch(err){
            
            throw err;
        }
    },


    updateQuantitiy:async(offProductId,qty)=>{
        try{
                        
            let offProduct=await OfflineProductsRepo.getOffProductById(offProductId);

            if(!offProduct)
                throw new AppError("product dose not exist",APP_CONFIG.HTTP_NOT_FOUND);

            let newQty=offProduct.stock+ +qty;


            if(newQty<1)
                throw new AppError("invalid quantity",APP_CONFIG.HTTP_BAD_REQUEST);


            await productService.isProductExist(offProduct.product);


            return await OfflineProductsRepo.updateQuantity(offProductId,newQty);


        }catch(error){
            throw error;
        }
    },

    getOfflineProducts:async(validatedParams)=>{
        try{
            let offlineFilter={} ;

            if(validatedParams.filters.branch){
                offlineFilter['branch']=validatedParams.filters.branch;
                delete validatedParams.filters.branch;
            }

            return await OfflineProductsRepo.getOffProducts(offlineFilter,validatedParams.filters,validatedParams.sort,validatedParams.page,validatedParams.limit);
        
        }catch(error){
            throw error;
        }
    }
}