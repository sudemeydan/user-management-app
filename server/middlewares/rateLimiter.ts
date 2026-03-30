import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  message: {
    success: false,
    message: 'Çok fazla istekte bulundunuz. Lütfen biraz bekleyip tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: 'Çok fazla giriş veya kayıt denemesi yaptınız. Lütfen 1 dakika sonra tekrar deneyiniz.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: 'Saatlik dosya yükleme veya analiz sınırına ulaştınız. Lütfen daha sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
