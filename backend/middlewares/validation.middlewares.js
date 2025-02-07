const { APP_CONFIG } = require("../config/app.config");
const {sendResponseToClint}=require("../utils/apiFeatures")


const validateParams = (req, res, next) => {
  const allowedSort = ['createdAt', 'name']; // Allowed fields for sorting

  // Validate pagination params
  const page = Math.max(1, parseInt(req.query.page) || 1); // Default page: 1
  const limit = Math.min(25, Math.max(1, parseInt(req.query.limit) || 10)); // Default limit: 10 , Max: 25

  // Validate sort (optional)
  let sort = { createdAt: -1 }; // Default sort

  if (req.query.sort) {
    try {

      const [field, order] = req.query.sort.split(':'); // Split field and order
      
      console.log(field);
      
      if (allowedSort.includes(field)) { // Check if field is allowed
        sort = { [field]: order === 'asc' ? 1 : -1 }; // Set sort object
      } else {
        return res.status(400).json({ error: `Invalid sort field. Allowed fields: ${allowedSort.join(', ')}` });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid sort parameter format. Use "field:order"' });
    }
  }

  // Attach validated params to request object
  req.validatedParams = {
    page,
    limit,
    sort
  };

  next(); // Proceed to the next middleware/controller
};

const validatorForQueries = (allowedFilter, allowedFilterValues, allowedSort) => {

  return (req, res, next) => {

    const page = Math.max(1, parseInt(req.query.page) || 1); // Default page: 1
    const limit = Math.min(25, Math.max(1, parseInt(req.query.limit) || 15)); // Default limit: 10 , Max: 25

    // Validate sort (optional)
    let sort = { createdAt: -1 }; // Default sort

    if (req.query.sort) {

      try {

        const [field, order] = req.query.sort.split(':'); // Split field and order

        console.log(field,order,allowedSort);



        if (allowedSort.includes(field)) { // Check if field is allowed
          
          sort = { [field]: order === 'asc' ? 1 : -1 }; // Set sort object

          // console.log("wellcome",sort)
        } else {
          sendResponseToClint(res, APP_CONFIG.HTTP_BAD_REQUEST, "Invalid sort field")
        }

      } catch (e) {
        sendResponseToClint(res, APP_CONFIG.HTTP_BAD_REQUEST, 'Invalid sort parameter format. Use "field:order"')
      }

      console.log("helelo")

    }

    // console.log("a7a:",req.query.filters);

    let filters = {}

    if (req.query.filters) {

      try {

       

        let filterObjects = [];
        
        filterObjects = req.query.filters.split(' ');

        
        console.log(filterObjects,"helllo");
        
        filterObjects.forEach(element => {
          [field, value] = element.split(":");
          
          
          if ( !(allowedFilter.includes(field) && allowedFilterValues.includes(value)) ) {
            
             sendResponseToClint(res, APP_CONFIG.HTTP_BAD_REQUEST, "Invalid filter fields")
          }

          filters[field] = value; // insert filter objects

        });

      } catch (e) {
         sendResponseToClint(res, APP_CONFIG.HTTP_BAD_REQUEST, 'Invalid sort parameter format. Use "field:value"')
      }


    }

    // console.log(sort,filters);
    // Attach validated params to request object
    req.validatedParams = {
      page,
      limit,
      filters,
      sort,
      
    };

    // console.log(req.validatedParams)


    next();

  }



}




module.exports.validateParams = validateParams; 


module.exports.validatorForQueries = validatorForQueries;