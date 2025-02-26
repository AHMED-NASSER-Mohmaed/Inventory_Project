const { APP_CONFIG } = require("../config/app.config");
const {productRepo}=require("../repos/product.repo");
const supplierRepo=require("../repos/supplier.repo");
const AppError = require('../utils/appError');

const {categoryRepo} = require("../repos/category.repo")
const {brandRepo} = require("../repos/brand.repo");


module.exports.productService={

    //   who can use this function is the supper admin only 
    //   and also category , brand 
    addProduct:async(data)=>{
        try{
            console.log("from seeeeeeeeeee",data);
            
            let fields=[ "name" , "code" , "cost"  , "description" , "category" , "brand" , "supplier" ,]
    
            if(! data.supplier)
                throw new AppError("supplier must be provided");
    
            //cheack if supplier is exist in the system and active or not 
    
            let supplier=await supplierRepo.getSupplierById(data.supplier);
              
            if(!supplier || !supplier['isActive'])
                throw new AppError("sorry supplier dose not exist",APP_CONFIG.HTTP_NOT_FOUND);
    
            
            
            if(!data.category || !data.brand)
                throw new AppError("sorry you have to fill required fields.",APP_CONFIG.HTTP_NOT_FOUND);
    
            
            let selectedCat=await categoryRepo.getCategoryById(data.category);
    

            // console.log(selectedCat,"HHHHHHHHHHHH");

            if(selectedCat==null)
                throw new AppError("sorry category dose not exist",APP_CONFIG.HTTP_NOT_FOUND);

            if(!selectedCat['isActive'])
                throw new AppError("sorry category is deactivated",APP_CONFIG.HTTP_NOT_FOUND); 
    
            let selectedBrand= await brandRepo.getBrandById(data.brand);
             

            console.log(selectedBrand,"HHHHHHHHHHHH");

            if(selectedBrand==null || !selectedBrand['isActive'])
                throw new AppError("sorry brand dose not exist",APP_CONFIG.HTTP_NOT_FOUND);
             
            return await productRepo.addProduct(data);

        }catch(err){
            console.log(err,"errrrrrrrrr");
            throw err;
        }

    },

 
    isProductExist:async(productId)=>{
        try{
            let product= await productRepo.getProductById(productId);
            
            if(!product)
                throw new AppError("product dose not exist",APP_CONFIG.HTTP_NOT_FOUND);

            if(!product['isActive'])
                throw new AppError("product is de activated",APP_CONFIG.HTTP_BAD_REQUEST);

            return product;

        }catch(error){

            throw error;
        }

    },

    //you have to cheack firstly if product exist or not , i donot grantee any thing for u if this fucntion throws an exception 
    deleteImagesFromProduct:async(productId, deleteImageIds)=>{
        try{
            return await productRepo.deleteImagesFromProduct(productId,deleteImageIds);
        }catch(error){
            throw error;
        }
    }

    
}



