"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = __importDefault(require("../services/authService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = async (req, res, next) => {
    try {
        const newUser = await authService_1.default.registerUser(req.body);
        res.status(201).json({ success: true, message: "Kayıt Başarılı! Lütfen e-postanızı onaylayın.", data: newUser });
    }
    catch (error) {
        next(error);
    }
};
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        await authService_1.default.verifyEmail(token);
        res.json({ success: true, message: "E-posta adresiniz başarıyla onaylandı! Artık giriş yapabilirsiniz." });
    }
    catch (error) {
        next(error);
    }
};
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: "E-posta ve şifre zorunludur." });
            return;
        }
        const user = await authService_1.default.loginUser(email, password);
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({
            success: true,
            message: "Giriş Başarılı!",
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
    catch (error) {
        next(error);
    }
};
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        await authService_1.default.forgotPassword(email);
        res.json({ success: true, message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
    }
    catch (error) {
        next(error);
    }
};
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        await authService_1.default.resetPassword(token, newPassword);
        res.json({ success: true, message: "Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz." });
    }
    catch (error) {
        next(error);
    }
};
const refresh = async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(401).json({ success: false, message: "Refresh Token bulunamadı!" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET);
        const newAccessToken = jsonwebtoken_1.default.sign({ id: decoded.id, email: decoded.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ success: true, accessToken: newAccessToken });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    registerUser,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    refresh
};
