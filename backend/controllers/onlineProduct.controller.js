const { OnlineProductService } = require("../services/onlineProduct.service");
const prot_rest = require("../utils/authMiddlewaresOptions");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");

const {
    validateSearchParams,
    validatorFilterParams,
    validateSortPaginationParams,
} = require("../middlewares/validation.middlewares");

const { sendResponseToClint } = require("../utils/apiFeatures");



const express = require("express");

const router = express.Router();


const OnlineProductsOp = {

    

    allowedSort: ["createdAt", "price"],
    searchFiledName: ["code", "brand", "category", "name"],
    searchValueAcoordingNaN: [true, true, true, true],


    getOnLineProducts: async (req, res, next) => {

        if(!req.validatedParams.filters)
            req.validatedParams.filters={};
        req.validatedParams.filters['status'] = APP_CONFIG.APPROVED_STATUS;
        req.validatedParams.filters['isActive'] = true;

         console.log(req.validatedParams);

        let result = await OnlineProductService.getONProductsSite(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    getProductByID:async(req,res,next)=>{
        let result=await OnlineProductService.getPrductById(req.params.id);
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,APP_CONFIG.SUCCESS_MESSAGE,result);
    }
}

router
    .get("/OnlineProducts",
        validateSortPaginationParams(OnlineProductsOp.allowedSort),
        validatorFilterParams( [["undefined"]] , [["undefined"]]),
        validateSearchParams(OnlineProductsOp.searchFiledName, OnlineProductsOp.searchValueAcoordingNaN),
        catchAsync(OnlineProductsOp.getOnLineProducts)
    )
    .get("/OnlineProducts/:id",
        catchAsync(OnlineProductsOp.getProductByID)
    )

 


module.exports = router


