const OfflineProducts = require("../models/offlineSchema.model"); 


class OfflineProductsRepository {
    // Create a new OfflineProduct
    async createOfflineProduct(data) {
        try {
            const offlineProduct = new OfflineProducts(data);
            return await offlineProduct.save();
        } catch (error) {
            throw new Error(`Error creating offline product: ${error.message}`);
        }
    }

    // Find an OfflineProduct by ID
    async findOfflineProductById(id) {
        try {
            return await OfflineProducts.findById(id).populate('branch').populate('product');
        } catch (error) {
            throw new Error(`Error finding offline product by ID: ${error.message}`);
        }
    }

    // Find all OfflineProducts
    async findAllOfflineProducts() {
        try {
            return await OfflineProducts.find({}).populate('branch').populate('product');
        } catch (error) {
            throw new Error(`Error finding all offline products: ${error.message}`);
        }
    }

    // Update an OfflineProduct by ID
    async updateOfflineProductById(id, data) {
        try {
            console.log(data);
            let res= await OfflineProducts.findByIdAndUpdate(id, data, { new: true });
            console.log("============",res,"============");
            return res;
        } catch (error) {
            throw new Error(`Error updating offline product: ${error.message}`);
        }
    }

    // Delete an OfflineProduct by ID
    async deleteOfflineProductById(id) {
        try {
            return await OfflineProducts.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error deleting offline product: ${error.message}`);
        }
    }

    // Find OfflineProducts by branch ID
    async findOfflineProductsByBranchId(branchId) {
        try {
            return await OfflineProducts.find({ branch: branchId }).populate('product');
        } catch (error) {
            throw new Error(`Error finding offline products by branch ID: ${error.message}`);
        }
    }

    // Find OfflineProducts by product ID
    async findOfflineProductsByProductId(productId) {
        try {
            return await OfflineProducts.find({ product: productId }).populate('branch');
        } catch (error) {
            throw new Error(`Error finding offline products by product ID: ${error.message}`);
        }
    }

    // Update stock for a specific OfflineProduct
    async updateOfflineProductStockById(id, newStock) {
        try {
            return await OfflineProducts.findByIdAndUpdate(id, { stock: newStock }, { new: true });
        } catch (error) {
            throw new Error(`Error updating stock: ${error.message}`);
        }
    }
}

module.exports = new OfflineProductsRepository();