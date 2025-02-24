const { filter, forEach } = require("lodash");
const { staffRepo } = require("../repos/staff.repo");
const AppError = require("../utils/appError");
const { APP_CONFIG } = require("../config/app.config");
const {branchService} = require("../services/branch.service");



module.exports.staffService = {

    //done
    createStaff: async (data) => {
        try {

            let fields= ['firstName','lastName','email','phoneNumber','password','passwordConfirm','branch','SSN','managerId','role']

           

            Object.keys(data).forEach(element => {
                if (!fields.includes(element))
                    throw new AppError("invalid fields!!", APP_CONFIG.HTTP_BAD_REQUEST);
            });

            return await staffRepo.createStaffOfType(data);
        } catch (err) {
            throw err;
        }
    },

    //by id
    deleteStaff: async (filters) => {
        try {

            let obj= await staffRepo.getById(filters['_id']);

            if(!obj || !obj['isActive'])
                throw new AppError("staff dose not exist ", APP_CONFIG.HTTP_NOT_FOUND);


            const ack = await staffRepo.deleteStaffOfType(filters);
            if (!ack.acknowledged) {
                throw new AppError("user not found", APP_CONFIG.HTTP_BAD_REQUEST);
            }

            
            return ack;

        } catch (err) {
            throw err;
        }
    },

    //ack -->false -- throw
    activeStaff: async (filters) => {
        try {

            let obj= await staffRepo.getById(filters['_id']);           

            if(!obj )
                throw new AppError("staff dose not exist ", APP_CONFIG.HTTP_NOT_FOUND);

            if(obj['isActive'])
                throw new AppError("this user is already activated", APP_CONFIG.HTTP_BAD_REQUEST);

            const ack = await staffRepo.activeStaffOfType(filters);

            if (!ack.acknowledged) {
                throw new AppError("user not found", APP_CONFIG.HTTP_BAD_REQUEST);
            }

            return ack;
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

            let fields = ['SSN', 'firstName', 'lastName', 'phoneNumber','email'];

            Object.keys(data)
                .forEach(Element => {
                    if(!fields.includes(Element))
                        throw new AppError("invalid fields",APP_CONFIG.HTTP_BAD_REQUEST);
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