const SupplierRepository = require("../repos/supplier.repo");
const AppError = require("../utils/appError");
const { APP_CONFIG } = require("../config/app.config");

class SupplierService {
  
    //reviewed 
    async createSupplier(supplierData) {
        try {
              return await SupplierRepository.createSupplier(supplierData);
        } catch (err) {
            throw err;
        }
    }

  
    //reviewed
    async getSuppliers(validatedParams) {
        try {

            return await SupplierRepository.getSuppliers(validatedParams.filters,validatedParams.sort,validatedParams.page,validatedParams.limit);
        
        } catch (err) {

            throw err;

        }
    }

    
    //reviewed
    async getCount(filters) {
        try{
            return await SupplierRepository.getCount(filters);
        }catch(err){
            throw err;
        }
    }


    //reviewed
    async updateSupplier(supplierId, updateData) {

        try {

            const supplier = await SupplierRepository.updateSupplier(supplierId, updateData);

            if (!supplier) {
                throw new AppError('Supplier not found', 404);
            }else if(!supplier.acknowledged)
                throw new AppError('invalid fields',APP_CONFIG.HTTP_BAD_REQUEST)

            return supplier;
        } catch (err) {
            throw err;
        }
    }

    //reviewed
    async deleteSupplierById(supplierId) {
        try {
            const supplier = await SupplierRepository.deleteSupplierById(supplierId);
            if (!supplier) {
                throw new AppError('Supplier not found', 404);
            }
            return supplier;
        } catch (err) {
            throw err;
        }
    }

    
    //reviewed
    async activateSupplier(supplierId) {
        try {

            if(!supplierId)
                throw new AppError("invalid params",APP_CONFIG.HTTP_BAD_REQUEST);

            let supplier=null;
            
            supplier = await SupplierRepository.activateSupplier(supplierId);
            if (!supplier) {
                throw new AppError('Supplier not found', APP_CONFIG.HTTP_NOT_FOUND);
            }

            console.log(supplier,"from service...");

            return supplier;
        } catch (err) {
            throw err;
        }
    }


    //for add product
    //reviewed
    async isSupplierExist(supplierId) {
        try {
            return await SupplierRepository.getSupplierById(supplierId);

        } catch (err) {
            throw err;
        }
    }


}

module.exports = new SupplierService();