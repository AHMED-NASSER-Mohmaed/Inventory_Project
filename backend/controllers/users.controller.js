const express = require("express");
const catchAsync = require("../utils/catchAsync")
const { sellerService } = require("../services/seller.service");
const { APP_CONFIG } = require("../config/app.config");
const { staffService } = require("../services/staff.service");
const prot_rest = require("../utils/authMiddlewaresOptions");
const userService = require("../services/user.service");
const { validateParams, validateAdminRouteParmas, validatorForQueries } = require("../middlewares/validation.middlewares");
const { sendResponseToClint } = require("../utils/apiFeatures");
const { deleteFile, upload } = require("../services/media.service");
const AppError = require("../utils/appError");

const route = express.Router();



const sellerOp = {

    addSeller: async (req, res, next) => {
        // req.body.role=APP_CONFIG.CLERK;
        req.body.passwordConfirm = req.body.password
        const user = await sellerService.createSeller(req.body);

        sendResponseToClint(res, APP_CONFIG.HTTP_CREATED, APP_CONFIG.HTTP_OK, user);
    },

    getSeller: async (req, res, next) => {
        const user = await sellerService.getSeller(req.params.SSN);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, user);

    },

    deleteSeller: async (req, res, next) => {
        const ack = await sellerService.deleteSeller(req.params.SSN);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    approveSeller: async (req, res, next) => {

        console.log(req.params);
        const ack = await sellerService.approveSeller(req.params.SSN);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    activeSellerAcount: async (req, res, next) => {
        console.log(req.params.SSN);
        const ack = await sellerService.activeSeller(req.params.SSN);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

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

    getAllSellers: async (req, res, next) => {
        const sellers = await sellerService.getAllSellers();
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, sellers);
    },


    getSellers: async (req, res, next) => {
        const result = await sellerService.getSellers(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },



    allowedFilters: ["isActive", "status", "undefined"],
    allowedFilterValues: ["true", "false", "undefined"],
    allowedSort: ['createdAt', "name"],

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
    deleteAdmin: async (req, res, next) => {

        const result = await staffService.deleteStaff({ SSN: req.params.SSN, role: APP_CONFIG.ADMIN });

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);


    },
    getAdmin: async (req, res, next) => {

        const result = await staffService.getStaff({ SSN: req.params.SSN, role: APP_CONFIG.ADMIN });

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    getAllAdmins: async (req, res, next) => {

        const result = await staffService.getAll(APP_CONFIG.ADMIN);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    activeAdmin: async (req, res, next) => {

        const result = await staffService.activeStaff({ SSN: req.params.SSN, role: APP_CONFIG.ADMIN });

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },


    // //paggination -->filter --- sort
    getAdmins: async (req, res, next) => {
        req.validatedParams.filters['role'] = APP_CONFIG.ADMIN;
        const result = await staffService.getStaffByFilter(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    }

    ,
    allowedFilters: ["isActive", "undefined"],
    allowedFilterValues: ["true", "false", "undefined"],
    allowedSort: ['createdAt', "name"],

}

/***********************************************************************/

const clerkOp = {
    addClerk: async (req, res, next) => {

        //attach role on data
        req.body.role = APP_CONFIG.CLERK;
        console.log(req.user._id);
        req.body.managerId = req.user._id;
        req.body.passwordConfirm = req.body.password
        const clerk = await staffService.createStaff(req.body);

        res.status(APP_CONFIG.HTTP_CREATED).json({
            message: "success",
            clerk,
        })
    },
    deleteClerk: async (req, res, next) => {

        const ack = await staffService.deleteStaff({ SSN: req.params.SSN, role: APP_CONFIG.CLERK });
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            ack,
        })

    },

    getClerk: async (req, res, next) => {

        const clerk = await staffService.getStaff({ SSN: req.params.SSN, role: APP_CONFIG.CLERK });


        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            clerk,
        })

    },
    getAllClerks: async (req, res, next) => {
        const allClerks = await staffService.getAll(APP_CONFIG.CLERK);

        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            allClerks,
        })

    },

    activeClerk: async (req, res, next) => {

        const ack = await staffService.activeStaff({ SSN: req.params.SSN, role: APP_CONFIG.CLERK });

        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            ack,
        })
    },
    getClerks: async (req, res, next) => {

        req.validatedParams.filters['role'] = APP_CONFIG.CLERK;


        const result = await staffService.getStaffByFilter(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    allowedFilters: ["isActive", "undefined"],
    allowedFilterValues: ["true", "false"],
    allowedSort: ['createdAt', "name"],
}

/**********************************************************************************/

const cashierOp = {

    addCashier: async (req, res, next) => {

        //attach role on data
        req.body.role = APP_CONFIG.CASHIER;
        req.body.managerId = req.user._id;
        req.body.passwordConfirm = req.body.password
        const cashier = await staffService.createStaff(req.body);


        res.status(APP_CONFIG.HTTP_CREATED).json({
            message: "success",
            cashier,
        })

    },
    deleteCashier: async (req, res, next) => {

        const ack = await staffService.deleteStaff({ SSN: req.params.SSN, role: APP_CONFIG.CASHIER });
        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            ack,
        })

    },
    getCashier: async (req, res, next) => {

        const cashier = await staffService.getStaff({ SSN: req.params.SSN, role: APP_CONFIG.CASHIER });


        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            cashier,
        })

    },
    getAllCashiers: async (req, res, next) => {

        const allCashiers = await staffService.getAll(APP_CONFIG.CASHIER);

        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            allCashiers,
        })

    },
    activeCashier: async (req, res, next) => {

        const ack = await staffService.activeStaff({ SSN: req.params.SSN, role: APP_CONFIG.CASHIER });

        res.status(APP_CONFIG.HTTP_OK).json({
            message: "success",
            ack,
        })
    },

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

        sendResponseToClint(res, APP_CONFIG.HTTP_CREATED, APP_CONFIG.SUCCESS_MESSAGE, customer!=null?true:false);
    },

    deleteCustomer: async (req, res, next) => {
        const ack = await userService.deleteUser(req.params.id);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    activeCustomer: async (req, res, next) => {
        const ack = await userService.activeUser(req.params.id);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, ack);

    },

    getCustomer: async (req, res, next) => {
 
        const customer = await userService.getUser(req.params.id);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, customer);

    },

    getCustomers: async (req, res, next) => {

        req.validatedParams.filters["userType"] = APP_CONFIG.CUSTOMER;

        // console.log(req.validatedParams);

        const result = await userService.getUsers(req.validatedParams);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },


    updateProfileImage: async function (req, res, next) {

       if(!req.params.id)
        throw new AppError("invalid parameter",APP_CONFIG.HTTP_BAD_REQUEST);
    
        const oldFileId= await userService.getUserImageId(req.params.id);

        //delete image from imagekit  if user it's not the default image
        if ( !(oldFileId['photo']['fileId'] ===  APP_CONFIG.UDIAMGE_ID_VALUE)   ){
            console.log("the one that is exist is not equal to the default one");
            console.log(await deleteFile(oldFileId['photo']['fileId']));
        }
 
        const imageInfo = await upload(req.files, APP_CONFIG.PROFILE_IMAGE_FOLDER);

        if (!imageInfo) {
            await userService.updateUserImage(id,APP_CONFIG.DU_IMAGE_DEFALUT_OBG);
            throw new AppError("something went wrong", APP_CONFIG.HTTP_INTERNAL_SERVER_ERROR);
        }

        //this line may be throw an exception from database.
        const result = await userService.updateUserImage(req.params.id, imageInfo[0]);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },


    allowedFilters: ["isActive", "undefined"],
    allowedFilterValues: ["true", "false"],
    allowedSort: ['createdAt', "name"],


}



