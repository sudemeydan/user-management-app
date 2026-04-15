import userRepository from '../repositories/userRepository';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import emailService from './emailService';
import AppError from '../utils/AppError';
import prisma from '../utils/prisma';

// 1. Kullanıcı Kayıt isteklerinin tipleri
export interface RegisterUserData {
  email?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
  [key: string]: any;
}

const registerUser = async (userData: RegisterUserData) => {
  const { email, password, confirmPassword, address, ...otherData } = userData;

  if (!email || !password || !confirmPassword || !address) {
    throw new Error("Lütfen e-posta, şifre, şifre tekrarı ve şehir (adres) alanlarını doldurun.");
  }

  if (password !== confirmPassword) {
    throw new AppError("Girdiğiniz şifreler eşleşmiyor.", 400);
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new AppError("Åifre en az 8 karakter olmalı; en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.", 400);
  }

  const validCities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];
  if (!validCities.includes(address)) {
    throw new AppError("Lütfen geçerli bir şehir seçiniz.", 400);
  }

  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Bu e-posta adresi zaten kullanımda.", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const newUser = await userRepository.createUser({
    ...otherData,
    email,
    address,
    password: hashedPassword,
    emailVerificationToken: verificationToken,
    isEmailVerified: false
  } as any);

  try {
    await emailService.sendVerificationEmail(newUser.email, verificationToken);
    console.log(`Onay maili gönderildi: ${newUser.email}`);
  } catch (error) {
    console.error("Mail gönderme hatası:", error);
  }

  return newUser;
};

const verifyEmail = async (token: string) => {
  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token }
  });

  if (!user) {
    throw new AppError("Geçersiz veya süresi dolmuş onay kodu.", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null
    }
  });

  return true;
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const loginUser = async (email: string, password: string) => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("E-posta adresi veya şifre hatalı.", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Lütfen giriş yapmadan önce e-posta adresinize gönderilen linkten hesabınızı onaylayın.", 403);
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const remainingMs = new Date(user.lockedUntil).getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);
    throw new AppError(
      `Hesabınız çok fazla başarısız giriş denemesi nedeniyle kilitlendi. Lütfen ${remainingMin} dakika sonra tekrar deneyin.`,
      423
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const newAttempts = user.failedLoginAttempts + 1;
    const updateData: any = { failedLoginAttempts: newAttempts };

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCK_TIME_MS);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const remainingAttempts = MAX_FAILED_ATTEMPTS - newAttempts;
    if (remainingAttempts <= 0) {
      throw new AppError(
        `Çok fazla başarısız giriş denemesi. Hesabınız ${LOCK_TIME_MS / 60000} dakika boyunca kilitlendi.`,
        423
      );
    }

    throw new AppError(
      `E-posta adresi veya şifre hatalı. Kalan deneme hakkınız: ${remainingAttempts}`,
      401
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  return user;
};

const forgotPassword = async (email: string) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.", 400);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 saat geçerli

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetPasswordExpires
    }
  });

  await emailService.sendPasswordResetEmail(user.email, resetToken);
  return true;
};

const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() }
    }
  });

  if (!user) {
    throw new AppError("Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  return true;
};

export default {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword
};
