const express = require("express");
const productService = require("../services/product.service");

const { validateSearchParams, validatorFilterParams,validateSortPaginationParams } = require("../middlewares/validation.middlewares");

const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");
const pro_res = require("../utils/authMiddlewaresOptions");

const categoryService = require("../services/category.service");
const AppError = require("../utils/appError");
const { deleteFiles, upload } = require("../services/media.service");
const { filter } = require("lodash");
const reviewRouter = require("./review.controller");

class ProductController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use("/products/:productId/reviews", reviewRouter);

    this.router.post(
      "/addProduct",
      pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
      catchAsync(this.addProductForStaff)
    );

    this.router.post(
      "/addProductSeller",
      pro_res(APP_CONFIG.SELLER),
      catchAsync(this.addProductForSeller)
    );

    // public routes: no need for authentication
    this.router.get("/products", catchAsync(this.getAllProducts));

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

    this.router.get("/products/:productId", catchAsync(this.getProduct));

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
        pro_res(APP_CONFIG.SELLER, APP_CONFIG.ADMIN, APP_CONFIG.SUPPERADMIN), // this will be commented temporarily to test the crud operations first without constraints but it has to be uncommented later
        catchAsync(this.deleteProduct)
      );

    
    //site products
    this.router.get(

      "/getProducts",
      
      validateSortPaginationParams(this.allowedSortFileds),
      
      catchAsync(this.getProducts),
    )

    this.router.patch(
      "/updateProductMedia/:id",
      pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.SELLER),
      catchAsync(this.updateProductMedia)
    );

    /*
    this.router.get(
      "/CProducts",
      pro_res(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
      validatorForQueries(
        this.allowedFilterFileds,
        this.allowedFileterFildesValues,
        this.allowedSortFileds,
        this.allowedSortFiledsValues
      ),
      catchAsync(this.CProducts)
    )

*/
  }

  allowedFilterFileds = [["isActive", "undefined"]];
  allowedFileterFildesValues = [["true", "false", "undefined"]];

  allowedSortFileds = ["price", "createdAt"];
  allowedSortFiledsValues = ["asc", "desc"];

  //status must be true

  async CProducts(req, res, next) {
    req.validatedParams["filters"]["sellerId"] = APP_CONFIG.COMPANY_ID;
    req.validatedParams["filters"]["status"] = true;

    if (req.query.catId) {
      let arrOfChlidCat = await categoryService.getCategoies(filters);
      req.validatedParams["filters"]["category"] = arrOfChlidCat;
      // console.log("from here");
    }

    let result = await productService.getProducts(req.validatedParams);

    res.status(200).json({
      message: "success",
      result,
    });
  }

  async getProducts(req, res, next) {
    
    if(!req.validatedParams.filters)
      req.validatedParams['filters']={};

    req.validatedParams["filters"]["isActive"] = true;
    req.validatedParams["filters"]["status"] = true;

    

    if (req.query.catId) {
      let filters = { isActive: true, _id: req.query.catId };

      let arrOfChlidCat = await categoryService.getCategoies(filters);

      req.validatedParams["filters"]["category"] = arrOfChlidCat;
    }

    req.validatedParams["projection"] = {
      isActive: 0,
      status: 0,
      createdAt: 0,
      updatedAt: 0,
      sellerId: 0,
    };

    let result = await productService.getProducts(req.validatedParams);

    res.status(200).json({
      message: "success",
      result,
    });
  }

  async addProductForSeller(req, res, next) {
    const product = await productService.createProductForSeller(
      req.user,
      req.body
    );
    res.status(APP_CONFIG.HTTP_CREATED).json({
      message: "success",
      product,
    });
  }

  async addProductForStaff(req, res, next) {
    const product = await productService.createProductForStaff(req.body);

    res.status(APP_CONFIG.HTTP_CREATED).json({
      message: "success",
      product,
    });
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
    const products = await productService.getProductsByCategoryForEndUser(
      req.params.categoryId
    );
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      products,
    });
  }

  async getProductsByCategoryForSellerAndStaff(req, res, next) {
    console.log(req.user.userType, req.user._id);
    const products =
      await productService.getProductsByCategoryForSellerAndStaff(
        req.params.categoryId,
        req.user.userType,
        req.user._id
      );
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

  async verifySeller(productId) {
    let product = await product.getProductById({ _id: productId });

    if (product.sellerId !== user._id) {
      throw new AppError(
        "you are not autorized.",
        APP_CONFIG.HTTP_UNAUTHORIZED
      );
    }
  }

  async deleteProduct(req, res, next) {
    if (user.userType == APP_CONFIG.SELLER) {
      await this.verifySeller(req.params.productId);
    }

    await productService.deleteProductById(req.params.productId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
    });
  }

  async approveProductForSeller(req, res, next) {
    const product = await productService.approveProductForSeller(
      req.params.productId
    );
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      product,
    });
  }

  async activateProduct(req, res, next) {
    const product = await productService.activateProduct(
      req.params.productId,
      req.user.userType,
      req.user._id
    );
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      product,
    });
  }

  async updateProductMedia(req, res, next) {
    if (!req.params.id) {
      throw new AppError("Invalid parameter", APP_CONFIG.HTTP_BAD_REQUEST);
    }

    const product = await productService.getProductById(req.params.id);

    if (req.user.userType == APP_CONFIG.SELLER && product._id != req.user._id)
      throw new AppError(
        "you are not authorized",
        APP_CONFIG.HTTP_UNAUTHORIZED
      );

    const incommigImages = req.files.keepedImages || [];
    const uploadedImages = req.files["image"] || [];

    if (
      incommigImages.length + uploadedImages.length >
      APP_CONFIG.MAX_IMAGE_COUNT
    ) {
      console.log("freeeking that");
      throw new AppError(
        "Can't upload more than four images!",
        APP_CONFIG.HTTP_BAD_REQUEST
      );
    }

    let deletedMedia = [];

    let originalImages = product.images;

    if (originalImages.length > incommigImages.length) {
      for (let i = originalImages.length - 1; i >= 0; i--) {
        if (!incommigImages.includes(originalImages[i])) {
          deletedMedia.push(originalImages[i]["fileId"]);
          originalImages.splice(i, 1);
        }
      }

      if (!(await deleteFiles(deletedMedia))) {
        console.log("Deleted media successfully.");
        if (originalImages.length === 0) {
          await productService.updateProductMedia([
            APP_CONFIG.DP_IMAGE_DEFALUT_OBG,
          ]);
        }
        throw new AppError(
          "Something went wrong while deleting files",
          APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR
        );
      }
    }

    const newImages = await upload(req.files, APP_CONFIG.PRODUCT_IMAGE_FOLDER);

    console.log("done");
    // Update the product with the new images
    const updatedImages = [...originalImages, ...newImages.files];
    await productService.updateProductMedia(req.params.id, updatedImages);

    res.status(APP_CONFIG.HTTP_OK).json({
      message: "Product media updated successfully",
      data: updatedImages,
    });
  }
}

module.exports = new ProductController().router;
