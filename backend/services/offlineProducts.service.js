const {productService}=require("../services/product.service");
const {OfflineProductsRepo} = require("../repos/offlineProducts.repo");
const { APP_CONFIG } = require("../config/app.config");
const AppError = require("../utils/appError");
module.exports.OfflineProductsService={
    
    addOfflineProduct:async(data)=>{
        try{
            data.status='approved'

            let newProduct = await productService.addProduct(data);
            
            return await OfflineProductsRepo.addOfflineProduct({branch:APP_CONFIG.MAIN_BRANCH_ID,
                product:newProduct._id,stock:data.stock
            });



        }catch(error){
            console.log("from add of line product");
            throw error;
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

    getOfflineProducts:async(filters)=>{
        try{

        }catch(error){
            throw error;
        }
    }
}