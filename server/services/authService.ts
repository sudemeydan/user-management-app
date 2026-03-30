import userRepository from '../repositories/userRepository';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import emailService from './emailService';
import AppError from '../utils/AppError';
import prisma from '../utils/prisma';

// 1. KullanÄ±cÄ± KayÄ±t isteklerinin tipleri
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
    throw new Error("LÃ¼tfen e-posta, ÅŸifre, ÅŸifre tekrarÄ± ve ÅŸehir (adres) alanlarÄ±nÄ± doldurun.");
  }

  if (password !== confirmPassword) {
    throw new AppError("GirdiÄŸiniz ÅŸifreler eÅŸleÅŸmiyor.", 400);
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new AppError("Åifre en az 8 karakter olmalÄ±; en az bir bÃ¼yÃ¼k harf, bir kÃ¼Ã§Ã¼k harf ve bir rakam iÃ§ermelidir.", 400);
  }

  const validCities = ["Ä°stanbul", "Ankara", "Ä°zmir", "Bursa", "Antalya"];
  if (!validCities.includes(address)) {
    throw new AppError("LÃ¼tfen geÃ§erli bir ÅŸehir seÃ§iniz.", 400);
  }

  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Bu e-posta adresi zaten kullanÄ±mda.", 400);
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
    console.log(`Onay maili gÃ¶nderildi: ${newUser.email}`);
  } catch (error) {
    console.error("Mail gÃ¶nderme hatasÄ±:", error);
  }

  return newUser;
};

const verifyEmail = async (token: string) => {
  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token }
  });

  if (!user) {
    throw new AppError("GeÃ§ersiz veya sÃ¼resi dolmuÅŸ onay kodu.", 400);
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

const loginUser = async (email: string, password: string) => {
  // Return type inference will carry user up to the controller
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("E-posta adresi veya ÅŸifre hatalÄ±.", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("LÃ¼tfen giriÅŸ yapmadan Ã¶nce e-posta adresinize gÃ¶nderilen linkten hesabÄ±nÄ±zÄ± onaylayÄ±n.", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("E-posta adresi veya ÅŸifre hatalÄ±.", 401);
  }

  return user;
};

const forgotPassword = async (email: string) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError("Bu e-posta adresiyle kayÄ±tlÄ± bir kullanÄ±cÄ± bulunamadÄ±.", 400);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 saat geÃ§erli

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
    throw new AppError("GeÃ§ersiz veya sÃ¼resi dolmuÅŸ ÅŸifre sÄ±fÄ±rlama baÄŸlantÄ±sÄ±.", 400);
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
