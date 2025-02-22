const branchModel = require("../models/branch.model");
 

module.exports = {


    addBranch: async  (data) => {
        try {

            fields=['name', "type" , "governate" , 'location' , 'registrationNumber' , 'type' , ]

            return await branchModel.create(data);

        } catch (err) {

            throw err;

        }

    }
}