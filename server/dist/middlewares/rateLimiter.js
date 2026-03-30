"use strict";
const rateLimit = require('express-rate-limit');
// Genel API Limitsizleyici: Dakikada 100 istek
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 dakika
    max: 100, // Her IP için sınır
    message: {
        success: false,
        message: 'Çok fazla istekte bulundunuz. Lütfen biraz bekleyip tekrar deneyin.'
    },
    standardHeaders: true, // `RateLimit-*` header'larını döndürür
    legacyHeaders: false, // `X-RateLimit-*` header'larını devre dışı bırakır
});
// Auth Limitsizleyici: Dakikada 5 istek (Brute force koruması)
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Çok fazla giriş veya kayıt denemesi yaptınız. Lütfen 1 dakika sonra tekrar deneyiniz.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Upload Limitsizleyici: Saatte 10 istek
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 10,
    message: {
        success: false,
        message: 'Saatlik dosya yükleme veya analiz sınırına ulaştınız. Lütfen daha sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
module.exports = {
    apiLimiter,
    authLimiter,
    uploadLimiter
};
