const express = require("express");
const catchAsync=require("../utils/catchAsync")
const {sellerService}= require("../services/seller.service");
const authMiddleware=require("../middlewares/auth.middleware");
const { APP_CONFIG } = require("../config/app.config");
const prot_rest=require("../utils/authMiddlewaresOptions");

const adminRoute= express.Router();

// adminRoute.use(authMiddleware.protect);


const addSeller= async (req,res,next)=>{

    const user=await sellerService.createSeller(req.body);
    res.status(APP_CONFIG.HTTP_CREATED).json({
        message:"success",
        user,
    })
}

const getSeller= async (req,res,next)=>{
    const user =await sellerService.getSeller(req.params.SSN);
    
    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        user,
    })
}

const deleteSeller= async (req,res,next)=>{
    const ack=await sellerService.deleteSeller(req.params.SSN);

    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })
} 

const approveSeller= async (req,res,next)=>{

    console.log(req.params);
    const ack=await sellerService.approveSeller(req.params.SSN);
    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })
}

const activeSellerAcount=async (req,res,next)=>{
    console.log(req.params.SSN);
    const ack=await sellerService.activeSeller(req.params.SSN);
    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })
}


adminRoute.post("/admin/addSeller", prot_rest("admin") ,catchAsync(addSeller))
    .get("/admin/getSeller/:SSN",prot_rest("admin"),catchAsync(getSeller))
    .delete("/admin/Seller/:SSN",prot_rest("admin"),catchAsync(deleteSeller))
    .patch("/admin/approveSeller/:SSN",prot_rest("admin"),catchAsync(approveSeller))
    .patch("/admin/activeSeller/:SSN",prot_rest("admin"),catchAsync(activeSellerAcount))

module.exports=adminRoute;