/**************************************************************************************/


route.post("/addSeller", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(sellerOp.addSeller))
    .get("/getSeller/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(sellerOp.getSeller))
    .delete("/deleteSeller/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(sellerOp.deleteSeller))
    .patch("/approveSeller/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(sellerOp.approveSeller))
    .patch("/activeSeller/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(sellerOp.activeSellerAcount))


    .get('/allSellers', prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(sellerOp.getAllSellers))
    .get("/getSellers", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        validatorForQueries(sellerOp.allowedFilters, sellerOp.allowedFilterValues, sellerOp.allowedSort),
        catchAsync(sellerOp.getSellers))






    .post("/addAdmin", prot_rest("super_admin"), catchAsync(adminOp.addAdmin))
    .get("/getAdmin/:SSN", prot_rest("super_admin"), catchAsync(adminOp.getAdmin))
    .delete("/deleteAdmin/:SSN", prot_rest("super_admin"), catchAsync(adminOp.deleteAdmin))
    .get("/getAllAdmins", prot_rest("super_admin"), catchAsync(adminOp.getAllAdmins))
    .patch("/activeAdmin/:SSN", prot_rest("super_admin"), catchAsync(adminOp.activeAdmin))
    .get("/getAdmins", prot_rest("super_admin"), validatorForQueries(adminOp.allowedFilters, adminOp.allowedFilterValues, adminOp.allowedSort),
        catchAsync(adminOp.getAdmins))




    .post("/addClerk", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(clerkOp.addClerk))
    .get("/getClerk/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(clerkOp.getClerk))
    .delete("/deleteClerk/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(clerkOp.deleteClerk))
    // .get("/getAllClerks",prot_rest(APP_CONFIG.SUPPERADMIN,APP_CONFIG.ADMIN ),catchAsync(clerkOp.getAllClerks))
    .patch("/activeClerk/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(clerkOp.activeClerk))

    .get("/getClerks", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        validatorForQueries(clerkOp.allowedFilters, clerkOp.allowedFilterValues, clerkOp.allowedSort),
        catchAsync(clerkOp.getClerks))



    .post("/addCashier", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(cashierOp.addCashier))
    .get("/getCashier/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(cashierOp.getCashier))
    .delete("/deleteCashier/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(cashierOp.deleteCashier))
    .patch("/activeCashier/:SSN", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN), catchAsync(cashierOp.activeCashier))
    .get("/getCashiers", prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN),
        validatorForQueries(cashierOp.allowedFilters, cashierOp.allowedFilterValues, cashierOp.allowedSort),
        catchAsync(cashierOp.getCashiers))
    


    /*************************************************************************************************** */
    // customer section 


    .post("/addCustomer",

        prot_rest( APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.CUSTOMER),

        catchAsync(customerOp.addCustomer)) //end of post 


    .get("/getCustomer/:id",
        prot_rest( APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.CUSTOMER ),
        catchAsync(customerOp.getCustomer)) //end of customer id



    .delete("/deleteCustomer/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.CUSTOMER),
        catchAsync(customerOp.deleteCustomer)) //end of delete 


    //why we send user id -->for admin super admin --- we will genarlize it through
    .patch("/updateProfileImage/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN,APP_CONFIG.SELLER ,APP_CONFIG.CUSTOMER),
        catchAsync(customerOp.updateProfileImage)
    )

    .patch("/activeCustomer/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.CUSTOMER),
        catchAsync(customerOp.activeCustomer))//end of patch

    .get("/getCustomers",
        prot_rest(APP_CONFIG.SUPPERADMIN, APP_CONFIG.ADMIN, APP_CONFIG.CUSTOMER),
        validatorForQueries(customerOp.allowedFilters, customerOp.allowedFilterValues, customerOp.allowedSort),
        catchAsync(customerOp.getCustomers))//end of get [pagination].



//end of customer routes section

/*************************************************************************************************** */
module.exports = route;