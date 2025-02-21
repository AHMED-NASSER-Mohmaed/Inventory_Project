const bracnhService = require("../services/branch.service");
const { APP_CONFIG } = require("../config/app.config");
const catchAsync = require("../utils/catchAsync");
const pro_res = require("../utils/authMiddlewaresOptions");
const { sendResponseToClint } = require("../utils/apiFeatures");

const router = require("express").Router();

const branchController = {

    addBranch: async (req, res, next) => {
        const result = await bracnhService.addBranch(req.body);
        sendResponseToClint(res, APP_CONFIG.HTTP_OK, APP_CONFIG.SUCCESS_MESSAGE, result);
    },

}

router.route("/branches")
    .post(pro_res(APP_CONFIG.SUPPERADMIN),
        catchAsync(branchController.addBranch)
    )


module.exports = router;








