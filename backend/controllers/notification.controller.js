const { APP_CONFIG } = require("../config/app.config");
const {notificationService}=require("../services/notification.service");
const { sendResponseToClint } = require("../utils/apiFeatures");
const prot_rest = require("../utils/authMiddlewaresOptions");

const express = require("express");
 
const router = express.Router();

const notifiactionController={

    getAll:async(req,res,next)=>{    
        let result = await notificationService.getAllNotifications();
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,APP_CONFIG.SUCCESS_MESSAGE,result);
    },

    delete:async(req,res,next)=>{
        let result =await notificationService.deleteNotification(req.params.id);
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,APP_CONFIG.SUCCESS_MESSAGE,result);
    },
    markAsSeen:async(req,res,next)=>{
        let result = await notificationService.markAsSeen(req.params.id);
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,APP_CONFIG.SUCCESS_MESSAGE,result);
    }

}

router.get("/notifications",
    prot_rest(APP_CONFIG.SUPPERADMIN),
    notifiactionController.getAll
)

.patch("/notifications/:id",
    prot_rest(APP_CONFIG.SUPPERADMIN),
    notifiactionController.markAsSeen
)

.delete("/notifications/:id",
    prot_rest(APP_CONFIG.SUPPERADMIN),
    notifiactionController.delete
)

module.exports=router;