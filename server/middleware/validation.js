export const validatePriceRequest = (req, res, next) => {
  const { item } = req.query;
  
  if (!item) {
    return res.status(400).json({
      error: 'Missing required parameter',
      message: 'The "item" query parameter is required',
      example: '/api/price?item=milk',
      timestamp: new Date().toISOString()
    });
  }
  
  if (typeof item !== 'string' || item.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: 'The "item" parameter must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }
  
  if (item.length > 100) {
    return res.status(400).json({
      error: 'Parameter too long',
      message: 'The "item" parameter must be less than 100 characters',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};