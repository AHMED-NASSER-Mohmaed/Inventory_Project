const express = require("express");
const router = express.Router();
const { inboxResult } = require("../utils/apiFeatures")
const {
    validateSearchParams,
    validatorFilterParams,
    validateSortPaginationParams,
} = require("../middlewares/validation.middlewares");


const Product = require("../models/product.model");
const OnlineProducts = require("../models/onlineProducts.model");
const { APP_CONFIG } = require("../config/app.config");


router.get("/products",

    validateSortPaginationParams(["undefined"]),
    async (req, res) => {

        let limit = req.validatedParams.limit;
        let page = req.validatedParams.page;
        let sort = req.validatedParams.sort;

        try {

            const [results, total] = await Promise.all([

                await Product.find({ status: "approved", isActive: true })
                    .select("name code category brand price images")
                    .sort(sort)
                    .skip((page - 1) * limit) // (starting index = page-1)*limit
                    .limit(limit)
                    .lean(),
                await Product.countDocuments({ status: "approved", isActive: true }).exec()

            ]);


            let result = inboxResult(results, total, page, limit);

            res.status(200).json(result);

        } catch (error) {
            res.status(500).json({ message: "Error fetching products", error });
        }
    });


router.post("/products/sell", async (req, res) => {
    try {
        const { productId, price, stock } = req.body;

        const sellerId = req.user._id;

        // Validate required fields
        if (!sellerId || !productId || !price || !stock) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if product exists and is approved
        const product = await Product.findOne({ _id: productId, status: "approved" });
        if (!product) {
            return res.status(404).json({ message: "Product not found or not approved" });
        }

        // Ensure the seller is not trying to add a branch
        //   if (req.body.branch) {
        //     return res.status(400).json({ message: "Branch selection is not allowed" });
        //   }

        // Create seller's product entry
        const newOnlineProduct = new OnlineProducts({
            seller: sellerId,
            product: productId,
            price,
            stock,
            status: "pending", // Needs admin approval
            isActive: true
        });

        await newOnlineProduct.save();
        res.status(201).json({ message: "Product listed successfully, awaiting approval", newOnlineProduct });

    } catch (error) {
        res.status(500).json({ message: "Error listing product", error });
    }
});


// Allow a seller to view the products they have listed

router.get("/seller/products/",
    validateSortPaginationParams(['undefined']),
    validatorFilterParams([['isActive', 'undefined'], ['status', "undefine"]],
        [['true', 'false', 'undefined'], [APP_CONFIG.PENDING_STATUS, APP_CONFIG.REJECT_STATUS, APP_CONFIG.APPROVED_STATUS, 'undefined']]),
    async (req, res) => {
        try {
            const { sellerId } = req.user._id;

            const products = await OnlineProducts.find({ seller: sellerId, ...req.validatedParams.filters })
                .populate("product", "name code price category brand")
                .select("price stock status isActive");

            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: "Error fetching seller products", error });
        }
    });


///Update Product Listing (Seller Adjusts Price or Stock)

router.patch("/seller/products", async (req, res) => {
    try {
        const { price, stock } = req.body;

        // Validate input
        if (!price || !stock) {
            return res.status(400).json({ message: "Price and stock are required" });
        }

        // Find product and update
        const updatedProduct = await OnlineProducts.findByIdAndUpdate(
            req.user.id,
            { price, stock },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", updatedProduct });

    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
});


router.delete("/seller/products/:id", async (req, res) => {
  try {
    
    const deletedProduct = await OnlineProducts.findByIdAndDelete(req.params.id,{isActive:false});

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product removed successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error removing product", error });
  }
});

//////////////////*******************************************************************/






module.exports = router;