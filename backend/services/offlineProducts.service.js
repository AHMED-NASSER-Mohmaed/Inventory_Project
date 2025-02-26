const { productService } = require("../services/product.service");
const { OfflineProductsRepo } = require("../repos/offlineProducts.repo");
const OnlineProductsRepository=require("../repos/onlineProducts.repo");
const { APP_CONFIG } = require("../config/app.config");
const AppError = require("../utils/appError");
const branchService = require("../services/branch.service");


require("../services/branch.service");

module.exports.OfflineProductsService = {

    addOfflineProduct: async (data) => {
        try {
            data.status = 'approved'

            let newProduct = await productService.addProduct(data);

            return await OfflineProductsRepo.addOfflineProduct({
                branch: APP_CONFIG.MAIN_BRANCH_ID,
                product: newProduct._id, stock: data.stock
            });



        } catch (err) {

            throw err;
        }
    },
    //for decreasing qty with negative value.
    updateQuantitiy: async (offProductId, qty) => {
        try {

            let offProduct = await OfflineProductsRepo.getOffProductByIdAndBrandId(offProductId,APP_CONFIG.MAIN_BRANCH_ID);

             
            if (!offProduct)
                throw new AppError("product dose not exist", APP_CONFIG.HTTP_NOT_FOUND);

            if (offProduct.branch['type'] != 'main' || offProduct.branch._id != APP_CONFIG.MAIN_BRANCH_ID)
                throw new AppError("you can update quntatiy expet main branch qty.", APP_CONFIG.HTTP_BAD_REQUEST);

            let newQty = offProduct.stock + +qty;


            if (newQty < 1)
                throw new AppError("invalid quantity", APP_CONFIG.HTTP_BAD_REQUEST);



            await productService.isProductExist(offProduct.product);


            return await OfflineProductsRepo.updateQuantity(offProductId, newQty);


        } catch (error) {
            throw error;
        }
    },

    parseFilters: (filters) => {

        let fielters=["code" , "brand", "category" ,"name"]

        return Object.fromEntries(

            Object.entries(filters).map(
                ([key, value]) => {

                    if (fielters.includes(key))
                        return [`product.${key}`, value]

                    return [`${key}`, value]
                }
            )
        )

    },

    getOfflineProducts: async (validatedParams) => {
        try {
            
            return await OfflineProductsRepo.getOffProducts(this.OfflineProductsService.parseFilters(validatedParams.filters),
                validatedParams.sort, validatedParams.page, validatedParams.limit);

        } catch (error) {
            throw error;
        }
    },

    getOffProCount: async (filters) => {
        try {
            return await OfflineProductsRepo.getCount(this.OfflineProductsService.parseFilters(filters));
        } catch (err) {
            throw err;
        }
    },

    //souce -- > destination
    exportTo: async (offProductId, sourceBranchId, destinationBranchId, qty) => {
        try {
            if(isNaN(qty))
                throw new AppError("invalid params.",APP_CONFIG.HTTP_BAD_REQUEST);

            if (sourceBranchId === destinationBranchId)
                throw new AppError("you can not export to the same branch");


            //export to branch --> you have to cheack branch first 
            //if product is exist and avalilabe to put there a qty
            //may be the main , may be a sub one , or online bracnh
            let sourceBranch = await branchService.isBrachExist(sourceBranchId);
            let destinationBranch = await branchService.isBrachExist(destinationBranchId);
            
                //source is offline || sub  || main --> branch
                let offProduct = await OfflineProductsRepo.getOffProductByIdAndBrandId(offProductId,sourceBranchId);

                if(!offProduct)
                    throw new AppError("the branch dose not have this product.");


                console.log(offProduct);

                //the new qty is the qty that will be decreased from the source branch
                let newSourceQty = offProduct.stock - +qty;

                if (newSourceQty < 1)
                    throw new AppError("this source branch dose not have enough quantity", APP_CONFIG.HTTP_BAD_REQUEST);

                let newDestQty = qty ;


                await productService.isProductExist(offProduct.product);

                //detination offline branch product
                //findOne and update if it dose not exist add an offline product to it 

                await OfflineProductsRepo.updateQuantity(offProductId, newSourceQty);

                await OfflineProductsRepo.upsertOffProduct(offProduct.product, destinationBranchId, newDestQty);

                //it is the time to update our source online qty if it exist and if it is not create new one as a sellers 
                
                if (destinationBranch['type'] === 'online') {
                    //may be the first time to export this product to online sysytem
                    console.log("hhhhhhhhhhhhhhhhhh");
                    return  OnlineProductsRepository.upsertOurSellerRecord(offProduct.product,qty);
                }else if (sourceBranch['type']==='online'){
                    // we have a record in online system product.
                    return  OnlineProductsRepository.upsertOurSellerRecord(offProduct.product,newSourceQty);
                }                
                 

        } catch (err) {
            throw err;
        }

    },

    
 
}