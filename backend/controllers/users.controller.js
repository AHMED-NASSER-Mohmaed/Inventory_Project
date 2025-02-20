const express = require("express");
const catchAsync = require("../utils/catchAsync")
const { sellerService } = require("../services/seller.service");
const { APP_CONFIG } = require("../config/app.config");
const { staffService } = require("../services/staff.service");
const prot_rest = require("../utils/authMiddlewaresOptions");
const userService = require("../services/user.service");

const { validateSearchParams, validatorFilterParams,validateSortPaginationParams } = require("../middlewares/validation.middlewares");

const { sendResponseToClint } = require("../utils/apiFeatures");
const { deleteFiles, upload } = require("../services/media.service");
const AppError = require("../utils/appError");
const { protect } = require("../middlewares/auth.middleware");

const route = express.Router();



const genaricFilters = {
    searchFiledName: ["firstName", "lastName", "SSN", "phoneNumber"],
    searchValueAcoordingNaN: [true, true, false, false],

    searchFiledNameForCustomer: ["firstName", "lastName", "phoneNumber"],
    searchValueAcoordingNaNforCustomer: [true, true, false],

    allowedSort: ['createdAt', "name"],
}

const genaraicFunctions={

    //to upload a picture for a person you have to pass id in arguments.

    updateImage: async function (id,files) {
  
        try {
            const oldFileId = await userService.getUserImageId(id);
            console.log("hey man " ,"oldFileId['photo']['fileId']");
            //delete image from imagekit  if user it's not the default image
            if (!(oldFileId['photo']['fileId'] === APP_CONFIG.UDIAMGE_ID_VALUE)) {
                await deleteFiles([oldFileId['photo']['fileId']]);
            }

            let imageInfo = await upload( files , APP_CONFIG.PROFILE_IMAGE_FOLDER);
            
            console.log("from update : ",imageInfo);

            await userService.updateUserImage(id, imageInfo['files'][0]);

            return imageInfo;

        } catch (err) {
            await userService.updateUserImage(id, APP_CONFIG.DU_IMAGE_DEFALUT_OBG);
            throw err;
        }  
        //this line may be throw an exception from database.


    },

    updateImageProfile:async(req,res,next)=>{


        if(!req.files)
            throw new AppError("invalid image file!",APP_CONFIG.HTTP_BAD_REQUEST);



        const result=await genaraicFunctions.updateImage(req.user._id,req.files)

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },
 

updateImageProfileFor: async (req, res, next) => {

    try {

        // Check if the ID and image file are provided
        if (!req.params.id || !req.files || !req.files.image) {
            throw new AppError("Invalid request: ID or image file is missing!", APP_CONFIG.HTTP_BAD_REQUEST);
        }

        
        if(req.files['image'].length>1)
            throw new AppError("you can not upload more than only one image!",APP_CONFIG.HTTP_BAD_REQUEST);
       
        // Get the uploaded file
        const imageFile = req.files.image;

        // Validate the file type (ensure it's an image)
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(imageFile.mimetype)) {
            throw new AppError("Invalid file type: Only JPEG and PNG images are allowed!", APP_CONFIG.HTTP_BAD_REQUEST);
        }

       
        // Update the image in image kit 
        const result = await genaraicFunctions.updateImage(req.params.id, req.files);

        // Send success response
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    } catch (error) {
       
        await userService.updateUserImage(req.params.id, APP_CONFIG.DU_IMAGE_DEFALUT_OBG); 
        throw error;

    }
},
}

