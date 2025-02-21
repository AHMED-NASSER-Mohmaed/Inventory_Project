const authCollection=require("../middlewares/auth.middleware")


module.exports= function prot_rest(...roles){

    // return async function(req,res,next){
    //     await authCollection.protect(req,res,next);
    //     await authCollection.restrictTo(roles);
    //  }


    // don't uncomment the code above ya Nasser, or I'll comme after you
    return [authCollection.protect, authCollection.restrictTo(roles)]; // it has to return an array so it can work fine, the above code doesn't work
}