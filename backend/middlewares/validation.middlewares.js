const { values } = require("lodash");
const { APP_CONFIG } = require("../config/app.config");
const mongoose=require("mongoose")

const AppError = require("../utils/appError");

const validateSortPaginationParams = (allowedSort) => {
  return (req, res, next) => {

    const page = Math.max(1, parseInt(req.query.page) || 1); // Default page: 1
    const limit = Math.min(25, Math.max(1, parseInt(req.query.limit) || 15)); // Default limit: 10 , Max: 25

    let sort = { createdAt: -1 }; // Default sort



    if (req.query.sort) {
      try {
        const [field, order] = req.query.sort.split(':'); // Split field and order



        if (allowedSort.includes(field)) { // Check if field is allowed
          sort = { [field]: order === 'asc' ? 1 : -1 }; // Set sort object
        } else {
          throw new AppError("Invalid sort field", APP_CONFIG.HTTP_BAD_REQUEST)
        }

        if (sort['name'])
          sort = { firstName: sort['name'], lastName: sort['name'] }


      } catch (e) {
        throw new AppError('Invalid sort parameter format. Use "field:type"', APP_CONFIG.HTTP_BAD_REQUEST)
      }
    }

    req.validatedParams = {
      sort,
      page,
      limit,
    }

    // console.log("from pagination : ", req.validatedParams);
    next();


  }
}


const validateSearchParams = (searchFiledName, searchValueAcoordingNaN) => {

  return (req, res, next) => {

    let filters = {}

    console.log("from search ", req.validatedParams);

    if (req.query.filters) {
      try {

        //beacause it's splited from validator fields
        let filterObjects = req.query.filters;


        filterObjects.forEach((element) => {

          let [field, value] = element.split(':');

          // console.log(field, value, "   ");

          // Find the index of the searchFiledName array that contains the field
          const filterIndex = searchFiledName.findIndex((element) => element.trim() === field.trim());

          if (filterIndex === -1) {
            throw new AppError(`Invalid filter field: ${field}`, APP_CONFIG.HTTP_BAD_REQUEST);
          }

          // // Check if the value is valid based on searchValueAcoordingNaN
          // const isValueNaN = searchValueAcoordingNaN[filterIndex]; // true or false
          // const isValueValid = isValueNaN ? isNaN(value) : !isNaN(value);

          // if (!isValueValid) {
          //   throw new AppError(`Invalid value: ${value} for field: ${field}. Expected ${isValueNaN ? 'non-numeric' : 'numeric'} value.`, APP_CONFIG.HTTP_BAD_REQUEST);
          // }


          const isValueNaN = searchValueAcoordingNaN[filterIndex];

          if (isValueNaN) {
            if (!['branch', 'brand', 'category'].includes(field))
              value = { $regex: `^${value}`, $options: 'i' }
            else
              value = new mongoose.Types.ObjectId(value);
          }
          else {
            value = Number(value)
            if (!value)
              throw new AppError(`Invalid value: ${value} for field: ${field}. Expected ${isValueNaN ? 'non-numeric' : 'numeric'} value.`, APP_CONFIG.HTTP_BAD_REQUEST);
          }

          // if (!isValueNaN) {
          // } else if (isValueNaN && !['branch', 'brand', 'category'].includes(field))


            // value = { $regex: `^${value}`, $options: 'i' }
            // value= new RegExp(`^${value}|${value}$`, 'i');

            filters[field] = value; // Insert filter objects
        });


      } catch (e) {
        return res.status(400).json({ error: e.message || 'Invalid filter parameter format. Use "field:value"' });
      }
    }

    //  be genaric fucntion
    console.log(req.validatedParams, "after");

    if (!req.validatedParams)
      req.validatedParams = {};


    Object.keys(filters).forEach(key => {
      req.validatedParams.filters[key] = filters[key];
    });

    console.log("from search : ", req.validatedParams);

    next(); // Proceed to the next middleware/controller
  };
};


const validatorFilterParams = (allowedFilters, allowedFilterValues) => {

  return (req, res, next) => {

    let filters = {}



    if (req.query.filters) {
      try {

        let filterObjects = req.query.filters.split(' ');
        req.query.filters = Array.from(filterObjects);

        let deletedOne = 0;
        // console.log("from filter:", req.query.filters);

        filterObjects.forEach((element) => {
          let [field, value] = element.split(":");

          // Find the index of the allowedFilters array that contains the field
          const filterIndex = allowedFilters.findIndex(allowedFilter => allowedFilter.includes(field));

          if (filterIndex === -1) {
            deletedOne += 1;
            return;
          }

          if (!allowedFilterValues[filterIndex].includes(value)) {
            throw new AppError("Invalid filter fields", APP_CONFIG.HTTP_BAD_REQUEST)
          }
          // console.log(value);



          if (value === 'true')
            value = true;
          else if (value === 'false')
            value = false;

          filters[field] = value; // insert filter objects
          req.query.filters.splice(deletedOne, 1);

        });

      } catch (e) {

        throw new AppError(`"Invalid filter parameter format. Use "field:value"`, APP_CONFIG.HTTP_BAD_REQUEST)
      }
    }

    // Attach validated params to request object

    if (!req.validatedParams)
      req.validatedParams = {};


    // if(!req.validatedParams.filters)

    req.validatedParams['filters'] = filters

    // else
    //   Object.keys(filters).forEach(key => {
    //     req.validatedParams.filters[key] = filters[key];
    //   });


    console.log("from filter.cccccc.", req.validatedParams);

    next();
  }

}



module.exports.validateSortPaginationParams = validateSortPaginationParams;

module.exports.validatorFilterParams = validatorFilterParams;

module.exports.validateSearchParams = validateSearchParams;