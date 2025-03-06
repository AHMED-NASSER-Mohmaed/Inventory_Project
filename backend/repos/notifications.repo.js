const notification=require('../models/notification.model')

module.exports.notificationRepo={
    getAllNotifications:async(filter)=>{
        try{
            return await notification.find(filter)
            .populate({
                path: "product",
                select: "name code -_id"
            })
            .populate({
                path: "branch",
                select: "governate location -_id"
            }).select("-__v -updatedAt");
        
        }catch(error){
            throw error;
        }
    },

    updateNotification:async(filter,newData)=>{
        try{
            return await notification.updateOne(filter,newData);
        }catch(error){
            throw error;
        }
    }
}