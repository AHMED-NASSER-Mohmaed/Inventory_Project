const OnlineProductsRepository=require("../repos/onlineProducts.repo");

module.exports.OnlineProductService={

    parseFilters: (filters) => {

        let fielters=["code" , "category" ,"name" , "isActive",'brand']

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

    getONProducts:async(validatedParams)=>{
        try{

            return await OnlineProductsRepository.getONProducts(this.OnlineProductService.parseFilters(validatedParams.filters),validatedParams.sort,
                validatedParams.page,validatedParams.limit
            )

        }catch(error){
            throw error;
        }
    },

    getPrductById:async(id)=>{
        try{
            return await OnlineProductsRepository.getProductByID(id);
        }catch(error){
            throw error;
        }
    }

}