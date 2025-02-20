const { filter } = require("lodash");
const {staffRepo}= require("../repos/staff.repo");
const AppError=require("../utils/appError");

module.exports.staffService={
    
    
    createStaff: async (data)=>{
        try{
            return await staffRepo.createStaffOfType(data);
        }catch(err){
            throw err;
        }
    },

    deleteStaff: async (filters)=>{
        try{
            const ack=await staffRepo.deleteStaffOfType(filters);
            if(!ack.acknowledged){
                throw new AppError("user not found",APP_CONFIG.HTTP_BAD_REQUEST);
            }
            return ack;
        }catch(err){
            throw err;
        }
    },
 
    //ack -->false -- throw
    activeStaff:async (filters)=>{
        try{
            const ack=await staffRepo.activeStaffOfType(filters);

            if(!ack.acknowledged){
                throw new AppError("user not found",APP_CONFIG.HTTP_BAD_REQUEST);
            }

            return ack;
        }catch(err){
            throw err;
        }
    },

    // role is my filteration rule

    getAll:async(role)=>{
        try{
            return await staffRepo.getALLStaffOfType(role);
        }catch(err){
            throw err;
        }
    },

    getStaffByFilter:async(data)=>{
        try{
            return await staffRepo.getStaffOfTypeByFilter(data.filters,data.sort,data.page,data.limit);
        }catch(err){
            throw err;
        }
    },


    updateStaff:async(filters,data)=>{
        try{    
            fields=['SSN', 'firstName','lastName','phoneNumber'];

            return await staffRepo.updateStaffOfType(filters,data);

        }catch(err){
            throw err;
        }
    }
    

}