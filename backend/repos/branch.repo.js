const Branch = require("../models/branch.model");
const AppError = require("../utils/appError");
const {inboxResult} = require("../utils/apiFeatures"); 

module.exports = {


    //add branch
    addBranch: async (data) => {
        try {

            const branch = new Branch(data);
            await branch.save();
            
        } catch (error) {
            throw error;
        }
    },

    updateBranch:async (id, data) => {
        try {

           return await Branch.updateOne( {_id :id } ,  {$set:data} , );
             
        } catch (error) {
 
            throw error;
        }
    },

    deleteBranch:async (id)=>{
        try{
            return await Branch.updateOne({_id:id},{isAvtive:false});
        }catch(error){
            throw error;
        }
    },

    activeBranch:async (id)=>{
        try{
            return await Branch.updateOne(({_id:id}, {isActive:true}));
        }catch(error){
            throw error;
        }
    },


    getBranches:async(filters , sort , page , limit )=>{
        try {

            const [results, total] = await Promise.all([

                await Branch.find(filters)
                    .sort(sort)
                    .skip((page - 1) * limit) // (starting index = page-1)*limit
                    .limit(limit)
                    .lean(),

                await Branch.countDocuments(filters).exec()
            ]);

           
            return inboxResult(results, total, page, limit);


        } catch (err) {
            throw err;
        }
    }




}