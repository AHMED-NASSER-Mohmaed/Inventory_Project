const { filter, forEach } = require("lodash");
const { APP_CONFIG } = require("../config/app.config");
const { sendResponseToClint } = require("../utils/apiFeatures");
const AppError = require("../utils/appError");


const validateSearchParams = (searchFiledName, searchValueAcoordingNaN, allowedSort) => {
  
  return (req, res, next) => {

    /*
    // Validate pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1); // Default page: 1
    const limit = Math.min(25, Math.max(1, parseInt(req.query.limit) || 10)); // Default limit: 10, Max: 25

    // Validate sort (optional)
    let sort = { createdAt: -1 }; // Default sort

    if (req.query.sort) {
      try {
        const [field, order] = req.query.sort.split(':'); // Split field and order

        if (allowedSort.includes(field)) { // Check if field is allowed
          sort = { [field]: order === 'asc' ? 1 : -1 }; // Set sort object
        } else {
          return res.status(400).json({ error: `Invalid sort field. Allowed fields: ${allowedSort.join(', ')}` });
        }

        if(sort['name']){
          let s=sort;
          sort={ firstName:s['name'] , lastName:s['name'] }
        }

        
      } catch (e) {
        return res.status(400).json({ error: 'Invalid sort parameter format. Use "field:order"' });
      }
    }
*/
    // Validate filters (optional)
    // let filters = {};
    
    if (req.query.filters) {
      try {

        let filterObjects = req.query.filters;

         

        filterObjects.forEach((element) => {
          const [field, value] = element.split(':');

          // Find the index of the searchFiledName array that contains the field
          const filterIndex = searchFiledName.findIndex((element) => element.trim() === field.trim());

          if (filterIndex === -1) {
            throw new AppError(`Invalid filter field: ${field}`, APP_CONFIG.HTTP_BAD_REQUEST);
          }

          // Check if the value is valid based on searchValueAcoordingNaN
          const isValueNaN = searchValueAcoordingNaN[filterIndex]; // true or false
          const isValueValid = isValueNaN ? isNaN(value) : !isNaN(value);

          if (!isValueValid) {
            throw new AppError(`Invalid value: ${value} for field: ${field}. Expected ${isValueNaN ? 'non-numeric' : 'numeric'} value.`, APP_CONFIG.HTTP_BAD_REQUEST);
          }

          
          req.validatedParams.filters[field] = value; // Insert filter objects
        });


      } catch (e) {
        return res.status(400).json({ error: e.message || 'Invalid filter parameter format. Use "field:value"' });
      }
    }
    
    

   
    
/*
    // Attach validated params to request object
    req.validatedParams = {
      page,
      limit,
      sort,
      filters,
    };*/

    next(); // Proceed to the next middleware/controller
  };
};




const validatorForQueries = (allowedFilters, allowedFilterValues, allowedSort) => {

  return (req, res, next) => {

    const page = Math.max(1, parseInt(req.query.page) || 1); // Default page: 1
    const limit = Math.min(25, Math.max(1, parseInt(req.query.limit) || 15)); // Default limit: 10 , Max: 25

    // Validate sort (optional)
    let sort = { createdAt: -1 }; // Default sort

    if (req.query.sort) {
      try {
        const [field, order] = req.query.sort.split(':'); // Split field and order

        console.log(allowedSort,field,order);

        if (allowedSort.includes(field)) { // Check if field is allowed
          sort = { [field]: order === 'asc' ? 1 : -1 }; // Set sort object
        } else {
          throw new AppError("Invalid sort field", APP_CONFIG.HTTP_BAD_REQUEST)
        }


        if(sort['name']){
          let s=sort;
          sort={ firstName:s['name'] , lastName:s['name'] }
        }

      } catch (e) {
        throw new AppError('Invalid sort parameter format. Use "field:order"', APP_CONFIG.HTTP_BAD_REQUEST)
      }
    }

    console.log("sort : ",req.query.filters);

    let filters = {}

    if (req.query.filters) {
      try {

        let filterObjects = req.query.filters.split(' ');
        req.query.filters=Array.from(filterObjects);

    

        let deletedOne=0;

       

        filterObjects.forEach((element) => {
          const [field, value] = element.split(":");

          // Find the index of the allowedFilters array that contains the field
          const filterIndex = allowedFilters.findIndex(allowedFilter => allowedFilter.includes(field));

          if (filterIndex === -1 ) {
             
            deletedOne+=1;
            return;
            // throw new AppError("Invalid filter fields", APP_CONFIG.HTTP_BAD_REQUEST)
          }

 
          filters[field] = value; // insert filter objects
          req.query.filters.splice(deletedOne,1);

        });

      } catch (e) {
        throw new AppError(`"Invalid filter parameter format. Use "field:value"`, APP_CONFIG.HTTP_BAD_REQUEST)
      }
    }

    
    
    // Attach validated params to request object
    req.validatedParams = {
      page,
      limit,
      filters,
      sort,
    };

    next();
  }
}



// module.exports.validateParams = validateParams; 


module.exports.validatorForQueries = validatorForQueries;

module.exports.validateSearchParams = validateSearchParams;