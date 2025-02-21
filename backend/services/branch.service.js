const branchRepo = require("../repos/branch.repo");
const AppError = require("../utils/appError");
const APP_CONFIG = require("../config/app.config");

module.exports = {

    addBranch: async (data) => {

        try {

            fields = ['registrationNumber', 'governate', 'location',]

            Object.keys(data).forEach(element => {
                if (!fields.includes(element))
                    throw new AppError("invalid fields!!", APP_CONFIG.HTTP_BAD_REQUEST);
            });

            return await branchRepo.addBranch(data);

        } catch (err) {
            throw err;
        }
    }


}

