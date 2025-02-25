const {productService}=require("../services/product.service");
const {OfflineProductsRepo} = require("../repos/offlineProducts.repo");
const { APP_CONFIG } = require("../config/app.config");
const AppError = require("../utils/appError");

require("../services/branch.service"); 

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

    parseFilters:(filters)=>{
        return  Object.fromEntries(

            Object.entries(filters).map(
                ([key, value]) =>{

                    if(key==='isActive')
                        return [`product.${key}`, value]

                    return [`${key}`, value]
                } 
            )
    )
        
    },

    getOfflineProducts:async(validatedParams)=>{
        try{
            
            return await OfflineProductsRepo.getOffProducts(this.OfflineProductsService.parseFilters(validatedParams.filters),
            validatedParams.sort,validatedParams.page,validatedParams.limit);
        
        }catch(error){
            throw error;
        }
    },

    getOffProCount:async(filters)=>{
        try{
            return await OfflineProductsRepo.getCount(this.OfflineProductsService.parseFilters(filters));
        }catch(err){
            throw err;
        }
    },

    // exportTo:async(productId)=>{
    //     try{
    //         //export to branch --> you have to cheack branch first 
    //         let loactedBranch = await 
    //     }catch(err){
    //         throw err;
    //     }

    // }




    
}