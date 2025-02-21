const branchModel = require("../models/branch.model");
 

module.exports = {


    addBranch: async  (data) => {
        try {

            return await branchModel.create(data);

        } catch (err) {

            throw err;

        }

    }
}