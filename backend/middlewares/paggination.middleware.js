
export const queryParser = (allowedFilters = []) => {
    return (req, res, next) => {
      const query = { ...req.query };
      
      // Pagination
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      delete query.page;
      delete query.limit;
  

      
       
      // Sorting
      const sort = {};
      if (query.sort) {
        const sortFields = query.sort.split(',');
        sortFields.forEach(field => {
          const sortOrder = field.startsWith('-') ? -1 : 1;
          sort[field.replace(/^-/, '')] = sortOrder;
        });
        delete query.sort;
      } else {
        sort._id = -1; // Default sort
      }
  
      // Filtering
      const filter = {};
      if (allowedFilters.length > 0) {
        allowedFilters.forEach(filterKey => {
          if (query[filterKey]) {
            filter[filterKey] = query[filterKey];
          }
        });
      } else {
        // Allow all filters if none specified
        Object.keys(query).forEach(key => {
          filter[key] = query[key];
        });
      }
  
      // Advanced filtering (example: greater than)
      Object.keys(filter).forEach(key => {
        if (filter[key].startsWith('gt:')) {
          filter[key] = { $gt: filter[key].split(':')[1] };
        }
      });
  
      res.locals.queryOptions = {
        filter,
        sort,
        page,
        limit,
        populate: query.populate?.split(','),
        select: query.select
      };
  
      next();
    };
  };