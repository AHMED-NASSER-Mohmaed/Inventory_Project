const { staffRepo } = require("../repos/staff.repo");
const AppError = require("../utils/appError");
const { APP_CONFIG } = require("../config/app.config");
const branchService = require("../services/branch.service");
 



module.exports.staffService = {

    //done
    createStaff: async (data) => {
        try {

            if (!data.branch)
                throw new AppError('branch must be selected!', APP_CONFIG.HTTP_BAD_REQUEST);


            let admin=await branchService.getBranchAdmin(data.branch);


            if(data.role==APP_CONFIG.ADMIN && admin){
                // this.staffService.updateStaff(admin._id,{branch:null,isActive:false});
                throw new AppError("you have to delete the current admin firstly!!",APP_CONFIG.HTTP_BAD_REQUEST);
            } 

            let fields = ['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'passwordConfirm', 'branch', 'SSN', 'managerId', 'role']


             
            Object.keys(data).forEach(element => {
                if (!fields.includes(element)){
                   
                    throw new AppError("invalid fields!!", APP_CONFIG.HTTP_BAD_REQUEST);
                }
            });

            let res= await staffRepo.createStaffOfType(data);

            if(data.role==APP_CONFIG.ADMIN)
                await branchService.updateBranchStaff(data.branch,{$set:{admin:res._id}});
            else
                await branchService.updateBranchStaff(data.branch,{$push:{employees:res._id}});
            return res;

        } catch (err) {
            throw err;
        }
    },

    //by id
    deleteStaff: async (filters) => {
        try {

            let obj = await staffRepo.getById(filters['_id']);

            if (!obj || !obj['isActive'])
                throw new AppError("staff dose not exist ", APP_CONFIG.HTTP_NOT_FOUND);


            console.log(obj.branch);

            if(obj.branch){
                if(obj.role==APP_CONFIG.ADMIN)
                    await branchService.updateBranchStaff(obj.branch,{$set:{admin:null}});
                else 
                    await branchService.updateBranchStaff(obj.branch,{$pull:{employees:obj._id}});
            }

            return await staffRepo.deleteStaffOfType(filters);
            
            
        } catch (err) {
            throw err;
        }
    },

    //ack -->false -- throw
    activeStaff: async (filters) => {
        try {

            if(!filters._id ||  !filters.branch || !filters.role)
                throw new AppError("invalid params!!",APP_CONFIG.HTTP_BAD_REQUEST);

            
            let obj = await staffRepo.getById(filters._id);
            
            if (!obj)
                throw new AppError("staff dose not exist ", APP_CONFIG.HTTP_NOT_FOUND);
            
            if (obj['isActive'])
                throw new AppError("this user is already activated and has it's own branch", APP_CONFIG.HTTP_BAD_REQUEST);
            

            //chek if branch has an admin or not 
            if(obj.role==APP_CONFIG.ADMIN){
                
                let admin=await branchService.getBranchAdmin(filters.branch);
                
                if(admin){
                    throw new AppError("you have to delete the current admin firstly!!",APP_CONFIG.HTTP_BAD_REQUEST);
                }
                await branchService.updateBranchStaff(filters.branch,{$set:{admin:filters._id}});
                
            }else{
                
                await branchService.updateBranchStaff(filters.branch,  { $push: { employees: obj._id } });
                
            }


            let branch=filters.branch;
            delete filters.branch;

            return await staffRepo.activeStaffOfType(filters,branch);


        } catch (err) {
            throw err;
        }
    },

    // role is my filteration rule

    getAll: async (role) => {
        try {
            return await staffRepo.getALLStaffOfType(role);
        } catch (err) {
            throw err;
        }
    },

    getStaffByFilter: async (data) => {
        try {
            return await staffRepo.getStaffOfTypeByFilter(data.filters, data.sort, data.page, data.limit);
        } catch (err) {
            throw err;
        }
    },


    updateStaff: async (filters, data) => {
        try {

            let fields = ['SSN', 'firstName', 'lastName', 'phoneNumber', 'email'];

            Object.keys(data)
                .forEach(Element => {
                    if (!fields.includes(Element))
                        throw new AppError("invalid fields", APP_CONFIG.HTTP_BAD_REQUEST);
                })

            return await staffRepo.updateStaffOfType(filters, data);

        } catch (err) {
            throw err;
        }
    },

    //allowed fields isActive   ||  values --> true || false 
    getStaffCount: async (filters) => {
        try {
            return staffRepo.getCountByFilter(filters);
        } catch (err) {
            return err;
        }
    },






}