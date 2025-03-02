const OnlineProductsRepository=require("../repos/onlineProducts.repo");

module.exports.OnlineProductService={

    parseFilters: (filters,fieldes) => {

        return Object.fromEntries(

            Object.entries(filters).map(
                ([key, value]) => {

                    if (fieldes.includes(key))
                        return [`product.${key}`, value]

                    return [`${key}`, value]
                }
            )
        )

    },
    
    //for yomna 
    getONProductsSite:async(validatedParams)=>{
        try{
            let fieldes=["code" , "category" ,"name" , "isActive",'brand','status'];
            let filters=this.OnlineProductService.parseFilters(validatedParams.filters,fieldes);
            filters['isActive']=true;
            filters['isDeleted']=true;
            filters['status']='approved';
            return await OnlineProductsRepository.getONProducts(filters,validatedParams.sort,
                validatedParams.page,validatedParams.limit
            )

        }catch(error){
            throw error;
        }
    },

    //for product details
    getPrductById:async(id)=>{
        try{
            return await OnlineProductsRepository.getProductByID(id);
        }catch(error){
            throw error;
        }
    },
    getONProductsDash:async(validatedParams)=>{
        try{
            let fieldes=["code" , "category" ,"name" , "isActive",'brand'];
            return await OnlineProductsRepository.getONProducts(this.OnlineProductService.parseFilters(validatedParams.filters),validatedParams.sort,
                validatedParams.page,validatedParams.limit
            )

        }catch(error){
            throw error;
        }
    },
    

}