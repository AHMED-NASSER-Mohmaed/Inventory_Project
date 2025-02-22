const Branch = require("../models/branch.model");
const AppError = require("../utils/appError");
const { inboxResult } = require("../utils/apiFeatures");

module.exports = {


    //add branch
    addBranch: async (data) => {
        try {
            // data['_id']=-1;
            // console.log(data);
            const branch = new Branch(data);
            await branch.save();

        } catch (error) {
            throw error;
        }
    },

    //for search
    getBranchesMaped: async () => {
        try {
            const branches = await Branch.find({}, "_id governorate location");

            // Convert the array to an object with `_id` as the key
            const branchMap = {};
            branches.forEach(branch => {
                branchMap[branch._id] = {
                    governorate: branch.governorate,
                    location: branch.location
                };
            });

            return branchMap;
        } catch (error) {
            throw error;
        }
    },



    updateBranch: async (id, data) => {
        try {

            return await Branch.updateOne({ _id: id }, { $set: data },);

        } catch (error) {

            throw error;
        }
    },

    deleteBranch: async (id) => {
        try {
            const branch = await Branch.findById(id);
            if (!branch) {
                throw new Error("Branch does not exist");
            }
            return await Branch.updateOne({ _id: id }, { isAvtive: false });
        } catch (error) {
            throw error;
        }
    },


    activeBranch: async (id) => {
        try {

            const branch = await Branch.findById(id);
            if (!branch) {
                throw new Error("Branch does not exist");
            }

            return await Branch.updateOne({ _id: id }, { isActive: true });

        } catch (error) {
            throw error;
        }
    },


    //search by governate--number , active -- deactive  
    getBranches: async (filters, sort, page, limit) => {
        try {

             const [results, total] = await Promise.all([

                await Branch.find(filters)
                    .sort(sort)
                    .skip((page - 1) * limit) // (starting index = page-1)*limit
                    .limit(limit)
                    .lean(),

                await Branch.countDocuments(filters).exec()
            ]);

            console.log(results);

            return inboxResult(results, total, page, limit);

        } catch (err) {
            throw err;
        }
    },

    getCountByFilter:async (filters)=>{
        try{
            return await Branch.countDocuments(filters);
        }catch(error){
            throw error;
        }
    }




}