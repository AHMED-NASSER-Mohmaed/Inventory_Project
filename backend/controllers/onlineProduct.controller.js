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
    searchValueAcoordingNaN: [true, true, true, false, true],


    getOnLineProducts: async (req, res, next) => {

        req.validatedParams['status'] = APP_CONFIG.APPROVED_STATUS;
        req.validatedParams['isActive'] = true;

        let result = await OnlineProductService.getONProducts(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    }
}

router
    .get("/OnlineProducts",
        validateSortPaginationParams(OnlineProductsOp.allowedSort),
        validateSearchParams(OnlineProductsOp.searchFiledName, OnlineProductsOp.searchValueAcoordingNaN),
        catchAsync(OnlineProductsOp.getOnLineProducts)
    )

 


module.exports = router


