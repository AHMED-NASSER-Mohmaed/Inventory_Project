const {brandRepo} = require("../repos/brand.repo");
const AppError = require("../utils/appError");
const { APP_CONFIG } = require("../config/app.config");


module.exports.brandService = {


    addBrand: async (data) => {
        try {
            let fields = ['Bname'];

            Object.keys(data).forEach(element => {

                if (!fields.includes(element))
                    throw new AppError("invalid fileds",APP_CONFIG.HTTP_NOT_FOUND)
            });

            return await brandRepo.addBrand(data);

        } catch (error) {
            throw error;
        }
    },

    updateBrand: async (id, data) => {

        try {

            let fields = ['Bname'];

            Object.keys(data).forEach(element => {

                if (!fields.includes(element))
                    throw new AppError("invalid fileds",)
            });

            let ack = await brandRepo.updateBrand(id,data);

            if (!ack) {
                throw new AppError('brand not found', APP_CONFIG.HTTP_NOT_FOUND);
            } else if (!ack.acknowledged)
                throw new AppError('invalid fields', APP_CONFIG.HTTP_BAD_REQUEST)


        } catch (error) {
            throw error;
        }


    },

    deleteBrand: async (id) => {

        try {
            let ack = await brandRepo.deleteBrand(id);

            if (!ack)
                throw new AppError('brand not found', 404);


            return ack;

        } catch (error) {
            throw error;
        }

    },

    activeBrand: async (id) => {

        try {
            let ack = await brandRepo.activeBrand(id);

            if (!ack)
                throw new AppError('brand not found', 404);
            return ack;

        } catch (error) {
            throw error;
        }
    },

    //pagination + search by name
    getBrands: async (validatedParams) => {
        try {
            return await brandRepo.getBrands(validatedParams.filters, validatedParams.sort, validatedParams.page, validatedParams.limit);
        } catch (error) {
            throw error;
        }
    },

    //isActive or not only

    getCount: async (filters)=>{
        try{
            return await brandRepo.getCountByFilter(filters);
        }catch(error){
            throw error;
        }
    }


}