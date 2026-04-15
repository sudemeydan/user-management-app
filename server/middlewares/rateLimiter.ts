import rateLimit from 'express-rate-limit';
import { Request } from 'express';

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

export const loginEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req: Request) => {
    return `login_email_${req.body?.email?.toLowerCase() || 'unknown'}`;
  },
  skip: (req: Request) => {
    return !req.body?.email;
  },
  message: {
    success: false,
    message: 'Bu e-posta adresi için çok fazla başarısız giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.'
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
