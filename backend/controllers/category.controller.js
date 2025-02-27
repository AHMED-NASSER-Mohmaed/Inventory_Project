const { APP_CONFIG } = require("../config/app.config");
const { categoryService } = require("../services/category.service");
const { sendResponseToClint } = require("../utils/apiFeatures");
const prot_rest = require("../utils/authMiddlewaresOptions");
const { validateSearchParams, validatorFilterParams, validateSortPaginationParams } = require("../middlewares/validation.middlewares");
const catchAsync = require("../utils/catchAsync");
const { get } = require("lodash");

const genaricFilters = {
    searchFiledName: ["Cname"],
    searchValueAcoordingNaN: [true],

    allowedFilterFileds: [ ['isActive', 'undefined'] ],
    allowedFiltervalues: [['true', "false", 'undefined']],

    allowedSort: ['createdAt'],
}

const categoryOp = {

    addCategory: async (req, res, next) => {
        let result = await categoryService.addCategory(req.body);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    updateCategory: async (req, res, next) => {
         console.log(req.body,"boddyyyy");
        let result = await categoryService.updateCategory(req.params.id, req.body);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    deleteCategory: async (req, res, next) => {
        let result = await categoryService.deleteCategory(req.params.id);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    activateCategory: async (req, res, next) => {
        let result = await categoryService.activateCategory(req.params.id);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    getCategories: async (req, res, next) => {
        let result = await categoryService.getCategories(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    getCount: async (req, res, next) => {
        let result = await categoryService.getCount(req.validatedParams.filters);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    getAllActiveCategoryIdsNames:async(req,res,next)=>{
        let result = await categoryService.getAllActiveCategoryIdsNames()
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    }
}

const router = require("express").Router();

router
    .post("/categories",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(categoryOp.addCategory)
    )
    .delete("/categories/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(categoryOp.deleteCategory)
    )
    .get("/categories",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        validateSortPaginationParams(genaricFilters.allowedSort),
        validatorFilterParams(genaricFilters.allowedFilterFileds, genaricFilters.allowedFiltervalues),
        validateSearchParams(genaricFilters.searchFiledName, genaricFilters.searchValueAcoordingNaN),
        catchAsync(categoryOp.getCategories)
    )
    .get("/categories/count",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        validatorFilterParams(genaricFilters.allowedFilterFileds, genaricFilters.allowedFiltervalues),
        catchAsync(categoryOp.getCount)
    )
    .patch("/categories/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(categoryOp.updateCategory)
    )
    .patch("/categories/activate/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(categoryOp.activateCategory)
    )
    .get("/categories/AllActive/idN",
        catchAsync(categoryOp.getAllActiveCategoryIdsNames),
    )

module.exports = router;





/*
const express = require("express");
const categoryService = require("../services/category.service");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");
const pro_res = require("../utils/authMiddlewaresOptions");
const AppError = require("../utils/appError");
const { sendResponseToClint } = require("../utils/apiFeatures");
const {  validatorFilterParams} = require("../middlewares/validation.middlewares");



class CategoryController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post("/categories", pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(this.addCategory))

        this.router.get(
            "/categories",
            catchAsync(this.getAllCategories)
        );
        this.router.get(
            "/categories/count",
            pro_res(APP_CONFIG.SUPPERADMIN),
            validatorFilterParams(this.allowedFilters,this.allowedFilterValues),
            catchAsync(this.getCatCount)
        );
        this.router.get( // get active categories only
            "/categories/active",
            pro_res(APP_CONFIG.SUPPERADMIN),
            catchAsync(this.getActiveCategories)
        );

        this.router.get( // get active categories only
            "/categories/deActive",
            pro_res(APP_CONFIG.SUPPERADMIN),
            catchAsync(this.getdeActiveCategories)
        );

        this.router.patch( // get active categories only
            "/categories/active/:categoryId",
            pro_res(APP_CONFIG.SUPPERADMIN),
            catchAsync(this.activateCategoryById)
        );

        //no of use
        this.router.get(
            "/categories/:categoryId",
            pro_res(APP_CONFIG.SUPPERADMIN),
            catchAsync(this.getCategoryById)
        );

        //no of use
        this.router.get(
            "/getCategoriesChilds/:catId",
            pro_res(APP_CONFIG.SUPPERADMIN),
            catchAsync(this.getClidCat),
        )


        this.router.patch(
            "/categories/:categoryId",
            pro_res(APP_CONFIG.SUPPERADMIN),
            catchAsync(this.updateCategoryById)
        );

        this.router.delete(
            "/categories/:categoryId",
            pro_res(APP_CONFIG.SUPPERADMIN),
            catchAsync(this.deleteCategoryById)
        )
       
    }

   
    allowedFilters= [["isActive", "undefined"]]
    allowedFilterValues= [["true", "false","undefined"]]

    async getdeActiveCategories(req, res, next) {

        const categories = await categoryService.getdeActiveCategories();

        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            results: categories.length,
            categories,
        });
    }

    async getCatCount(req, res, next) {
         
        const result = await categoryService.getCountByFilter(req.validatedParams.filters);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    }

    async getClidCat(req, res, next) {
        console.log("helloo");
        if (!req.params.catId)
            throw new AppError("inavalid param", APP_CONFIG.HTTP_BAD_REQUEST);

        const Childs = await categoryService.getChildCategoies(req.params.catId);

        res.status(200).json({
            message: "success",
            Childs,
        })

    }

    async getAllCategories(req, res, next) {
        const categories = await categoryService.getAllCategories();

        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            total: categories.length,
            categories,
        });
    }

    //done
    async addCategory(req, res, next) {

        const category = await categoryService.createCategory(req.body);
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,)
        res.status(APP_CONFIG.HTTP_CREATED).json({
            message: "success",
            category
        })
    }

    async deleteCategoryById(req, res, next) {
        await categoryService.deleteCategoryById(req.params.categoryId);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
        });
    }

    async activateCategoryById(req, res, next) {
        const category = await categoryService.activateCategoryById(req.params.categoryId);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            category
        });
    }

    async getActiveCategories(req, res, next) {
        const categories = await categoryService.getActiveCategories();
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            results: categories.length,
            categories,
        });
    }

    async getCategoryById(req, res, next) {
        const category = await categoryService.getCategoryById(req.params.categoryId);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            category,
        });
    }

    async updateCategoryById(req, res, next) {
        const category = await categoryService.updateCategoryById(req.params.categoryId, req.body);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            category,
        });
    }

}


module.exports = new CategoryController().router;

*/