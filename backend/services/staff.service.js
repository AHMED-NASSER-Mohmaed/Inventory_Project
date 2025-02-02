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

    deleteStaff: async (data)=>{
        try{
            const ack=await staffRepo.deleteStaffOfType(data);
            if(!ack.acknowledged){
                throw new AppError("user not found",APP_CONFIG.HTTP_BAD_REQUEST);
            }
            return ack;
        }catch(err){
            throw err;
        }
    },

    getStaff:async (data)=>{
        try{
            const staff=await staffRepo.getStaffOfType(data);

            if(!staff){
                throw new AppError("user not found",APP_CONFIG.HTTP_BAD_REQUEST);
            }

            return staff;

        }catch(err){
            throw err;
        }
    },

    //ack -->false -- throw
    activeStaff:async (data)=>{
        try{
            const ack=await staffRepo.activeStaffOfType(data);

            if(!ack.acknowledged){
                throw new AppError("user not found",APP_CONFIG.HTTP_BAD_REQUEST);
            }

            return ack;
        }catch(err){
            throw err;
        }
    },

    getAll:async (role)=>{
        try{
            return await staffRepo.getALLStaffOfType(role);
        }catch(err){
            throw err;
        }
    }

    

}