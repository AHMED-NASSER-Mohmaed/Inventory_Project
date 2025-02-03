const authCollection=require("../middlewares/auth.middleware")


module.exports= function prot_rest(...roles){

    return async function(req,res,next){
        await authCollection.protect(req,res,next);
        await authCollection.restrictTo(roles)(req,res,next);
     }

}

// module.exports = function prot_rest(...roles) {
//     return async function (req, res, next) {
//         try {
//             // Call the protect middleware
//             await authCollection.protect(req, res, next);

//             // Call the restrictTo middleware with the correct arguments
//             await authCollection.restrictTo(roles)(req, res, next);
//         } catch (error) {
//             // Pass any errors to the next middleware
//             next(error);
//         }
//     };
// };