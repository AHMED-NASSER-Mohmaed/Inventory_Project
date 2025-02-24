const {OfflineProductsService}=require("../services/offlineProducts.service");
const prot_rest = require("../utils/authMiddlewaresOptions");
const express = require("express");
const { APP_CONFIG } = require("../config/app.config");
const catchAsync = require("../utils/catchAsync");
const { sendResponseToClint } = require("../utils/apiFeatures");
const {
    validateSearchParams,
    validatorFilterParams,
    validateSortPaginationParams,
  } = require("../middlewares/validation.middlewares");


const offlineProductOp={

    addProduct:async(req,res,next)=>{
        
        let result= OfflineProductsService.addOfflineProduct(req.body);
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,APP_CONFIG.SUCCESS_MESSAGE,result);
    }
}

const router = express.Router();


router
    .post("/OffProduct",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(offlineProductOp.addProduct)
    )


module.exports=router;