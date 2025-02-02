const express = require("express");
const productService = require("../services/product.service");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");
const pro_res=require("../utils/authMiddlewaresOptions")

class ProductController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {


    // this.router.post("/addProduct",pro_res(APP_CONFIG.SUPPERADMIN,APP_CONFIG.ADMIN),catchAsync(this.addProductForStaff))


    this.router.post("/addProductSeller",pro_res(APP_CONFIG.SELLER),catchAsync(this.addProductForSeller))



    // public routes: no need for authentication 
    this.router.get(
      "/products",
      catchAsync(this.getAllProducts)
    );

    this.router.get(
      "/products/:productId",
      catchAsync(this.getProduct)
    );

     // Protected routes: there's a need for authentication
    this.router.use(AuthMiddleware.protect); // token verification

    this.router.post(
      "/products",
      // AuthMiddleware.restrictTo("super_admin", "manager"), // this will be commented temporarily to test the crud operations first without constraints but it has to be uncommented later
      catchAsync(this.createProduct)
    );


    this.router
      .route("/products/:productId")
      .patch(
        // AuthMiddleware.restrictTo("super_admin", "manager"), // // this will be commented temporarily to test the crud operations first without constraints but it has to be uncommented later
        catchAsync(this.updateProduct)
      )
      .delete(
        // AuthMiddleware.restrictTo("super_admin", "manager"),  // this will be commented temporarily to test the crud operations first without constraints but it has to be uncommented later
        catchAsync(this.deleteProduct)
      );
  }



  
  async addProductForSeller(req,res,next){
    const product=await productService.createProductForSeller(req.user,req.body);

    res.status(APP_CONFIG.HTTP_OK).json({
      message:product,

    })
  }

  async addProductForStaff(req,res,next){
    const product=await productService.createProductForStaff(req.body);

    res.status(APP_CONFIG.HTTP_OK).json({
      message:product,

    })
  }

  async getAllProducts(req, res, next) {
    const products = await productService.getAllProducts();
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      results: products.length,
      products,
    });
  }

  async getProduct(req, res, next) {
    const product = await productService.getProductById(req.params.productId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      product,
    });
  }

  async createProduct(req, res, next) {
    const newProduct = await productService.createProduct(req.body);
    res.status(APP_CONFIG.HTTP_CREATED).json({
      message: "success",
      newProduct,
    });
  }

  async updateProduct(req, res, next) {
    const updatedProduct = await productService.updateProductById(
      req.params.productId,
      req.body
    );
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      updatedProduct,
    });
  }

  async deleteProduct(req, res, next) {
    await productService.deleteProductById(req.params.productId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
    });
  }
}

module.exports = new ProductController().router;