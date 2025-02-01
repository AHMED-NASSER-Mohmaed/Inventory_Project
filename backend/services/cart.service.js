const CartRepo = require("../repos/cart.repo");
const Product = require("../models/product.model");
const { APP_CONFIG } = require('../config/app.config');
 

const {AppError}=require("../utils/appError")

module.exports.cartService = {

    /**
     * check if it is not a gust check if user id is in the data base or not.
     * check if product is already exist or not.
     * check total qty
     * session id of user will be handeled at controller
     */



    //the function will return the updated cart for the user in the happy scenario 

    addToCart:async (userId, sessionId, productId, qty) => {

        let isGuest = userId ? false : true;
        if(isGuest)
            userId = sessionId;


        try {

            //check product existance
            let oproduct =await Product.findById({ _id: productId });

            if (oproduct) {

                let totalQty=qty;

                let cproduct=await CartRepo.carHasProduct(userId,productId);

                if(cproduct){
                    totalQty+=cproduct.requiredQty;
                }

                if(oproduct.quantity>=totalQty){

                    return await CartRepo.addToCart(userId,productId,totalQty,isGuest);
                }else{
                    throw new AppError("required quantity is not available.",APP_CONFIG.HTTP_BAD_REQUEST);
                }

            } else {
                throw new AppError("product is not available.",APP_CONFIG.HTTP_BAD_REQUEST);
            }

 

        } catch (err) {
            throw err;
        }
    },

    updateCartProduct:async (userId, sessionId, productId, qty)=>{

        return await addToCart(userId, sessionId, productId, qty);

    },

    deleteCartProduct:async (userId,sessionId,productId)=>{
        let isGuest = userId ? false : true;
        userId = sessionId;

        return await CartRepo.decCartProduct(userId,productId,isGuest);
    },

    getCart : async(userId)=>{
        try{
            return CartRepo.getCart(userId);
        }catch(err){
            return err;
        }
    }


}