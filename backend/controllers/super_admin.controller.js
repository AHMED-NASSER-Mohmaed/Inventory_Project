const express = require("express");
const catchAsync=require("../utils/catchAsync")
const {sellerService}= require("../services/seller.service");
const authMiddleware=require("../middlewares/auth.middleware");
const { APP_CONFIG } = require("../config/app.config");
const {staffService}=require("../services/staff.service");
const prot_rest=require("../utils/authMiddlewaresOptions");
const route= express.Router();



const addSeller= async (req,res,next)=>{
    // req.body.role=APP_CONFIG.CLERK;
    const user=await sellerService.createSeller(req.body);
    res.status(APP_CONFIG.HTTP_CREATED).json({
        message:"success",
        user,
    })
}

const getSeller= async (req,res,next)=>{
    const user =await sellerService.getSeller(req.params.SSN);
    
    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        user,
    })
}

const deleteSeller= async (req,res,next)=>{
    const ack=await sellerService.deleteSeller(req.params.SSN);

    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })
} 

const approveSeller= async (req,res,next)=>{

    console.log(req.params);
    const ack=await sellerService.approveSeller(req.params.SSN);
    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })
}

const activeSellerAcount=async (req,res,next)=>{
    console.log(req.params.SSN);
    const ack=await sellerService.activeSeller(req.params.SSN);
    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })
}
/******************************************************************* */

const addAdmin=async (req,res,next)=>{
    
    //attach role on data
    req.body.role=APP_CONFIG.ADMIN;
    req.body.managerId=req.user._id;

    const admin=await staffService.createStaff(req.body);


    res.status(APP_CONFIG.HTTP_CREATED).json({
        message:"success",
        admin,
    })

}

const deleteAdmin=async (req,res,next)=>{

    const ack=await staffService.deleteStaff({SSN:req.params.SSN,role:APP_CONFIG.ADMIN});
    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })

}

const getAdmin=async (req,res,next)=>{

    const admin=await staffService.getStaff({SSN:req.params.SSN,role:APP_CONFIG.ADMIN});


    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        admin,
    })

}

const getAllAdmins=async (req,res,next)=>{
    const allAdmins=await staffService.getAll(APP_CONFIG.ADMIN);

    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        allAdmins,
    })
}

const activeAdmin=async (req,res,nect)=>{

    const ack=await staffService.activeStaff({SSN:req.params.SSN,role:APP_CONFIG.ADMIN});

    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })
}
/********************************************************************** */

const addClerk=async (req,res,next)=>{
    
    //attach role on data
    req.body.role=APP_CONFIG.CLERK;
    console.log(req.user._id);
    req.body.managerId=req.user._id;

    const clerk=await staffService.createStaff(req.body);


    res.status(APP_CONFIG.HTTP_CREATED).json({
        message:"success",
        clerk,
    })

}

const deleteClerk=async (req,res,next)=>{

    const ack=await staffService.deleteStaff({SSN:req.params.SSN,role:APP_CONFIG.CLERK});
    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })

}

const getClerk=async (req,res,next)=>{

    const clerk=await staffService.getStaff({SSN:req.params.SSN,role:APP_CONFIG.CLERK});


    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        clerk,
    })

}

const getAllClerks=async (req,res,next)=>{
    const allClerks=await staffService.getAll(APP_CONFIG.CLERK);

    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        allClerks,
    })

}


const activeClerk=async (req,res,nect)=>{
    
    const ack=await staffService.activeStaff({SSN:req.params.SSN,role:APP_CONFIG.CLERK});

    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })
}
/********************************************************************************* */



const addCashier=async (req,res,next)=>{
    
    //attach role on data
    req.body.role=APP_CONFIG.CASHIER;
    req.body.managerId=req.user._id;

    const cashier=await staffService.createStaff(req.body);


    res.status(APP_CONFIG.HTTP_CREATED).json({
        message:"success",
        cashier,
    })

}

const deleteCashier=async (req,res,next)=>{

    const ack=await staffService.deleteStaff({SSN:req.params.SSN,role:APP_CONFIG.CASHIER});
    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })

}

const getCashier=async (req,res,next)=>{

    const cashier=await staffService.getStaff({SSN:req.params.SSN,role:APP_CONFIG.CASHIER});


    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        cashier,
    })

}

const getAllCashiers=async (req,res,next)=>{

    const allCashiers=await staffService.getAll(APP_CONFIG.CASHIER);

    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        allCashiers,
    })

}

const activeCashier=async (req,res,nect)=>{
    
    const ack=await staffService.activeStaff({SSN:req.params.SSN,role:APP_CONFIG.CASHIER});

    res.status(APP_CONFIG.HTTP_OK).json({
        message:"success",
        ack,
    })
}




route.post("/superadmin/addSeller",prot_rest("super_admin"),catchAsync(addSeller))
    .get("/superadmin/getSeller/:SSN",prot_rest("super_admin"),catchAsync(getSeller))
    .delete("/superadmin/deleteSeller/:SSN",prot_rest("super_admin"),catchAsync(deleteSeller))
    .patch("/superadmin/approveSeller/:SSN",prot_rest("super_admin"),catchAsync(approveSeller))
    .patch("/superadmin/activeSeller/:SSN",prot_rest("super_admin"),catchAsync(activeSellerAcount))
    
    .post("/superadmin/addAdmin",prot_rest("super_admin"),catchAsync(addAdmin))
    .get("/superadmin/getAdmin/:SSN",prot_rest("super_admin"),catchAsync(getAdmin))
    .delete("/superadmin/deleteAdmin/:SSN",prot_rest("super_admin"),catchAsync(deleteAdmin))
    .get("/superadmin/getAllAdmins",prot_rest("super_admin"),catchAsync(getAllAdmins))
    .patch("/superadmin/activeAdmin/:SSN",prot_rest("super_admin"),catchAsync(activeAdmin))
    

    .post("/superadmin/addClerk",prot_rest("super_admin"),catchAsync(addClerk))
    .get("/superadmin/getClerk/:SSN",prot_rest("super_admin"),catchAsync(getClerk))
    .delete("/superadmin/deleteClerk/:SSN",prot_rest("super_admin"),catchAsync(deleteClerk))
    .get("/superadmin/getAllClerks",prot_rest("super_admin"),catchAsync(getAllClerks))
    .patch("/superadmin/activeClerk/:SSN",prot_rest("super_admin"),catchAsync(activeClerk))
    

    .post("/superadmin/addCashier",prot_rest("super_admin"),catchAsync(addCashier))
    .get("/superadmin/getCashier/:SSN",prot_rest("super_admin"),catchAsync(getCashier))
    .delete("/superadmin/deleteCashier/:SSN",prot_rest("super_admin"),catchAsync(deleteCashier))
    .get("/superadmin/getAllCashiers",prot_rest("super_admin"),catchAsync(getAllCashiers))
    .patch("/superadmin/activeCashier/:SSN",prot_rest("super_admin"),catchAsync(activeCashier))
    


  

module.exports=route;