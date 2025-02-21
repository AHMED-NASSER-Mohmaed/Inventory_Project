const express = require("express");
const categoryService = require("../services/category.service");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");
const pro_res=require("../utils/authMiddlewaresOptions");
const AppError = require("../utils/appError");



class CategoryController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post("/categories",pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),catchAsync(this.addCategory))
    
        this.router.get(
            "/categories",
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            catchAsync(this.getAllCategories)
        );
        this.router.get( // get active categories only
            "/categories/active",
            catchAsync(this.getActiveCategories)
        );

        this.router.get( // get active categories only
            "/categories/deActive",
            catchAsync(this.getdeActiveCategories)
        );

        this.router.patch( // get active categories only
            "/categories/active/:categoryId",
            catchAsync(this.activateCategoryById)
        );
    
        this.router.get(
            "/categories/:categoryId",
            catchAsync(this.getCategoryById)
        );
    
        this.router.get(
            "/getCategoriesChilds/:catId",
            catchAsync(this.getClidCat),
        )
    
    
    
        this.router.patch(
            "/categories/:categoryId",
            pro_res(APP_CONFIG.ADMIN, APP_CONFIG.SUPPERADMIN),
            catchAsync(this.updateCategoryById)
        );
    
        this.router.delete(
            "/categories/:categoryId",
            pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
            catchAsync(this.deleteCategoryById)
        )
    }

  
    async getdeActiveCategories(req,res,next){

        const categories = await categoryService.getdeActiveCategories();

        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            results: categories.length,
            categories,
        });
    }


    async getClidCat(req,res,next){
        console.log("helloo");
        if(!req.params.catId)
            throw new AppError("inavalid param",APP_CONFIG.HTTP_BAD_REQUEST);

        const Childs= await categoryService.getChildCategoies(req.params.catId);

        res.status(200).json({
            message:"success",
            Childs,
        })

    }

    async getAllCategories(req, res, next) {
        const categories = await categoryService.getAllCategories();
        console.log(categories);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            results: categories.length,
            categories,
        });
    }

    async addCategory(req,res,next){
        const category=await categoryService.createCategory(req.body);
        res.status(APP_CONFIG.HTTP_CREATED).json({
          message:"success",
          category
        })
    }

    async deleteCategoryById(req, res, next){
        await categoryService.deleteCategoryById(req.params.categoryId);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
        });
    }

    async activateCategoryById(req, res, next){
        const category = await categoryService.activateCategoryById(req.params.categoryId);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            category
        });
    }

    async getActiveCategories(req, res, next){
        const categories = await categoryService.getActiveCategories();
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            results: categories.length,
            categories,
        });
    }

    async getCategoryById(req, res, next){
        const category = await categoryService.getCategoryById(req.params.categoryId);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            category,
        });
    }

    async updateCategoryById(req, res, next){
        const category = await categoryService.updateCategoryById(req.params.categoryId, req.body);
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            category,
        });
    }

}


module.exports = new CategoryController().router;