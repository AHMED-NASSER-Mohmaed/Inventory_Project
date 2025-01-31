const Cart = require("../models/cart.model");
const { create, exists } = require("../models/product.model");
const AppError = require("../utils/appError");
const {APP_CONFIG}=require("../config")
module.exports.CartRepo = {

    adding_falied_massage :"Failed to add product to cart",
    deleteing_faild_massage:"Failed to delete product from cart",
    
    /*
     * 
     * add to user and gust cart : provide user id , session id -->productid , qty
     * 
     * delete from user , gust cart : provide user id , session id and  productId
     * 
     * exist in user , gust cart : provide user , session id and productId
     * 
     * ///create user , gust cart : provide user , session id and expiry date for gust cart
     * 
     * // i canceled create cart due to upsert that is aleady exist in add to cart function 
     * // read the comment that is beside it 
     * // and also for abstraction [each user has a cart]
     * 
     * increment cart product for user,gust with adding new qty.
     * 
     */

    addToUserCart: async (UserId, productId, qty) => {
        try{
            return await Cart.UpdateOne({customerId: userId }, 
                { $push: { products: { productId, qty } } } ,
                { upsert: true ,new : true}, // Create the cart if it doesn't exist
                 
            );
            
        }catch(error){
            // throw  new AppError(adding_falied_massage, APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR );
            throw error;
        }
    },

    addToGuestCart: async (sessionUserId,expiryDate, productId, qty) => {
        try{
            return await Cart.UpdateOne({ sessionId: sessionUserId }, {
                $push: { "products": { productId, qty } },
                $set: {expireAt:expiryDate}
            },
                { upsert: true , new: true } // Create the cart if it doesn't exist
            )
        }catch(error){
            throw  new AppError(adding_falied_massage, APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
        }

    },

    deleteFromUserCart:async (userId, productId) => {
        try{
            await Cart.UpdateOne({ customerId: userId }, { $pull: { products: {productId} }},
             { new:true} );
        }catch(error){
            throw new AppError(deleteing_faild_massage,APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
        }

    },

    deleteFromGuestCart: async ( gustId, productId ) => {
        try{
            return await Cart.UpdateOne({ sessionId: gustId }, { $pull: { "products.productId":productId } });
        }catch(error){
            throw  new AppError(deleteing_faild_massage, APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
        }
    },

    existsInUserCart:async (userId,productId)=>{
        try{
            return (await Cart.findOne({customerId:userId,"products.productId":productId})!=null);
        }catch(error){
            throw new AppError(Cart_Data_Base_Failure,APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
        }
    },

    existsInGustCart:async(gustId,productId)=>{
        try{
            return (await Cart.findOne({sessionId:gustId,"products.productId":productId})!=null);
        }catch(err){
            throw new AppError(Cart_Data_Base_Failure,APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
        }
    },
/*
    createUserCart:async(userId)=>{
        await Cart.insertOne({customerId:userId});
    },

    createGustCart:async(gustId,TTL)=>{
        await Cart.insertOne({customerId:gustId,expireAt:TTL});
    },
*/
    incUserCartProduct:async (userId,productId,qty)=>{
        try{
            await Cart.UpdateOne({customerId:userId,"products.productId":productId},{$inc:{"products.qty":qty}});
        }catch(error){
            throw new AppError(Cart_Data_Base_Failure,APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
        }
    },

    incGustCartProduct:async (GustId,productId,qty)=>{
        try{
            await Cart.UpdateOne({sessionId:GustId,"products.productId":productId},{$inc:{"products.qty":qty}});
        }catch(err){
            throw new AppError(Cart_Data_Base_Failure,APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
        }
    },


}