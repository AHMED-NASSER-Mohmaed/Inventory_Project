const { deleteFiles, upload } = require("../services/media.service");
const { productService } = require("../services/product.service");
const AppError = require("../utils/appError");
const { sendResponseToClint } = require("../utils/apiFeatures");
const { APP_CONFIG } = require("../config/app.config");
const pro_res  = require("../utils/authMiddlewaresOptions");
const catchAsync = require("../utils/catchAsync");

const router = require("express").Router();
const ProductController = {

    //return the updated product   
    updateProductImages: async (req, res, next) => {
        console.log("from update");
        
        const { productId } = req.params;
        const { deleteImageIds } = req.body; // Array of ImageKit file IDs to delete
        const newImages = req.files; // New images sent in the request

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        // Fetch the current product
        const product = await productService.isProductExist(productId);

        // if (!product) {
        //     return res.status(404).json({ success: false, message: "Product not found." });
        // }

        // Step 1: Delete old images from ImageKit if provided
        if (deleteImageIds && deleteImageIds.length > 0) {
            await deleteFiles(deleteImageIds);

            // Remove deleted image references from MongoDB
            product.images = product.images.filter(img => !deleteImageIds.includes(img.fileId));
        }

        // Step 2: Upload new images (if any)
        let uploadedImages = [];
        if (newImages && Object.keys(newImages).length > 0) {
            const totalImages = product.images.length + Object.keys(newImages).length;

            // Enforce the 4-image limit
            if (totalImages > 5) {
                return res.status(400).json({ success: false, message: "A product can have a maximum of 4 images." });
            }

            const uploadResponse = await upload(newImages, "products"); // Upload images to "products" folder
            uploadedImages = uploadResponse.files; // Extract file IDs & URLs

            // Add new images to existing ones
            product.images = [...product.images, ...uploadedImages];
        }

        // Step 3: Save updated product
        await product.save();

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, product);

    },

    //for deleting images ,,,, u have to send for me array of ides in body 
    deleteProductImages: async (req, res, next) => {
        const  productId  = req.params.productId;
        const  deleteImageIds  = req.params.deleteImageIds; 
       
        
        if (!productId || !deleteImageIds ) 
            throw new AppError("Product ID and image IDs are required.",APP_CONFIG.HTTP_BAD_REQUEST);
        
        // console.log(deleteImageIds);
        
        // console.log(deleteImageIds)
        
        // let index=deleteImageIds.indexOf(APP_CONFIG.PDIAMGE_ID_KEY);
        
        // if(index!==-1){
            //     deleteImageIds.splice(index,1);
            //     if(deleteImageIds.length === 0)
            //         throw new AppError("you do not have the rights to delete this image",APP_CONFIG.HTTP_BAD_REQUEST);
            // }
            
            //  relete images from ImageKit
            await deleteFiles([deleteImageIds]);

        //check if product exist before deleting 
        const product = await productService.isProductExist(productId);


        //   remove deleted image references from the database
        await productService.deleteImagesFromProduct(productId, deleteImageIds);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, product);

    },
    updateProduct:async(req,res,next)=>{
        let result= await productService.updateProduct(req.params.productId,req.body);
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,APP_CONFIG.SUCCESS_MESSAGE,result);

    },
    deleteProduct:async(req,res,next)=>{
        let result= await productService.deleteProduct(req.params.productId);
        sendResponseToClint(res,APP_CONFIG.HTTP_NOT_FOUND,APP_CONFIG.SUCCESS_MESSAGE,result);
    },
    activeProduct:async(req,res,next)=>{
        let result=await productService.activeProduct(req.params.productId);
        sendResponseToClint(res,APP_CONFIG.HTTP_NOT_FOUND,APP_CONFIG.SUCCESS_MESSAGE,result);
    },
    approveOnProduct:async(req,res,next)=>{
        let result = await productService.approveProduct(req.params.productId);
        sendResponseToClint(res,APP_CONFIG.HTTP_NOT_FOUND,APP_CONFIG.SUCCESS_MESSAGE,result);
    }, 
    rejectProduct:async(req,res,next)=>{
        let result = await productService.rejectProduct(req.params.productId);
        sendResponseToClint(res,APP_CONFIG.HTTP_NOT_FOUND,APP_CONFIG.SUCCESS_MESSAGE,result);
    }

}



router
    .patch("/product/Images/update/:productId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(ProductController.updateProductImages)
    )

    .delete("/product/Images/delete/:productId/:deleteImageIds",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(ProductController.deleteProductImages)
    )

    .patch("/product/data/update/:productId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(ProductController.updateProduct)
    )
    .delete("/product/delete/:productId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(ProductController.deleteProduct)
    )
    .patch("/product/active/:productId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(ProductController.activeProduct)
    )
    .patch("/product/approve/:productId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(ProductController.approveOnProduct)
    )
    .patch("/product/reject/:productId",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(ProductController.rejectProduct)
    )


module.exports=router;