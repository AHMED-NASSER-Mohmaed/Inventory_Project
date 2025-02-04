const Staff=require("../models/staff.model");
const APP_CONST=require("../config/app.config");




module.exports.staffRepo={

     
    createStaffOfType:async (data)=>{

        try{
            data.userType="staff";

            return await Staff.create(data);

        }catch(err){
            throw err;
        }
    },

    deleteStaffOfType:async (data)=>{
        try{
            return await Staff.updateOne({ SSN:data.SSN , role:data.role },{isActive:false});
        }catch(err){
            throw err;
        }
    },

    getStaffOfType:async (data)=>{
        try{
            return await Staff.findOne({SSN:data.SSN,role:data.role});
        }catch(err){
            throw err;
        }
    },

    activeStaffOfType:async (data)=>{
        try{
            return await Staff.updateOne({SSN:data.SSN,role:data.role},{$set:{isActive:true}});
        }catch(err){
            throw err;
        }
    },

    getALLStaffOfType:async (role_)=>{
        try{
            return Staff.find({role:role_});
        }catch(err){
            throw err;
        }
    },
    
    



}