/*
const cinventory=require("../repos/cinventory.repo");
const sinventory=require("../repos/sinventory.repo");
const {APP_CONFIG} = require("../config/app.config")
const CategoryRepository = require("../repos/category.repo");
const {sellerRepo} = require("../repos/sellers.repo");

const SupplierRepository = require("../repos/supplier.repo");

const category=require("../models/category.model");

const productRepo = require("../repos/product.repo");


class ProductService {


    //callback function
    // if you don't have role then --> userType

    async createProductForSeller(user,productData){


        try{

            // frontend model -->   supplierID 
            // const isExistSupplier=await supplier.findOne({_id:productData.supplierID});

            // if(!isExistSupplier){
            //     throw new AppError("supplier dose not exist.",APP_CONFIG.HTTP_BAD_REQUEST);
            // }

            console.log(productData)
            let isExistCat=await category.findOne({_id:productData.category})

            
            if(!isExistCat){
                throw new AppError("category dose not exist.",APP_CONFIG.HTTP_BAD_REQUEST);
            }

            //upload images to kit 
            // let imagesURLS=[]


            //throw exception from databse
            const new_one =await product.create({ name:productData.name , code:productData.code ,  images:productData.images,
                            description:productData.description , category:productData.category
                            ,sellerId:user._id , sellerName: user.companyName, status: user._id==APP_CONFIG.COMPANY_ID?true : false});

                
            
            await sinventory.createInventory({  product:new_one._id ,  providerID: user._id,
                providerName: user.companyName, currentStock: productData.currentStock,
                cost:productData.cost
             });

             return new_one;

            }catch(err){
                throw err;
            } 


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
/*
            try{

              
            
            //frontend model -- >   supplierID 
            // const isExistSupplier=await supplier.findOne({_id:productData.providerID});
            const isExistSupplier = await SupplierRepository.getSupplierById(productData.supplierID);

            if(!isExistSupplier){
                throw new AppError("supplier dose not exist.",APP_CONFIG.HTTP_BAD_REQUEST);
            }

            console.log(productData.category)
            let isExistCat=await category.findOne({_id:productData.category})

            
            if(!isExistCat){
                throw new AppError("category dose not exist.",APP_CONFIG.HTTP_BAD_REQUEST);
            }

            //upload images to kit 
            let imagesURLS=[]

            //throw exception from databse
            const new_one =await product.create({ name:productData.name , code:productData.code ,  images:imagesURLS,
                            description:productData.description , category:productData.category 
                            ,sellerId:APP_CONFIG.COMPANY_ID , sellerName:APP_CONFIG.COMPANY_NAME, status: true });

                
            
            const invProduct = await cinventory.createInventory({  product:new_one._id ,   providerID:isExistSupplier._id,
                providerName:isExistSupplier.companyName , currentStock: productData.currentStock,
                cost:productData.cost
             });

             return invProduct;
            }catch(err){
                throw err;
            } 
         
    }
/*
    async updateProductById(productId, updatedData,  userType, sellerId_, isSellerInventory) {
    try {
        let {
            name,
            code,
            cost,
            images,
            description,
            currentStock,
            category,
            sellerId,
            sellerName,
            providerID,
            providerName
        } = updatedData;
        if(category){

            const getCategory = await CategoryRepository.getCategoryById(category);
            if(!getCategory){
                throw new AppError(`sorry that category doesn't exist, ya norm!`);
            }
        }
        let product = await productRepo.getProductById(productId);

        if(userType == 'seller' && !product.sellerId.equals(sellerId_)){
            throw new AppError(`Sorry you're not authorized to update this product since it doesn't belong to you, ya norm!`);
        }else if(userType == 'seller'){
            product = await productRepo.updateProductById(productId, {
                ...(name && { name }),
                ...(code && { code }),
                // ...(price && { price }),
                ...(images && { images }),
                ...(description && { description }),
                // ...(quantity && { quantity }), // we can use current stock instead
                ...(category && { category }),
            });
            let inv = await sinventory.updateInventoryByProductId(productId, {
                ...(cost && { cost }),
                ...(currentStock && { currentStock }),
            });
            return inv;
        }
        if(isSellerInventory && userType == 'staff'){ // if it reaches here then it's the admin or the super admin since there's a restrict to on the route
            let tempSeller;
            if(sellerId || sellerName){ // if he admin wants to update the seller of the product
                if(product.sellerId.equals( APP_CONFIG.COMPANY_ID)){
                    throw new AppError(`Sorry Company FIXED OBJECT SELLER cannot be modified, ya norm!!`, APP_CONFIG.HTTP_BAD_REQUEST);
                }
                tempSeller = await sellerRepo.getSellerById(sellerId);
                if(!tempSeller){
                    throw new AppError(`Sorry the seller you provided doesn't exist, ya norm!!`, APP_CONFIG.HTTP_BAD_REQUEST);
                }
                sellerName = tempSeller.companyName;
                let providerID = sellerId;
                let providerName = sellerName;
                let inv = await sinventory.updateInventoryByProductId(productId, {
                    ...(providerID && { providerID }),
                    ...(providerName && { providerName }),
                }); // the sinventory providerName should be consistent with the sellerId and name
                console.log(inv);
            }
            product = await productRepo.updateProductById(productId, { // if it reaches here then it's the admin or the super admin since there's a restrict to on the route
                ...(name && { name }),
                ...(code && { code }),
                // ...(price && { price }),
                ...(images && { images }),
                ...(description && { description }),
                // ...(quantity && { quantity }),
                ...(category && { category }),
                ...(sellerId && { sellerId }),
                ...(sellerName && { sellerName }),
            });
            let inv = await sinventory.updateInventoryByProductId(productId, {
                ...(cost && { cost }),
                 ...(currentStock && { currentStock }),
            }); 
            return inv;
        }else{ // staff updating our company inventory products
            if(providerID){
                let tempSupplier;
                tempSupplier = await supplier.findById(providerID);
                if(!tempSupplier){
                    throw new AppError(`Sorry that supplier doesn't exist, ya norm!!`);
                }
                providerName = tempSupplier.companyName;
                await cinventory.updateInventoryByProductId(productId, {
                    ...(providerID && { providerID }),
                    ...(providerName && { providerName }),
                }); 
            }
            product = await productRepo.updateProductById(productId, { // if it reaches here then it's the admin or the super admin since there's a restrict to on the route
                ...(name && { name }),
                ...(code && { code }),
                // ...(price && { price }),
                ...(images && { images }),
                ...(description && { description }),
                // ...(quantity && { quantity }),
                ...(category && { category }),
                ...(sellerId && { sellerId }),
                ...(sellerName && { sellerName }),
            });
            let inv = await cinventory.updateInventoryByProductId(productId, {
                ...(cost && { cost }),
                ...(currentStock && { currentStock }),
            }); 
            if (!product) {
                throw new AppError('Product not found', 404);
            }
            return inv;
        }

        
        } catch (err) {
            throw err;
        }
    }

    async deleteProductById(productId) {
        try {
            const product = await productRepo.deleteProductById(productId);
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
            const product = await productRepo.getProductById(productId); //  .populate() has been removed since there's no ref anymore
            if (!product) {
                throw new AppError('Product not found', 404);
            }
            return product;
        } catch (err) {
            throw err;
        }
    }

    async getProductsByCategoryForEndUser(categoryId) {
        try {
            const categoryExists = await CategoryRepository.isCategoryExist(categoryId);
            const categoryActive = await CategoryRepository.isCategoryActive(categoryId);
            if (!categoryExists || !categoryActive) {
                throw new AppError('Category does not exist', 404);
            }
            
            const products = await productRepo.getProductsByCategoryForEndUser(categoryId); //  .populate() has been removed since there's no ref anymore
            if (!products || products.length === 0) {
                throw new AppError(`Products by that category don't exist`, 404);
            }
            return products;
        } catch (err) {
            throw err;
        }
    }

    async getProductsByCategoryForSellerAndStaff(categoryId, userType, sellerId_) {
        try {
            const categoryExists = await CategoryRepository.isCategoryExist(categoryId);
            if (!categoryExists) {
                throw new AppError('Category does not exist', 404);
            }
            let products;
            if(userType == "seller"){
                products = await productRepo.getProductsByCategoryForSeller(categoryId, sellerId_);
            }
            else{
                products = await productRepo.getProductsByCategoryForStaff(categoryId);
            }
            if (!products || products.length === 0) {
                throw new AppError(`Products by that category don't exist`, 404);
            }
            return products;
        } catch (err) {
            throw err;
        }
    }

    async getAllProducts() {
        return await productRepo.getAllProducts();
    }

    async addProducts(productsArray) {
        try {

            const products = await productRepo.addProducts(productsArray);
            return products;
        } catch (err) {
            throw err;
        }
    }


    async approveProductForSeller(productId) {
        try {
            let product = await productRepo.approveProductForSeller( productId);
            return product;
        } catch (err) {
            throw err;
        }
    }

    async activateProduct(productId, userType, sellerId_) {
        try {
            if(userType == "seller"){
                const tempProduct = await this.getProductById(productId);
                // console.log(tempProduct.sellerId, sellerId_ )
                if(!tempProduct.sellerId.equals( sellerId_ )){
                    throw new AppError("You're not authorized to delete that product since it doesn't belong to you, ya norm!");
                }
                if(tempProduct.status == false ){
                    throw new AppError("your product hasn't accepted yet, ya norm!");
                }
            }

            const product = await productRepo.activateProduct(productId);
            return product;
        } catch (err) {
            throw err;
        }
    }

    async getProducts(validatedParams){
        try{
            // console.log("from service",validatedParams);
            return await productRepo.getProducts(validatedParams.page,validatedParams.limit,
                 validatedParams.sort,validatedParams.filters,validatedParams.projection);

        }catch(error){
            throw error;
        }
    }

    /*************************************************/
/*
    async updateProductMedia(id,productMedia){
        try{
            return await productRepo.updateProductMedia(id,productMedia);

        }catch(err){
            throw err;
        }

    }

    // async getProductsByFilter(filters){
    //     try{

    //         return await productRepo.getProductByFilter(filters); 

    //     }catch(err){
    //         throw err;
    //     }
    // }

}

module.exports = new ProductService();

*/