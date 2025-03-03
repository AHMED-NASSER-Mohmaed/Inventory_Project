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
    .patch("deActiveOnProduct/:productId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(productSellerController.deActiveSellerProduct)
    )
    //supper admin
    .patch("activeOnProduct/:productId",
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
    .patch("seller/deActiveProduct/:onProductId",
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





// router.get("/products",

//     validateSortPaginationParams(["undefined"]),
//     async (req, res) => {

//         let limit = req.validatedParams.limit;
//         let page = req.validatedParams.page;
//         let sort = req.validatedParams.sort;

//         try {

//             const [results, total] = await Promise.all([

//                 await Product.find({ status: "approved", isActive: true })
//                     .select("name code category brand price images")
//                     .sort(sort)
//                     .skip((page - 1) * limit) // (starting index = page-1)*limit
//                     .limit(limit)
//                     .lean(),
//                 await Product.countDocuments({ status: "approved", isActive: true }).exec()

//             ]);


//             let result = inboxResult(results, total, page, limit);

//             res.status(200).json(result);

//         } catch (error) {
//             res.status(500).json({ message: "Error fetching products", error });
//         }
//     });


// router.post("/products/sell", async (req, res) => {
//     try {
//         const { productId, price, stock } = req.body;

//         const sellerId = req.user._id;

//         // Validate required fields
//         if (!sellerId || !productId || !price || !stock) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // Check if product exists and is approved
//         const product = await Product.findOne({ _id: productId, status: "approved" });
//         if (!product) {
//             return res.status(404).json({ message: "Product not found or not approved" });
//         }

//         // Ensure the seller is not trying to add a branch
//         //   if (req.body.branch) {
//         //     return res.status(400).json({ message: "Branch selection is not allowed" });
//         //   }

//         // Create seller's product entry
//         const newOnlineProduct = new OnlineProducts({
//             seller: sellerId,
//             product: productId,
//             price,
//             stock,
//             status: "pending", // Needs admin approval
//             isActive: true,
//             isDeleted:true
//         });

//         await newOnlineProduct.save();
//         res.status(201).json({ message: "Product listed successfully, awaiting approval", newOnlineProduct });

//     } catch (error) {
//         res.status(500).json({ message: "Error listing product", error });
//     }
// });


// // Allow a seller to view the products they have listed

// router.get("/seller/products/",
//     validateSortPaginationParams(['undefined']),
//     validatorFilterParams([['isActive', 'undefined'], ['status', "undefine"]],
//         [['true', 'false', 'undefined'], [APP_CONFIG.PENDING_STATUS, APP_CONFIG.REJECT_STATUS, APP_CONFIG.APPROVED_STATUS, 'undefined']]),
//     async (req, res) => {
//         try {
//             const { sellerId } = req.user._id;

//             const products = await OnlineProducts.find({ seller: sellerId, ...req.validatedParams.filters })
//                 .populate("product", "name code price category brand")
//                 .select("price stock status isActive");

//             res.status(200).json(products);
//         } catch (error) {
//             res.status(500).json({ message: "Error fetching seller products", error });
//         }
//     });


// ///Update Product Listing (Seller Adjusts Price or Stock)

// router.patch("/seller/products", async (req, res) => {
//     try {
//         const { price, stock } = req.body;

//         // Validate input
//         if (!price || !stock) {
//             return res.status(400).json({ message: "Price and stock are required" });
//         }

//         // Find product and update
//         const updatedProduct = await OnlineProducts.findByIdAndUpdate(
//             req.user.id,
//             { price, stock },
//             { new: true }
//         );

//         if (!updatedProduct) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         res.status(200).json({ message: "Product updated successfully", updatedProduct });

//     } catch (error) {
//         res.status(500).json({ message: "Error updating product", error });
//     }
// });


// router.delete("/seller/products/:id", async (req, res) => {
//   try {

//     const deletedProduct = await OnlineProducts.findByIdAndDelete(req.params.id,{isActive:false});

//     if (!deletedProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json({ message: "Product removed successfully" });

//   } catch (error) {
//     res.status(500).json({ message: "Error removing product", error });
//   }
// });

// //////////////////*******************************************************************/






module.exports = router;