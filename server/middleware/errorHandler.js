export const errorHandler = (err, req, res, next) => {
  console.error('💥 Server Error:', err);
  
  // Default error response
  let status = 500;
  let message = 'Internal server error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid data format';
  } else if (err.code === 'ENOTFOUND') {
    status = 503;
    message = 'Service temporarily unavailable';
  }
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.message 
    }),
    timestamp: new Date().toISOString()
  });
};