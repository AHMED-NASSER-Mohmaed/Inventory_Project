const express = require("express");
const supplierService = require("../services/supplier.service");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");
const pro_res = require("../utils/authMiddlewaresOptions");

class SupplierController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post("/suppliers", pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(this.addSupplier));
    
        this.router.get(
            "/suppliers",
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            catchAsync(this.getAllSuppliers)
        );
        this.router.get( // get active suppliers only
            "/suppliers/active",
            catchAsync(this.getActiveSuppliers)
        );

        this.router.patch( // activate supplier
            "/suppliers/active/:supplierId",
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            catchAsync(this.activateSupplierById)
        );
    
        this.router.get(
            "/suppliers/:supplierId",
            catchAsync(this.getSupplierById)
        );
    
        this.router.patch(
            "/suppliers/:supplierId",
            pro_res(APP_CONFIG.ADMIN, APP_CONFIG.SUPPERADMIN),
            catchAsync(this.updateSupplierById)
        );
    
        this.router.delete(
            "/suppliers/:supplierId",
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            catchAsync(this.deleteSupplierById)
        );
    }

    async getAllSuppliers(req, res, next) {
        const suppliers = await supplierService.getAllSuppliers();
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            results: suppliers.length,
            suppliers,
        });
    }

    async addSupplier(req, res, next) {
        const supplier = await supplierService.createSupplier(req.body);
        res.status(APP_CONFIG.HTTP_CREATED).json({
            message: "success",
            supplier
        });
    }

    async deleteSupplierById(req, res, next) {
        await supplierService.deleteSupplierById(req.params.supplierId);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
        });
    }

    async activateSupplierById(req, res, next) {
        const supplier = await supplierService.activateSupplierById(req.params.supplierId);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            supplier
        });
    }

    async getActiveSuppliers(req, res, next) {
        const suppliers = await supplierService.getActiveSuppliers();
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            results: suppliers.length,
            suppliers,
        });
    }

    async getSupplierById(req, res, next) {
        const supplier = await supplierService.getSupplierById(req.params.supplierId);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            supplier,
        });
    }

    async updateSupplierById(req, res, next) {
        const supplier = await supplierService.updateSupplierById(req.params.supplierId, req.body);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            supplier,
        });
    }
}

module.exports = new SupplierController().router;