const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error(`[💥 HATA] ${err.statusCode} - ${err.message}`);

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message
  });
};

module.exports = errorHandler;