const express = require("express");
const catchAsync=require("../utils/catchAsync")
const {sellerService}= require("../services/seller.service");
const authMiddleware=require("../middlewares/auth.middleware");
const { APP_CONFIG } = require("../config/app.config");
const {staffService}=require("../services/staff.service");
const prot_rest=require("../utils/authMiddlewaresOptions");
const userService=require("../services/user.service");
const User = require("../models/user.model");
const route= express.Router();




const sellerOp={

    addSeller: async (req,res,next)=>{
        // req.body.role=APP_CONFIG.CLERK;
        req.body.passwordConfirm=req.body.password
        const user=await sellerService.createSeller(req.body);
        res.status(APP_CONFIG.HTTP_CREATED).json({
            message:"success",
            user,
        })
    },

    getSeller: async (req,res,next)=>{
        const user =await sellerService.getSeller(req.params.SSN);
        
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            user,
        })
    },

    deleteSeller: async (req,res,next)=>{
        const ack=await sellerService.deleteSeller(req.params.SSN);
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
        })
    },

    approveSeller: async (req,res,next)=>{

        console.log(req.params);
        const ack=await sellerService.approveSeller(req.params.SSN);
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
        })
    },

    activeSellerAcount:async (req,res,next)=>{
        console.log(req.params.SSN);
        const ack=await sellerService.activeSeller(req.params.SSN);
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
        })
    }

}


/********************************************************************/

const adminOp={
    addAdmin:async (req,res,next)=>{
    
        //attach role on data
        req.body.role=APP_CONFIG.ADMIN;
        req.body.managerId=req.user._id;
    
        req.body.passwordConfirm=req.body.password
    
        const admin=await staffService.createStaff(req.body);
    
    
        res.status(APP_CONFIG.HTTP_CREATED).json({
            message:"success",
            admin,
        })
    
    },
    deleteAdmin:async (req,res,next)=>{

        const ack=await staffService.deleteStaff({SSN:req.params.SSN,role:APP_CONFIG.ADMIN});
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
        })
    
    },
    getAdmin:async (req,res,next)=>{

        const admin=await staffService.getStaff({SSN:req.params.SSN,role:APP_CONFIG.ADMIN});
    
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            admin,
        })
    
    },
    getAllAdmins:async (req,res,next)=>{
        const allAdmins=await staffService.getAll(APP_CONFIG.ADMIN);
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            allAdmins,
        })
    },

    activeAdmin:async (req,res,next)=>{
        const ack=await staffService.activeStaff({SSN:req.params.SSN,role:APP_CONFIG.ADMIN});
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
        })
    }


}
 
/***********************************************************************/

const clerkOp={
    addClerk:async (req,res,next)=>{
    
        //attach role on data
        req.body.role=APP_CONFIG.CLERK;
        console.log(req.user._id);
        req.body.managerId=req.user._id;
        req.body.passwordConfirm=req.body.password
        const clerk=await staffService.createStaff(req.body);

        res.status(APP_CONFIG.HTTP_CREATED).json({
            message:"success",
            clerk,
        })
    },
    deleteClerk:async (req,res,next)=>{

        const ack=await staffService.deleteStaff({SSN:req.params.SSN,role:APP_CONFIG.CLERK});
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
        })
    
    },

    getClerk:async (req,res,next)=>{

        const clerk=await staffService.getStaff({SSN:req.params.SSN,role:APP_CONFIG.CLERK});
    
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            clerk,
        })
    
    },
    getAllClerks:async (req,res,next)=>{
        const allClerks=await staffService.getAll(APP_CONFIG.CLERK);
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            allClerks,
        })
    
    },
    activeClerk:async (req,res,nect)=>{
    
        const ack=await staffService.activeStaff({SSN:req.params.SSN,role:APP_CONFIG.CLERK});
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
        })
    }
}
   
/**********************************************************************************/

const cashierOp={

    addCashier:async (req,res,next)=>{
    
        //attach role on data
        req.body.role=APP_CONFIG.CASHIER;
        req.body.managerId=req.user._id;
        req.body.passwordConfirm=req.body.password
        const cashier=await staffService.createStaff(req.body);
    
    
        res.status(APP_CONFIG.HTTP_CREATED).json({
            message:"success",
            cashier,
        })
    
    },
    deleteCashier:async (req,res,next)=>{

        const ack=await staffService.deleteStaff({SSN:req.params.SSN,role:APP_CONFIG.CASHIER});
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
        })
    
    },
    getCashier:async (req,res,next)=>{

        const cashier=await staffService.getStaff({SSN:req.params.SSN,role:APP_CONFIG.CASHIER});
    
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            cashier,
        })
    
    },
    getAllCashiers:async (req,res,next)=>{

        const allCashiers=await staffService.getAll(APP_CONFIG.CASHIER);
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            allCashiers,
        })
    
    },
    activeCashier:async (req,res,next)=>{
    
        const ack=await staffService.activeStaff({SSN:req.params.SSN,role:APP_CONFIG.CASHIER});
    
        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
        })
    }

}
 

