const express = require("express");
const productService = require("../services/product.service");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");
const pro_res = require("../utils/authMiddlewaresOptions")
const { validatorForQueries } = require("../middlewares/validation.middlewares");
const categoryService = require("../services/category.service");

class ProductController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {


    this.router.post("/addProduct", pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(this.addProductForStaff))


    this.router.post("/addProductSeller", pro_res(APP_CONFIG.SELLER), catchAsync(this.addProductForSeller))



    // public routes: no need for authentication 
    this.router.get(
      "/products",
      catchAsync(this.getAllProducts)
    );

    this.router.get(
      "/productsByCategory/:categoryId",
      catchAsync(this.getProductsByCategory)
    );

    this.router.get(
      "/productsByCategoryForSellerStaff/:categoryId", // just for the seller and the admin could handle the deactivated products 
      // and for the admin only to handle the pending products from the seller to be presented on our store
      pro_res(APP_CONFIG.SELLER, APP_CONFIG.ADMIN, APP_CONFIG.SUPPERADMIN),
      catchAsync(this.getProductsByCategoryForSellerAndStaff)
    );

    this.router.get(
      "/products/:productId",
      catchAsync(this.getProduct)
    );

    this.router.patch(
      "/products/approve/:productId",
      pro_res(APP_CONFIG.ADMIN, APP_CONFIG.SUPPERADMIN), // only the admin or the super admin can accept the pending products to be presented on our store 
      catchAsync(this.approveProductForSeller)
    );

    this.router.patch(
      "/products/activate/:productId",
      pro_res(APP_CONFIG.SELLER, APP_CONFIG.ADMIN, APP_CONFIG.SUPPERADMIN),
      catchAsync(this.activateProduct)
    );


    this.router
      .route("/products/:productId")
      .patch(
        pro_res(APP_CONFIG.SELLER, APP_CONFIG.ADMIN, APP_CONFIG.SUPPERADMIN), // // this will be commented temporarily to test the crud operations first without constraints but it has to be uncommented later
        catchAsync(this.updateProduct)
      )
      .delete(
        pro_res(APP_CONFIG.SELLER, APP_CONFIG.ADMIN, APP_CONFIG.SUPPERADMIN),  // this will be commented temporarily to test the crud operations first without constraints but it has to be uncommented later
        catchAsync(this.deleteProduct)
      );


    this.router.get(
      "/getProducts",
      validatorForQueries(this.allowedFilterFileds, this.allowedFileterFildesValues, this.allowedSortFileds, this.allowedSortFiledsValues),
      catchAsync(this.getProducts),

    )

  }



  //filters --> by category
  //  input [cat id] 
  // sort by peice --> incommig feature numbver of sales 
  //input is [price] = ['asc' , "desc"] 


  allowedFilterFileds = ["isActive", "status", 'undefined']
  allowedFileterFildesValues = ["true", 'undefined']

  allowedSortFileds = ['price']
  allowedSortFiledsValues = ['asc', 'desc'];

  async getProducts(req, res, next) {

    // console.log("i am here guy..");

    let filters = { _id: req.query.catId, isActive: true }

    let arrOfChlidCat = await categoryService.getCategoies(filters);

    if (!arrOfChlidCat.length)
      throw new AppError("invalid category id ", APP_CONFIG.HTTP_NOT_FOUND);

    req.validatedParams['filters']['category'] = arrOfChlidCat;
    req.validatedParams['filters']['isActive'] = true;
    req.validatedParams['filters']['status'] = true;

    req.validatedParams['projection']={ "isActive":0,
      "status": 0,
      "createdAt": 0,
      "updatedAt": 0};

    let result = await productService.getProducts(req.validatedParams);

    res.status(200).json({
      message: "success",
      result,
    })
  }

  async addProductForSeller(req, res, next) {
    const product = await productService.createProductForSeller(req.user, req.body);

    res.status(APP_CONFIG.HTTP_CREATED).json({
      message: "success",
      product

    })
  }

  async addProductForStaff(req, res, next) {
    const product = await productService.createProductForStaff(req.body);

    res.status(APP_CONFIG.HTTP_CREATED).json({
      message: "success",
      product

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

  async getProductsByCategory(req, res, next) {
    const products = await productService.getProductsByCategoryForEndUser(req.params.categoryId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      products,
    });
  }

  async getProductsByCategoryForSellerAndStaff(req, res, next) {
    console.log(req.user.userType, req.user._id)
    const products = await productService.getProductsByCategoryForSellerAndStaff(req.params.categoryId, req.user.userType, req.user._id);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      products,
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

  async approveProductForSeller(req, res, next) {
    const product = await productService.approveProductForSeller(req.params.productId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      product,
    });
  }

  async activateProduct(req, res, next) {
    const product = await productService.activateProduct(req.params.productId, req.user.userType, req.user._id);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      product,
    });
  }

  async updateProductImages(res,req,next){

    if(!req.params.id) // product id 
      throw new AppError("invalid parameter",APP_CONFIG.HTTP_BAD_REQUEST);

    
    const oldImages= (await productService.getProductById(req.params.id)).images;




  }
/*
    async function (req, res, next) {

    if(!req.params.id)
     throw new AppError("invalid parameter",APP_CONFIG.HTTP_BAD_REQUEST);
 
     const oldFileId= await userService.getUserImageId(req.params.id);

     console.log(oldFileId);

     //delete image from imagekit  if user it's not the default image
     if ( !(oldFileId['photo']['fileId'] ===  APP_CONFIG.UDIAMGE_ID_VALUE)   ){
         console.log("the one that is exist is not equal to the default one");
         console.log(await deleteFile(oldFileId['photo']['fileId']));
     }

     const imageInfo = await upload(req.files, APP_CONFIG.PROFILE_IMAGE_FOLDER);

     if (!imageInfo) {
         await userService.updateUserImage(id,APP_CONFIG.DU_IMAGE_DEFALUT_OBG);
         throw new AppError("something went wrong", APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
     }

     console.log("===>",imageInfo['files'][0]);
     //this line may be throw an exception from database.
     const result = await userService.updateUserImage(req.params.id, imageInfo['files'][0]);

     sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

 },
*/

}

module.exports = new ProductController().router;