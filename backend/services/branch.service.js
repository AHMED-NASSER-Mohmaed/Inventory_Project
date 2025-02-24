const branchRepo = require("../repos/branch.repo");
const AppError = require("../utils/appError");
const APP_CONFIG = require("../config/app.config");
const {staffRepo}=require("../repos/staff.repo");





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

            let fields = ['registrationNumber', 'governate', 'location']

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

            let ack= await branchRepo.deleteBranch(id);
            await staffRepo.UpdateStaffByInjection({branch:id},{$set:{branch:null,isActive:false}})
            return ack;
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
    },

    getBranchAdmin:async (id)=>{
        try{

            
            let branch= await branchRepo.getBranchById(id);
            console.log("from get bracnh amanager",branch);
            
            if(!branch || !branch['isActive']){
                throw new AppError("this branch is not exist!!", APP_CONFIG.HTTP_BAD_REQUEST);
            }

            return await staffRepo.getById(branch.admin);

        }catch(error){
            throw error;
        }
    },

    updateStffFromBranch:async(id,query)=>{
        try{
            return await branchRepo.updateBranchByInjextion(id,query)
        }catch(error){
            throw error;
        }
    }



}

