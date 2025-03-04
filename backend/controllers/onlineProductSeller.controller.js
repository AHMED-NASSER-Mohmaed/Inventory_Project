const express = require("express");
const router = express.Router();
const { sendResponseToClint } = require("../utils/apiFeatures");
const pro_res = require("../utils/authMiddlewaresOptions");
const catchAsync = require("../utils/catchAsync");

const {
    validateSearchParams,
    validatorFilterParams,
    validateSortPaginationParams,
} = require("../middlewares/validation.middlewares");


const { APP_CONFIG } = require("../config/app.config");
const OnlineProductService = require("../services/onlineProductSeller.service");


const productSellerController = {

    addexistProduct: async (req, res, next) => {
        let result = await OnlineProductService.addExistProduct(req.user._id.toString(), req.body.productId, req.body.stock, req.body.price);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    addNewProduct: async (req, res, next) => {

        let result = await OnlineProductService.addNewProduct(req.user._id, req.body);
        console.log("from controller");
        res.status(APP_CONFIG.HTTP_OK).json(result);
    },

    approveProduct: async (req, res, next) => {
        let result = await OnlineProductService.approveProduct(req.params.productId);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    rejectProduct: async (req, res, next) => {
        let result = await OnlineProductService.rejectProduct(req.params.productId);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    getSellerProduct: async (req, res, next) => {

        let result = await OnlineProductService.getSellerProduct(req.user._id, req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    deActiveProduct: async (req, res, next) => {
        console.log("from controller..")
        let result = await OnlineProductService.deActiveProduct(req.params.onProductId);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    activeProduct: async (req, res, next) => {
        let result = await OnlineProductService.activeProduct(req.params.onProductId);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    updateProduct: async (req, res, next) => {

        let result = await OnlineProductService.upadateSellerProduct(req.params.onProductId, req.body);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    //supper admin
    deActiveSellerProduct: async (req, res, next) => {
        let result = await OnlineProductService.deActiveSellerProduct(req.params.onProductId);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },
    //supper admin
    activeSellerProduct: async (req, res, next) => {
        let result = await OnlineProductService.activeSellerProduct(req.params.onProductId);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },



    allowedFilterFields: [['status', 'undefined'], ['isActive', 'undefined']],
    allowedFillterValues: [[APP_CONFIG.APPROVED_STATUS, APP_CONFIG.REJECT_STATUS, APP_CONFIG.PENDING_STATUS, 'undefined'],
    ['true', 'false', 'undefined']],

    searchFiledName: ["code", "brand", "category", "branch", "name"],
    searchValueAcoordingNaN: [true, true, true, false, true],

    allowedSort: ["createdAt", "price"],

}

//for seller
router.post("/seller/addExistingProduct",
    pro_res(APP_CONFIG.SELLER),
    catchAsync(productSellerController.addexistProduct)
)
    //for seller
    .post("/seller/addNewProduct",
        pro_res(APP_CONFIG.SELLER),
        catchAsync(productSellerController.addNewProduct)
    )


    //supper admin
    .patch("/approveProduct/:productId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(productSellerController.approveProduct)
    )
    //supper admin
    .patch("/rejectProduct/:productId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(productSellerController.rejectProduct)
    )
    //supper admin
    .delete("/deActiveOnProduct/:onProductId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(productSellerController.deActiveSellerProduct)
    )
    //supper admin
    .patch("/activeOnProduct/:onProductId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(productSellerController.activeSellerProduct)
    )



    //for seller
    .get("/seller/Product",
        pro_res(APP_CONFIG.SELLER),
        validateSortPaginationParams(productSellerController.allowedSort),
        validatorFilterParams(productSellerController.allowedFilterFields, productSellerController.allowedFillterValues),
        validateSearchParams(productSellerController.searchFiledName, productSellerController.searchValueAcoordingNaN),
        catchAsync(productSellerController.getSellerProduct)
    )
    //for seller
    .delete("/seller/deActiveProduct/:onProductId",
        pro_res(APP_CONFIG.SELLER),
        catchAsync(productSellerController.deActiveProduct)
    )
    //for seller
    .patch("/seller/activeProduct/:onProductId",
        pro_res(APP_CONFIG.SELLER),
        catchAsync(productSellerController.activeProduct)
    )
    //for seller
    .patch("/seller/updateProduct/:onProductId",
        pro_res(APP_CONFIG.SELLER),
        catchAsync(productSellerController.updateProduct)
    )



  





module.exports = router;