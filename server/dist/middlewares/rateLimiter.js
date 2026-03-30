"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    limit: 100,
    message: {
        success: false,
        message: 'Çok fazla istekte bulundunuz. Lütfen biraz bekleyip tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    limit: 5,
    message: {
        success: false,
        message: 'Çok fazla giriş veya kayıt denemesi yaptınız. Lütfen 1 dakika sonra tekrar deneyiniz.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: {
        success: false,
        message: 'Saatlik dosya yükleme veya analiz sınırına ulaştınız. Lütfen daha sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