/************************************************************************************/


const customerOp={

    addCustomer:async (req,res,next)=>{

        req.body.userType=APP_CONFIG.CUSTOMER;
        req.body.passwordConfirm=req.body.password;
        const customer= await userService.createUser(req.body);

        res.status(APP_CONFIG.HTTP_CREATED).json({
            message:"success",
            customer,
        })

    },

    deleteCustomer:async (req,res,next)=>{
        const ack= await userService.deleteUser(req.params.id);
         res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
         })
    },

    activeCustomer:async (req,res,next)=>{
        const ack=await userService.activeUser(req.params.id);

        res.status(APP_CONFIG.HTTP_OK).json({
            message:"success",
            ack,
         })
    },

    getCustomer:async (req,res,next)=>{
        const customer=await userService.getUser(res.params.id);
        res.status(APP_CONFIG.HTTP_OK).json({
            status:"success",
            customer,
        })
    },

    getAllCustomers: async (req,res,next)=>{
        const customers = await userService.getAllUsers();

        res.status(APP_CONFIG.HTTP_OK).json({
            status:"success",
            customers,
        })
    }
     
}



/**************************************************************************************/


route.post("/addSeller", prot_rest("super_admin" ,"admin" ), catchAsync(sellerOp.addSeller))
    .get("/getSeller/:SSN",prot_rest("super_admin", "admin" ),catchAsync(sellerOp.getSeller))
    .delete("/deleteSeller/:SSN",prot_rest("super_admin", "admin" ),catchAsync(sellerOp.deleteSeller))
    .patch("/approveSeller/:SSN",prot_rest("super_admin" , "admin" ),catchAsync(sellerOp.approveSeller))
    .patch("/activeSeller/:SSN",prot_rest("super_admin", "admin" ),catchAsync(sellerOp.activeSellerAcount))
    
    .post("/addAdmin",prot_rest("super_admin"),catchAsync(adminOp.addAdmin))
    .get("/getAdmin/:SSN",prot_rest("super_admin"),catchAsync(adminOp.getAdmin))
    .delete("/deleteAdmin/:SSN",prot_rest("super_admin"),catchAsync(adminOp.deleteAdmin))
    .get("/getAllAdmins",prot_rest("super_admin"),catchAsync(adminOp.getAllAdmins))
    .patch("/activeAdmin/:SSN",prot_rest("super_admin"),catchAsync(adminOp.activeAdmin))
    

    .post("/addClerk",prot_rest("super_admin" , "admin" ),catchAsync(clerkOp.addClerk))
    .get("/getClerk/:SSN",prot_rest("super_admin" , "admin" ),catchAsync(clerkOp.getClerk))
    .delete("/deleteClerk/:SSN",prot_rest("super_admin" ,  "admin" ),catchAsync(clerkOp.deleteClerk))
    .get("/getAllClerks",prot_rest("super_admin" ,  "admin" ),catchAsync(clerkOp.getAllClerks))
    .patch("/activeClerk/:SSN",prot_rest("super_admin" ,  "admin" ),catchAsync(clerkOp.activeClerk))
    

    .post("/addCashier",prot_rest("super_admin" , "admin"),catchAsync(cashierOp.addCashier))
    .get("/getCashier/:SSN",prot_rest("super_admin" , "admin"),catchAsync(cashierOp.getCashier))
    .delete("/deleteCashier/:SSN",prot_rest("super_admin" , "admin"),catchAsync(cashierOp.deleteCashier))
    .get("/getAllCashiers",prot_rest("super_admin" , "admin"),catchAsync(cashierOp.getAllCashiers))
    .patch("/activeCashier/:SSN",prot_rest("super_admin" , "admin"),catchAsync(cashierOp.activeCashier))
    

    .post("/addCustomer",prot_rest("super_admin" , "admin"),catchAsync(customerOp.addCustomer))
    .get("/getCustomer/:id",prot_rest("super_admin" , "admin"),catchAsync(customerOp.getCustomer ))
    .get("/getAllCustomers",prot_rest("super_admin" , "admin"),catchAsync(customerOp.getAllCustomers))
    .delete("/deleteCustomer/:id",prot_rest("super_admin" , "admin"),catchAsync(customerOp.deleteCustomer))
    .patch("/activeCustomer/:id",prot_rest("super_admin" , "admin"),catchAsync(customerOp.activeCustomer))



module.exports=route;