const { APP_CONFIG } = require("../config/app.config");
const { brandService } = require("../services/brand.service");
const { sendResponseToClint } = require("../utils/apiFeatures");
const prot_rest = require("../utils/authMiddlewaresOptions");
const { validateSearchParams, validatorFilterParams, validateSortPaginationParams } = require("../middlewares/validation.middlewares");
const catchAsync = require("../utils/catchAsync")

const genaricFilters = {
    searchFiledName: ["Bname"],
    searchValueAcoordingNaN: [true],

    allowedFilterFileds: [['isActive','undefined']],
    allowedFiltervalues: [['true',"false",'undefined']],

    allowedSort: ['createdAt'],
}

const brandOp = {

    addBrand: async (req, res, next) => {
        let result = await brandService.addBrand(req.body);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    updateBrand: async (req, res, next) => {

        let result = await brandService.updateBrand(req.params.id, req.body);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
        
    },

    deleteBrand: async (req, res, next) => {

        let result = await brandService.deleteBrand(req.params.id);

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },

    activeBrand: async (req, res, next) => {

        let result = await brandService.activeBrand(req.params.id)

        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },
    getBrands: async (req, res, next) => {

        let result = await brandService.getBrands(req.validatedParams);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);

    },
    getCount: async (req, res, next) => {
        let result = await brandService.getCount(req.validatedParams.filters);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    }
}


const router = require("express").Router();

router
    .post("/brands",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(brandOp.addBrand)
    )
    .delete("/brands/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(brandOp.deleteBrand)
    )
    .get("/brands",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        validateSortPaginationParams(genaricFilters.allowedSort),
        validatorFilterParams(genaricFilters.allowedFilterFileds,genaricFilters.allowedFiltervalues),
        validateSearchParams(genaricFilters.searchFiledName,genaricFilters.searchValueAcoordingNaN),
        catchAsync(brandOp.getBrands)
    )
    .get("/brands/count",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        validatorFilterParams(genaricFilters.allowedFilterFileds,genaricFilters.allowedFiltervalues),
        catchAsync(brandOp.getCount)
    )
    .patch("/brands/:id",
        prot_rest(APP_CONFIG.SUPPERADMIN),
        catchAsync(brandOp.updateBrand)
    )


module.exports = router