const sellerOp = {

    addSeller: async (req, res, next) => {
        // req.body.role=APP_CONFIG.CLERK;
        req.body.passwordConfirm = req.body.password
        const user = await sellerService.createSeller(req.body);

        sendResponseToClint(res, APP_CONFIG.HTTP_CREATED, APP_CONFIG.HTTP_OK, user);
    },
    /*
        getSellerBy: async (req, res, next) => {
    
            const user = await sellerService.getSeller(req.params.SSN);
    
            sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, user);
    
        },*/

    deleteSeller: async (req, res, next) => {

        const ack = await sellerService.deleteSeller(req.params.id);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    approveSeller: async (req, res, next) => {


        const ack = await sellerService.approveSeller(req.params.id);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    activeSellerAcount: async (req, res, next) => {

        const ack = await sellerService.activeSeller(req.params.id);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },
    //by id
    rejectSeller: async (req, res, next) => {
        // console.log(req.params.id);
        const ack = await sellerService.rejectSeller(req.params.id);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);
    },

    /*
    getActiveSellers: async (req, res, next) => {
        const result = await sellerService.getActiveSellersService(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    getDeActiveSellers: async (req, res, next) => {

        const result = await sellerService.getDeActiveSellersService(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    getPendingSellers: async (req, res, next) => {
        const result = await sellerService.getPendingSellersService(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },
    */
/*
    getAllSellers: async (req, res, next) => {

        const sellers = await sellerService.getAllSellers();

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, sellers);
    },
*/

    getSellers: async (req, res, next) => {


        // console.log(req.validatedParams,"from controller ..");

        // if(req.validatedParams.status === 1 ) // then is ative may be undefined or true false ... approve

        if(req.validatedParams.filters.status ){

            if ( req.validatedParams.filters.status === "0") //then is active is no of use ... pending
            {
                if (req.validatedParams.filters.isActive === "false") {
                    delete req.validatedParams.filters.isActive;
                }
            }
    
    
            if (req.validatedParams.filters.status === "-1") // only rejected people  
            {
                console.log("hello")
                if (req.validatedParams.filters.isActive === "false") {
                    delete req.validatedParams.filters.isActive;
                }
            }

        }

        // console.log(req.validatedParams.filters);

        const result = await sellerService.getSellers(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

/*
    getPendingSellers: async (req, res, next) => {
        console.log(req.validatedParams);
        req.validatedParams['filters']['status'] = true;
        const result = await sellerService.getSellers(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },
*/
    updateSeller: async (req, res, next) => {
        const result = await sellerService.updateSellerById(req.params.sellerId, req.body, req.user.userType); // to be continued
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    getSellerCount: async (req, res, next) => {

        // console.log("from contoroller : ",req.validatedParams);


        if (req.validatedParams.filters.status === "0") //then is active is no of use ... pending
        {
            if (req.validatedParams.filters.isActive === "false") {
                delete req.validatedParams.filters.isActive;
            }
        }
        if (req.validatedParams.filters.status === "-1") // only rejected people  
        {
            console.log("hello")
            if (req.validatedParams.filters.isActive === "false") {
                delete req.validatedParams.filters.isActive;
            }
        }

        const result = await sellerService.getCountByFilter(req.validatedParams.filters);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);


    },

    /*
    //search by SSN , firstName , lastName , phonenumber  
    getSellerBy: async (req, res, next) => {
        const result = await sellerService.getSellers(req.validatedParams); // to be continued
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },*/

    allowedSort:["createdAt","undefined"],
    allowedSortValues:['asc','desc',"undefined"],

    messageesFilterField:["seen","undefined"],
    messageesFiltervalue:['true','false',"undefined"],
    

    FieldName: [["isActive", "undefined"], ["status", "undefined"]],
    filedsValues: [["true", "false", "undefined"], ["-1", "0", "1", "undefined"]],

}




/********************************************************************/

const adminOp = {

    addAdmin: async (req, res, next) => {
        //attach role on data
        req.body.role = APP_CONFIG.ADMIN;
        req.body.managerId = req.user._id;

        req.body.passwordConfirm = req.body.password
        const result = await staffService.createStaff(req.body);
        sendResponseToClint(res, APP_CONFIG.HTTP_CREATED, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    //delete by id
    deleteAdmin: async (req, res, next) => {
        const result = await staffService.deleteStaff({ _id: req.params.id, role: APP_CONFIG.ADMIN });
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

      /*
    getAdminBy: async (req, res, next) => {

        req.validatedParams.filters['role'] = APP_CONFIG.ADMIN;

        const result = await staffService.getStaffByFilter(req.validatedParams); // to be continued
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },*/

    /*
    getAllAdmins: async (req, res, next) => {

        const result = await staffService.getAll(APP_CONFIG.ADMIN);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },*/

    //by id
    activeAdmin: async (req, res, next) => {

        const result = await staffService.activeStaff({ _id: req.params.id, role: APP_CONFIG.ADMIN });

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    // //paggination -->filter --- sort
    // also search by SSN , firstName , lastName , phoneNumber
    getAdmins: async (req, res, next) => {
        req.validatedParams.filters['role'] = APP_CONFIG.ADMIN;
        const result = await staffService.getStaffByFilter(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    }

    ,
    allowedFilters: ["isActive", "undefined"],
    allowedFilterValues: ["true", "false", "undefined"],


}

/***********************************************************************/

const clerkOp = {
    addClerk: async (req, res, next) => {

        //attach role on data
        req.body.role = APP_CONFIG.CLERK;


        req.body.managerId = req.user._id;

        req.body.passwordConfirm = req.body.password

        const clerk = await staffService.createStaff(req.body);

        sendResponseToClint(res, APP_CONFIG.HTTP_CREATED, APP_CONFIG.SUCCESS_MESSAGE, clerk);

    },

    deleteClerk: async (req, res, next) => {
        const ack = await staffService.deleteStaff({ SSN: req.params.SSN, role: APP_CONFIG.CLERK });
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);
    },

    
    /*getClerkBy: async (req, res, next) => {

        req.validatedParams.filters['role'] = APP_CONFIG.CLERK;

        const clerk = await staffService.getStaffByFilter(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, clerk);


    },*/

    /*
    getAllClerks: async (req, res, next) => {
        const allClerks = await staffService.getAll(APP_CONFIG.CLERK);

        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            allClerks,
        })

    },*/


    //active clerk by id
    activeClerk: async (req, res, next) => {

        const ack = await staffService.activeStaff({ _id: req.params.id, role: APP_CONFIG.CLERK });

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    //pagination 
    //search by  SSN , firtName , lastName , phoneNumber 
    getClerks: async (req, res, next) => {

        req.validatedParams.filters['role'] = APP_CONFIG.CLERK;


        const result = await staffService.getStaffByFilter(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    allowedFilters: ["isActive", "undefined"],
    allowedFilterValues: ["true", "false"],


}

/**********************************************************************************/

const cashierOp = {

    addCashier: async (req, res, next) => {

        //attach role on data
        req.body.role = APP_CONFIG.CASHIER;
        req.body.managerId = req.user._id;
        req.body.passwordConfirm = req.body.password
        const cashier = await staffService.createStaff(req.body);

        sendResponseToClint(res, APP_CONFIG.HTTP_CREATED, APP_CONFIG.SUCCESS_MESSAGE, cashier);

    },



    //delete cashier by id 
    deleteCashier: async (req, res, next) => {

        const ack = await staffService.deleteStaff({ _id: req.params.id, role: APP_CONFIG.CASHIER });

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    
    /*getCashierBy: async (req, res, next) => {

        req.validatedParams.filters['role'] = APP_CONFIG.CASHIER

        const cashier = await staffService.getStaffByFilter(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, cashier);

    },*/

    /*
        getAllCashiers: async (req, res, next) => {
    
            const allCashiers = await staffService.getAll(APP_CONFIG.CASHIER);
    
            res.status(APP_CONFIG.HTTP_OK).json({
                message: "success",
                allCashiers,
            })
    
        },*/


    //active seller using id
    activeCashier: async (req, res, next) => {

        const ack = await staffService.activeStaff({ _id: req.params.id, role: APP_CONFIG.CASHIER });

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },


    //get all cashiers filtered and paginated at the same time.
     //search by SSN , firstName , lastName , phoneNumber
    getCashiers: async (req, res, next) => {

        req.validatedParams.filters['role'] = APP_CONFIG.CASHIER;


        const result = await staffService.getStaffByFilter(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    allowedFilters: ["isActive", "undefined"],
    allowedFilterValues: ["true", "false"],
    allowedSort: ['createdAt', "name"],

}


/************************************************************************************/


const customerOp = {

    addCustomer: async (req, res, next) => {

        req.body.userType = APP_CONFIG.CUSTOMER;
        req.body.passwordConfirm = req.body.password;
        const customer = await userService.createUser(req.body);

        sendResponseToClint(res, APP_CONFIG.HTTP_CREATED, APP_CONFIG.SUCCESS_MESSAGE, customer != null ? true : false);
    },

    //delete customer using id  
    deleteCustomer: async (req, res, next) => {
        const ack = await userService.deleteUser(req.params.id);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    //active customer using id
    activeCustomer: async (req, res, next) => {

        const ack = await userService.activeUser(req.params.id);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    /*
    getCustomer: async (req, res, next) => {

        const customer = await userService.getUser(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, customer);

    },*/



    getCustomers: async (req, res, next) => {

        req.validatedParams.filters["userType"] = APP_CONFIG.CUSTOMER;

        console.log("from customer object controller :",req.validatedParams);

        const result = await userService.getUsers(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },


   


    allowedFilters: [["isActive", "undefined"]],
    allowedFilterValues: [["true", "false"]],
    allowedSort: ['createdAt', "name"],


}



/**************************************************************************************/


route.post("/addSeller",
    prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
    catchAsync(sellerOp.addSeller))

    //delete seller by id --> soft delete 
    .delete("/deleteSeller/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(sellerOp.deleteSeller))

    //approve seller by id 
    .patch("/approveSeller/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(sellerOp.approveSeller))
    //active seller by id 
    .patch("/activeSeller/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(sellerOp.activeSellerAcount))

    //upadte seller by id 
    .patch("/updateSeller/:sellerId",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.SELLER),
        catchAsync(sellerOp.updateSeller))

    //reject seller by id 
    .patch("/rejectSeller/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(sellerOp.rejectSeller))

  /*  //pagination for filtered seller 
    .get("/getSellers",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        validatorForQueries(sellerOp.FieldName, sellerOp.filedsValues, genaricFilters.allowedSort),
        catchAsync(sellerOp.getSellers))
*/
    //get seller count by filtes
    .get("/sellerCount",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        validatorFilterParams(sellerOp.FieldName,sellerOp.filedsValues),
        validateSearchParams(genaricFilters.searchFiledName, genaricFilters.searchValueAcoordingNaN),
        catchAsync(sellerOp.getSellerCount)
    )

    //for filteration and and search by SSN , firstName , lastName , phoneNumber
    .get("/getSellers",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),

        validateSortPaginationParams(genaricFilters.allowedSort),
        validatorFilterParams(sellerOp.FieldName,sellerOp.filedsValues),
        
        validateSearchParams(genaricFilters.searchFiledName, genaricFilters.searchValueAcoordingNaN),

        catchAsync(sellerOp.getSellers)
    )


    /****************************************************************************************/

/*
    .post("/addAdmin",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(adminOp.addAdmin))

    //search by SSN , firstName , lastName , phoneNumber
    .get("/getAdmin",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        validateSearchParams(genaricFilters.searchFiledName, genaricFilters.searchValueAcoordingNaN, genaricFilters.allowedSort),
        catchAsync(adminOp.getAdmins))

    //delete seller by id
    .delete("/deleteAdmin/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(adminOp.deleteAdmin))

    //active admin by id
    .patch("/activeAdmin/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(adminOp.activeAdmin))

    

    //pagination for active and deavtive admins
    .get("/getAdmins",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        validatorForQueries(adminOp.allowedFilters, adminOp.allowedFilterValues, genaricFilters.allowedSort),
        catchAsync(adminOp.getAdmins))

*/

    /****************************************************************************************/
/*

    //add clerk
    .post("/addClerk",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(clerkOp.addClerk))

    //search by SSN , firstName , lastName , phoneNumber
    .get("/getClerk",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        validateSearchParams(genaricFilters.searchFiledName, genaricFilters.searchValueAcoordingNaN, genaricFilters.allowedSort),
        catchAsync(clerkOp.getClerks))

    //delete clerk by id
    .delete("/deleteClerk/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(clerkOp.deleteClerk))


    //active clerk by id
    .patch("/activeClerk/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(clerkOp.activeClerk))

    //paginated clerks
    .get("/getClerks", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        validatorForQueries(clerkOp.allowedFilters, clerkOp.allowedFilterValues, genaricFilters.allowedSort),
        catchAsync(clerkOp.getClerks))

*/
    /****************************************************************************************/
/*
    //add cashier 
    .post("/addCashier",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(cashierOp.addCashier))

    //get cashier by SSN , firstName , lastName , phoneNumber
    .get("/getCashier/",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        validateSearchParams(genaricFilters.searchFiledName, genaricFilters.searchValueAcoordingNaN, genaricFilters.allowedSort),
        catchAsync(cashierOp.getCashiers))

    //delete cashier by id 
    .delete("/deleteCashier/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(cashierOp.deleteCashier))

    //active cashier by id
    .patch("/activeCashier/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        catchAsync(cashierOp.activeCashier))

    //get cashier paginated
    .get("/getCashiers",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        validatorForQueries(cashierOp.allowedFilters, cashierOp.allowedFilterValues, cashierOp.allowedSort),
        catchAsync(cashierOp.getCashiers))

*/

    /****************************************************************************************************/
    // customer section 


    .post("/addCustomer",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.CUSTOMER),
        catchAsync(customerOp.addCustomer)) //end of post 


    //get customer by filter for serch by firstName , lastNAme  and also active and deactive
    .get("/getCustomers",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.CUSTOMER),
        validateSortPaginationParams(genaricFilters.allowedSort)
        ,validatorFilterParams(customerOp.allowedFilters,customerOp.allowedFilterValues)
        ,validateSearchParams(genaricFilters.searchFiledNameForCustomer,genaricFilters.searchValueAcoordingNaNforCustomer),
        catchAsync(customerOp.getCustomers)) //end of customer id



    //only who can do this super admin.
    .delete("/deleteCustomer/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(customerOp.deleteCustomer)) //end of delete 

/*
    //why we send user id -->for admin super admin --- we will genarlize it through
    //this one for all supper admin , admin , seller , customer , supplier
    .patch("/updateProfileImage/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.SELLER, APP_CONFIG.CUSTOMER),
        catchAsync(customerOp.updateProfileImage)
    )
*/
    .patch("/activeCustomer/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.CUSTOMER),
        catchAsync(customerOp.activeCustomer))//end of patch

        /*
    .get("/getCustomers",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.CUSTOMER),
        validatorForQueries(customerOp.allowedFilters, customerOp.allowedFilterValues, genaricFilters.allowedSort),
        catchAsync(customerOp.getCustomers))//end of get [pagination].


*/
    
    //update personal image profile for users
    .patch("/updateImageProfile",
        protect,
        genaraicFunctions.updateImageProfile
    )

    //update image profile for othe with intvention from super admin.
    .patch("/updateImageProfileFor/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(genaraicFunctions.updateImageProfileFor)
    )

//end of customer routes section

/*************************************************************************************************** */
module.exports = route;