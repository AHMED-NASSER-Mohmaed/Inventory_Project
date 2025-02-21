const branchRepo = require("../repos/branch.repo");
const AppError= require("../utils/appError");
const APP_CONFIG = require("../config/app.config");

module.exports= {

    addBranch: async (data) => {

        try {

            let allowedKeys = ['name', 'type', 'location', 'admin', 'employees' , 'isActive'];

            let keys = Object.keys(data);

            keys.forEach(Element => {
                if (!allowedKeys.includes(Element)) {
                    throw new AppError("invalid field name", APP_CONFIG.HTTP_BAD_REQUEST);
                }
            });

            return await branchRepo.addBranch(data);

        } catch (err) {
            throw err;
        }
    }

     
}

 