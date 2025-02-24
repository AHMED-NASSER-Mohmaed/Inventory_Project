const Staff = require("../models/staff.model");

const { inboxResult } = require("../utils/apiFeatures");



module.exports.staffRepo = {


    createStaffOfType: async (data) => {

        try {
            data.userType = "staff";

            return await Staff.create(data);
              

        } catch (err) {
            throw err;
        }
    },

    deleteStaffOfType: async (filters) => {
        try {
            return await Staff.updateOne(filters, { $set: { "isActive": false , branch:null}});
        } catch (err) {
            throw err;
        }
    },


    activeStaffOfType: async (filters,bid) => {
        try {
            
            return await Staff.updateOne(filters, { $set: { "isActive": true,branch:bid } });
        } catch (err) {
            throw err;
        }
    },

    getStaffOfTypeByFilter: async (filters, sort, page, limit) => {

        try {
            
            
            
            const [results, total] = await Promise.all([
                await Staff.find(filters)
                    .collation({ locale: 'en', strength: 1 })
                    .sort(sort)
                    .skip((page - 1) * limit) // (starting index = page-1)*limit
                    .limit(limit)
                    .populate({path:"branch",
                        select:"type governate location"
                    })
                    .select("-__v -kind")
                    .lean(),
                     
                await Staff.countDocuments(filters).collation({ locale: 'en', strength: 1 }).exec()
            ]);

            console.log("from repo" , results);

            return inboxResult(results, total, page, limit);


        } catch (err) {
            throw err;
        }
    },

    updateStaffOfType: async (filters, data) => {
        try {
            
            return await Staff.updateOne(filters, {$set:data});

        } catch (err) {
            throw err;
        }
    },


    getCountByFilter: async (filters) => {
        try {

            return await Staff.countDocuments(filters);

        } catch (err) {

            throw err;

        }

    },

    getById:async(id)=>{

        
        try{
            return await Staff.findById(id);
        }catch(err){
            throw err;
        }

    },

    UpdateStaffByInjection:async(filter,query)=>{
        try{
            return await Staff.updateMany(filter,query);
        }catch(err){
            throw err;
        }
    }

    

}