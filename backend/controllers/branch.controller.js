const bracnhService = require("../services/branch.service");
const { APP_CONFIG } = require("../config/app.config");
const catchAsync = require("../utils/catchAsync");
const pro_res = require("../utils/authMiddlewaresOptions");
const { sendResponseToClint } = require("../utils/apiFeatures");
const { validateSearchParams, validatorFilterParams, validateSortPaginationParams } = require("../middlewares/validation.middlewares");


const genaricFilters = {
    searchFiledName: ["governate"],
    searchValueAcoordingNaN: [false],

    searchFiledNameForCustomer: ["firstName", "lastName", "phoneNumber"],
    searchValueAcoordingNaNforCustomer: [true, true, false],

    allowedFilters: [["isActive", "undefined"]],
    allowedFilterValues: [["true", "false","undefined"]],

    allowedSort: ['createdAt'],
}

const router = require("express").Router();

const branchController = {

    addBranch: async (req, res, next) => {
        const result = await bracnhService.addBranch(req.body);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },
    getBranchesMaped:async (req,res,next)=>{
        const result = await bracnhService.getBranchesMaped();
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },
    updateBranch:async (req,res,next)=>{
        const result = bracnhService.updateBranch(req.params.id,req.body);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

    deleteBranch:async (req,res,next)=>{

        const result = bracnhService.deleteBranch(req.params.id);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },
    activeBranch:async (req,res,next)=>{

        const result = bracnhService.activeBranch(req.params.id);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },
    getBranches:async (req,res,next)=>{
         
        const result = await bracnhService.getBranches(req.validatedParams);
        
        sendResponseToClint(res,APP_CONFIG.HTTP_OK,APP_CONFIG.SUCCESS_MESSAGE, result);
    }


}

router.post("/branches",pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(branchController.addBranch)
    )

    //search by field name + paginate using is active  only 
    .get("/branches/maped",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(branchController.getBranchesMaped)
    )

    .get("/branches",
        pro_res(APP_CONFIG.SUPPERADMIN),
        validateSortPaginationParams(genaricFilters.allowedSort),
        validatorFilterParams(genaricFilters.allowedFilters,genaricFilters.allowedFilterValues),
        validateSearchParams(genaricFilters.searchFiledName,genaricFilters.searchValueAcoordingNaN),
        catchAsync(branchController.getBranches)
    )
    .patch("/branches/update/:id",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(branchController.updateBranch)
    )
    .delete("/branches/delete/:id",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(branchController.deleteBranch)
    )
    .patch("/branches/active/:id",
        pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(branchController.activeBranch)
    )

module.exports = router;








