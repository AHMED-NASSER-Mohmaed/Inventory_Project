const authCollection=require("../middlewares/auth.middleware")


module.exports= function prot_rest(...roles){

    return async function(req,res,next){
        await authCollection.protect(req,res,next);
        await authCollection.restrictTo(roles);
     }

}