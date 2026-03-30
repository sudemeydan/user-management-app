import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  message: {
    success: false,
    message: 'Ã‡ok fazla istekte bulundunuz. LÃ¼tfen biraz bekleyip tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: 'Ã‡ok fazla giriÅŸ veya kayÄ±t denemesi yaptÄ±nÄ±z. LÃ¼tfen 1 dakika sonra tekrar deneyiniz.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: 'Saatlik dosya yÃ¼kleme veya analiz sÄ±nÄ±rÄ±na ulaÅŸtÄ±nÄ±z. LÃ¼tfen daha sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
