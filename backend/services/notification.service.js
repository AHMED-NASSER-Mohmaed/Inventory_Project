const { APP_CONFIG } = require("../config/app.config");
const { notificationRepo } = require("../repos/notifications.repo");
const AppError = require("../utils/appError");


module.exports.notificationService={
    
    getAllNotifications:async()=>{
        try{
            
            let Filter={status:{$ne:APP_CONFIG.DELETED_STATUS}};
            return await notificationRepo.getAllNotifications(Filter);
        }catch(error){
            throw error;
        }
    },

    markAsSeen:async(id)=>{
        try{
            if(!id)
                throw new AppError("invalid params!",APP_CONFIG.HTTP_BAD_REQUEST);


            let filter={_id:id};
            let newData={$set:{status:APP_CONFIG.SEEN_STATUS}};

            return await notificationRepo.updateNotification(filter,newData);
        }catch(error){
            throw error;
        }
    },

    deleteNotification:async(id)=>{
        try{

            if(!id)
                throw new AppError("invalid params!",APP_CONFIG.HTTP_BAD_REQUEST);


            let filter={_id:id};
            let newData={$set:{status:APP_CONFIG.DELETED_STATUS}};

            return await notificationRepo.updateNotification(filter,newData);

        }catch(error){
            throw error;
        }
    }
}