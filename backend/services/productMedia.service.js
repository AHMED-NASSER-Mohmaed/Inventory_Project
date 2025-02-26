const { deleteFiles, upload } = require("./media.service");

const { productService } = require("./product.service");
const AppError = require("../utils/appError");


/**
 * Updates product images: Deletes old images, uploads new ones, and updates the product in DB.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */

//return the updated product

const updateProductImages = async (req, res) => {

    try {

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

        return product;
        

    } catch (error) {

        throw error;
    }
};

/**
 * Deletes images from ImageKit and removes them from a product.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */


//for deleting images ,,,, u have to send for me array of ides in body 
const deleteProductImages = async (req, res) => {

    try {

        const { productId } = req.params;
        const { deleteImageIds } = req.body; // Array of ImageKit file IDs to delete

        if (!productId || !deleteImageIds || deleteImageIds.length === 0) {
            return res.status(400).json({ success: false, message: "Product ID and image IDs are required." });
        }

        // Step 1: Delete images from ImageKit
        await deleteFiles(deleteImageIds);


        //check if product exist before deleting 
        const product =await productService.isProductExist(productId);

        
        // Step 2: Remove deleted image references from the database
        return  await productService.deleteImagesFromProduct(productId, deleteImageIds);

    } catch (error) {
        throw new AppError();
    }
};

module.exports = {
    updateProductImages,
    deleteProductImages
};
