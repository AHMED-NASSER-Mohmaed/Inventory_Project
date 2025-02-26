const express = require("express");
const supplierService = require("../services/supplier.service");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");
const pro_res = require("../utils/authMiddlewaresOptions");

const { validateSearchParams, validatorFilterParams, validateSortPaginationParams } = require("../middlewares/validation.middlewares");
const { sendResponseToClint } = require("../utils/apiFeatures");

class SupplierController {

    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {

        //add supplier -- reviewed
        this.router.post("/suppliers",
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            catchAsync(this.addSupplier));


        //reviewed
        //for filteration + pagination + search 
        this.router.get(
            "/suppliers",
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            validateSortPaginationParams(this.sortFileds),
            validatorFilterParams(this.filedfilters, this.filedValues),
            validateSearchParams(this.searchfilters, this.searchValues),
            catchAsync(this.getSuppliers)
        );

        //reviewed
        //get count
        this.router.get(
            '/suppliers/count',
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            validatorFilterParams(this.filedfilters, this.filedValues),
            catchAsync(this.getCount)
        )


        //reviewed
        this.router.patch( // activate supplier
            "/suppliers/active/:supplierId",
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            catchAsync(this.activateSupplier)
        );


        //reviewed
        this.router.patch(
            "/suppliers/:supplierId",
            pro_res(APP_CONFIG.ADMIN, APP_CONFIG.SUPPERADMIN),
            catchAsync(this.updateSupplier)
        );

        //reviewed
        this.router.delete(
            "/suppliers/:supplierId",
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            catchAsync(this.deleteSupplierById)
        );

        this.router.get(
            "/suppliers/IdsNames",
            pro_res(APP_CONFIG.SUPPERADMIN),
            catchAsync(this.getAllSuppliersActiveIdAndNames)
        );


    }


    searchfilters = ['companyName', 'phoneNumber']
    searchValues = [true, false]

    filedfilters = [['undefined', 'isActive']]
    filedValues = [['undefined', 'true', 'false']]

    sortFileds = ['commissionPercentage', 'undefined']

    //reviwed
    async getSuppliers(req, res, next) {

        const result = await supplierService.getSuppliers(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    }

    //reviewed
    async getSupplierCount(req, res, next) {
        const result = await supplierService.getCount(req.validatedParams.filters);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    }

    //reviewed
    async addSupplier(req, res, next) {

        const result = await supplierService.createSupplier(req.body);

        sendResponseToClint(res, APP_CONFIG.HTTP_CREATED, APP_CONFIG.SUCCESS_MESSAGE, result);

    }

    //reviewed
    async getCount(req, res, next) {

        const result = await supplierService.getCount(req.validatedParams.filters);

        sendResponseToClint(res, APP_CONFIG.HTTP_CREATED, APP_CONFIG.SUCCESS_MESSAGE, result);

    }


    //reviewed
    async deleteSupplierById(req, res, next) {

        const result = await supplierService.deleteSupplierById(req.params.supplierId);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    }

    //reviewed
    async activateSupplier(req, res, next) {
         
        const result = await supplierService.activateSupplier(req.params.supplierId);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    }

    //reviewing...
    async updateSupplier(req, res, next) {

        const supplier = await supplierService.updateSupplier(req.params.supplierId, req.body);

        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            supplier,
        });
    }

    async getAllSuppliersActiveIdAndNames(req,res,next){
        let result=await supplierService.getAllSuppliersActiveIdAndNames();
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    }

}

module.exports = new SupplierController().router;