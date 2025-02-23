const branchRepo = require("../repos/branch.repo");
const AppError = require("../utils/appError");
const APP_CONFIG = require("../config/app.config");
const { getCountByFilter } = require("./user.service");




module.exports = {

    addBranch: async (data) => {

        try {

            fields = ['registrationNumber', 'governate', 'location',]

            Object.keys(data).forEach(element => {
                if (!fields.includes(element))
                    throw new AppError("invalid fields!!", APP_CONFIG.HTTP_BAD_REQUEST);
            });

            return await branchRepo.addBranch(data);

        } catch (err) {
            throw err;
        }
    },

    getBranchesMaped : async()=>{
        try{
            return branchRepo.getBranchesMaped();
        }catch(error){
            throw error;
        }
    },

    updateBranch: async (id,data) =>{

        try {

            fields = ['registrationNumber', 'governate', 'location',]

            Object.keys(data).forEach(element => {
                if (!fields.includes(element))
                    throw new AppError("invalid fields!!", APP_CONFIG.HTTP_BAD_REQUEST);
            });

            let res= await branchRepo.updateBranch(id,data);
            

        } catch (err) {
            throw err;
        }
        
    },

    deleteBranch:async (id)=>{
        try {

            return await branchRepo.deleteBranch(id);

        } catch (err) {
            throw err;
        }
    },

    activeBranch:async (id)=>{
        try{
            return branchRepo.activeBranch(id);
        }catch(error){
            throw error;
        }
    },

    getBranches:async (validatedParams)=>{
        try{
            return await branchRepo.getBranches(validatedParams.filters,validatedParams.sort,validatedParams.page,validatedParams.limit);
        }catch(error){
            throw error;            
        }
    },

    getCountByFilter:async (filters)=>{
        try{
            return await branchRepo.getCountByFilter(filters); 
        }catch(error){
            throw error;
        }
    }



}

