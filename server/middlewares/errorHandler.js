const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Sadece terminale logluyoruz (Kullanıcı bunları görmez)
  console.error(`[💥 HATA] ${err.statusCode} - ${err.message}`);

  // Frontend'e giden tertemiz, güvenli cevap
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message
  });
};

module.exports = errorHandler;