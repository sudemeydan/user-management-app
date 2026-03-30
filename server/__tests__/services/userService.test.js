const userService = require('../../services/userService');
const userRepository = require('../../repositories/userRepository');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailService = require('../../services/emailService');
const prisma = require('../../utils/prisma');
const AppError = require('../../utils/AppError');

jest.mock('../../repositories/userRepository');
jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('../../services/emailService', () => ({
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn()
})); jest.mock('../../utils/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
    }
}));

describe('UserService Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        const validUserData = {
            email: 'test@example.com',
            password: 'Password123',
            confirmPassword: 'Password123',
            address: 'İzmir'
        };

        it('Eksik bilgi gönderildiğinde hata fırlatmalı', async () => {
            await expect(userService.registerUser({ email: 'test@test.com' }))
                .rejects
                .toThrow("Lütfen e-posta, şifre, şifre tekrarı ve şehir (adres) alanlarını doldurun.");
        });

        it('Şifreler eşleşmediğinde AppError (400) fırlatmalı', async () => {
            const data = { ...validUserData, confirmPassword: 'WrongPassword' };

            await expect(userService.registerUser(data))
                .rejects
                .toThrow(AppError);
        });

        it('Geçersiz şehir girildiğinde AppError (400) fırlatmalı', async () => {
            const data = { ...validUserData, address: 'Yozgat' }; // Yozgat geçerli şehirler listesinde yok

            await expect(userService.registerUser(data))
                .rejects
                .toThrow("Lütfen geçerli bir şehir seçiniz.");
        });

        it('Tüm bilgiler doğruysa kullanıcıyı oluşturmalı ve e-posta göndermeli', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashed_password');
            crypto.randomBytes.mockReturnValue({ toString: () => 'fake_token' });

            const mockCreatedUser = { id: 1, email: validUserData.email, isEmailVerified: false };
            userRepository.createUser.mockResolvedValue(mockCreatedUser);
            emailService.sendVerificationEmail.mockResolvedValue(true);

            const result = await userService.registerUser(validUserData);

            expect(result).toEqual(mockCreatedUser);
            expect(userRepository.createUser).toHaveBeenCalledTimes(1);
            expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(validUserData.email, 'fake_token');
        });
    });

    describe('loginUser', () => {
        it('Kullanıcı bulunamazsa AppError (401) fırlatmalı', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null); // Kullanıcı yok

            await expect(userService.loginUser('test@test.com', 'password'))
                .rejects
                .toThrow("E-posta adresi veya şifre hatalı.");
        });

        it('E-posta onaylı değilse AppError (403) fırlatmalı', async () => {
            userRepository.findUserByEmail.mockResolvedValue({ email: 'test@test.com', isEmailVerified: false });

            await expect(userService.loginUser('test@test.com', 'password'))
                .rejects
                .toThrow("Lütfen giriş yapmadan önce e-posta adresinize gönderilen linkten hesabınızı onaylayın.");
        });

        it('Başarılı giriş yapıldığında kullanıcıyı döndürmeli', async () => {
            const mockUser = { id: 1, email: 'test@test.com', password: 'hashed_password', isEmailVerified: true };

            userRepository.findUserByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            const result = await userService.loginUser('test@test.com', 'password');

            expect(result).toEqual(mockUser);
            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed_password');
        });
    });
});