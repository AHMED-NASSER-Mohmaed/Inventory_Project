const Staff=require("../models/staff.model");
 
const {inboxResult}=require("../utils/apiFeatures");
 


module.exports.staffRepo={

     
    createStaffOfType:async (data)=>{

        try{
            data.userType="staff";

            if(await Staff.create(data))
                return true
            return false; 

        }catch(err){
            throw err;
        }
    },

    deleteStaffOfType:async (filters)=>{
        try{
            return await Staff.updateOne(filters,{$set:{"isActive":false}});
        }catch(err){
            throw err;
        }
    },

 


    activeStaffOfType:async (filters)=>{
        try{
            return await Staff.updateOne(filters,{$set:{"isActive":true}});
        }catch(err){
            throw err;
        }
    },
 

    
    getStaffOfTypeByFilter:async (filters,sort,page,limit)=>{

        try{
            
            const [results, total] = await Promise.all([

                await Staff.find(filters)
                    .collation({ locale: 'en', strength: 1 })
                    .sort(sort)
                    .skip((page - 1) * limit) // (starting index = page-1)*limit
                    .limit(limit)
                    .select("-__v -kind")
                    .lean(),
    
                await Staff.countDocuments(filters).collation({ locale: 'en', strength: 1 }).exec()
            ]);
    
            // console.log("from repo" , results);
    
            return inboxResult(results, total, page, limit);

  
        }catch(err){
            throw err;
        }
    },

    updateStaffOfType:async (filters,data)=>{
        
        try{

            return await Staff.updateOne(filters,data);

        }catch(err){
            throw err;
        }
    }


}