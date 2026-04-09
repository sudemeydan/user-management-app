"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const emailService_1 = __importDefault(require("./emailService"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const registerUser = async (userData) => {
    const { email, password, confirmPassword, address, ...otherData } = userData;
    if (!email || !password || !confirmPassword || !address) {
        throw new Error("Lütfen e-posta, şifre, şifre tekrarı ve şehir (adres) alanlarını doldurun.");
    }
    if (password !== confirmPassword) {
        throw new AppError_1.default("Girdiğiniz şifreler eşleşmiyor.", 400);
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new AppError_1.default("Åifre en az 8 karakter olmalı; en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.", 400);
    }
    const validCities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];
    if (!validCities.includes(address)) {
        throw new AppError_1.default("Lütfen geçerli bir şehir seçiniz.", 400);
    }
    const existingUser = await userRepository_1.default.findUserByEmail(email);
    if (existingUser) {
        throw new AppError_1.default("Bu e-posta adresi zaten kullanımda.", 400);
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    const newUser = await userRepository_1.default.createUser({
        ...otherData,
        email,
        address,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        isEmailVerified: false
    });
    try {
        await emailService_1.default.sendVerificationEmail(newUser.email, verificationToken);
        console.log(`Onay maili gönderildi: ${newUser.email}`);
    }
    catch (error) {
        console.error("Mail gönderme hatası:", error);
    }
    return newUser;
};
const verifyEmail = async (token) => {
    const user = await prisma_1.default.user.findUnique({
        where: { emailVerificationToken: token }
    });
    if (!user) {
        throw new AppError_1.default("Geçersiz veya süresi dolmuş onay kodu.", 400);
    }
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null
        }
    });
    return true;
};
const loginUser = async (email, password) => {
    // Return type inference will carry user up to the controller
    const user = await userRepository_1.default.findUserByEmail(email);
    if (!user) {
        throw new AppError_1.default("E-posta adresi veya şifre hatalı.", 401);
    }
    if (!user.isEmailVerified) {
        throw new AppError_1.default("Lütfen giriş yapmadan önce e-posta adresinize gönderilen linkten hesabınızı onaylayın.", 403);
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.default("E-posta adresi veya şifre hatalı.", 401);
    }
    return user;
};
const forgotPassword = async (email) => {
    const user = await userRepository_1.default.findUserByEmail(email);
    if (!user) {
        throw new AppError_1.default("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.", 400);
    }
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 saat geçerli
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetPasswordExpires
        }
    });
    await emailService_1.default.sendPasswordResetEmail(user.email, resetToken);
    return true;
};
const resetPassword = async (token, newPassword) => {
    const user = await prisma_1.default.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { gt: new Date() }
        }
    });
    if (!user) {
        throw new AppError_1.default("Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.", 400);
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        }
    });
    return true;
};
exports.default = {
    registerUser,
    verifyEmail,
    loginUser,
    forgotPassword,
    resetPassword
};
