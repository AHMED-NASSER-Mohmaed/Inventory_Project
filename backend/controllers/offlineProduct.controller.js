const { OfflineProductsService } = require("../services/offlineProducts.service");
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


const offlineProductOp = {

    allowedFilters: [["isActive", "undefined"]],
    allowedFilterValues: [["true", "false", "undefined"]],

    allowedSort: ["createdAt","price"],
    searchFiledName: ["code", "brand","category","branch","name"],
    searchValueAcoordingNaN: [true, false, false,false,true],


    addProduct: async (req, res, next) => {

        let result = await OfflineProductsService.addOfflineProduct(req.body);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    updateQty: async (req, res, next) => {

        let result = await OfflineProductsService.updateQuantitiy(req.params.id, req.params.qty);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    getProducts: async (req, res, next) => {
        let result = await OfflineProductsService.getOfflineProducts(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    getCount:async (req,res,next)=>{
        let result = await OfflineProductsService.getOffProCount(req.validatedParams.filters);
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,APP_CONFIG.SUCCESS_MESSAGE,result);
    },

    exportTo:async (req,res,next)=>{

        console.log(req.query);

        const result = await OfflineProductsService.exportTo(req.query.id,+req.query.src,+req.query.dest,+req.query.qty);
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,APP_CONFIG.SUCCESS_MESSAGE,result);

    },

}

const router = express.Router();


router
    .post("/OffProduct",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(offlineProductOp.addProduct)
    )
    .patch("/OffProduct/updateQty/:id/:qty",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(offlineProductOp.updateQty)
    )
    .get("/OffProduct",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        validateSortPaginationParams(offlineProductOp.allowedSort),
        validatorFilterParams(offlineProductOp.allowedFilters,offlineProductOp.allowedFilterValues),
        validateSearchParams(offlineProductOp.searchFiledName,offlineProductOp.searchValueAcoordingNaN),
        catchAsync(offlineProductOp.getProducts)
    )
    .get("/OffProduct/count",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        validatorFilterParams(offlineProductOp.allowedFilters,offlineProductOp.allowedFilterValues),
        validateSearchParams(offlineProductOp.searchFiledName,offlineProductOp.searchValueAcoordingNaN),
        catchAsync(offlineProductOp.getCount)
    )
    .patch("/OffProduct/exportTo",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(offlineProductOp.exportTo)
    )



module.exports = router;