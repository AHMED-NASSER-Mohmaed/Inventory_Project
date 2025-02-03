



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

module.exports = validateParams; 