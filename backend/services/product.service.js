const ProductRepository = require("../repos/product.repo");
const cinventory=require("../repos/cinventory.repo");
const product=require("../models/product.model");
const AppError = require('../utils/appError');
const {APP_CONFIG} = require("../config/app.config")
const supplier=require("../models/supplier.model");

const category=require("../models/category.model");


class ProductService {


    //callback function
    // if you don't have role then --> userType

    async createProductForStaff(sellerId,productData){

    }



 
    async createProductForStaff(productData) {
        /**
         *  name: { type: String, required: [true, "Please provide the product name"] },
            code: { type: String,required: [true, "Please provide the product code"],unique: true},
            price: {type: Number,required: [true, "Please provide the product price"],min: [0, "Price cannot be negative"]
            quantity: 
            category: { mandatory  --> done
            sellerId: { type: mongoose.Schema.ObjectId,required: [true, "Please provide the seller"] 

            suppliers : must be included in supllers table  --> done
            currentStock : required: [true, "Please provide the current stock"],

        */

        //first we have to to check role or user type
 
            //check if supplier exist  in suppller Schema

            try{

              
            
            //frontend model -- >   supplierID 
            const isExistSupplier=await supplier.findOne({_id:productData.supplierID});

            if(!isExistSupplier){
                throw new AppError("supplier dose not exist.",APP_CONFIG.HTTP_BAD_REQUEST);
            }

            let isExistCat=await category.findOne({_id:productData.categoryId})

            
            if(!isExistCat){
                throw new AppError("category dose not exist.",APP_CONFIG.HTTP_BAD_REQUEST);
            }

            //upload images to kit 
            let imagesURLS=[]

            //throw exception from databse
            const new_one =await product.create({ name:productData.name , code:productData.code ,  images:imagesURLS,
                            description:productData.description , category:productData.categoryId 
                            ,sellerId:APP_CONFIG.COMPANY_ID , sellerName:APP_CONFIG.COMPANY_NAME });

                
            console.log("hellooooo");
            
            await cinventory.createInventory({  product:new_one._id ,   providerID:isExistSupplier._id,
                providerName:isExistSupplier.companyName , currentStock: productData.currentStock,
                cost:productData.cost
             });

             return "added successufully";
            }catch(err){
                throw err;
            } 
         
    }

    async updateProductById(productId, updatedData) {
        try {
            const product = await ProductRepository.updateProductById(productId, updatedData);
            if (!product) {
                throw new AppError('Product not found', 404);
            }
            return product;
        } catch (err) {
            throw err;
        }
    }

    async deleteProductById(productId) {
        try {
            const product = await ProductRepository.deleteProductById(productId);
            if (!product) {
                throw new AppError('Product not found', 404);
            }
            return product;
        } catch (err) {
            throw err;
        }
    }

    async getProductById(productId) {
        try {
            const product = await ProductRepository.getProductById(productId); //  .populate() has been removed since there's no ref anymore
            if (!product) {
                throw new AppError('Product not found', 404);
            }
            return product;
        } catch (err) {
            throw err;
        }
    }

    async getAllProducts() {
        return await ProductRepository.getAllProducts();
    }

    async addProducts(productsArray) {
        try {

            const products = await ProductRepository.addProducts(productsArray);
            return products;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new ProductService();