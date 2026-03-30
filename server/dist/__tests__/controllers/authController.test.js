"use strict";
const authController = require('../../controllers/authController');
const authService = require('../../services/authService');
const jwt = require('jsonwebtoken');
jest.mock('../../services/authService');
jest.mock('jsonwebtoken');
describe('AuthController Tests', () => {
    let req, res, next;
    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });
    describe('registerUser', () => {
        it('Başarılı kayıtta 201 statü kodu ve başarı mesajı dönmeli', async () => {
            req.body = { email: 'test@example.com', password: 'Password123' };
            const mockUser = { id: 1, email: 'test@example.com' };
            authService.registerUser.mockResolvedValue(mockUser);
            await authController.registerUser(req, res, next);
            expect(authService.registerUser).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Kayıt Başarılı! Lütfen e-postanızı onaylayın.",
                data: mockUser
            });
        });
        it('Servis hata fırlattığında hatayı next() fonksiyonuna iletmeli', async () => {
            req.body = { email: 'test@example.com' };
            const mockError = new Error('Kayıt başarısız');
            authService.registerUser.mockRejectedValue(mockError);
            await authController.registerUser(req, res, next);
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
        });
    });
    describe('login', () => {
        it('Başarılı girişte Tokenları üretip dönmeli', async () => {
            req.body = { email: 'test@example.com', password: 'Password123' };
            const mockUser = { id: 1, email: 'test@example.com', role: 'user' };
            authService.loginUser.mockResolvedValue(mockUser);
            jwt.sign
                .mockReturnValueOnce('mock_access_token')
                .mockReturnValueOnce('mock_refresh_token');
            await authController.login(req, res, next);
            expect(authService.loginUser).toHaveBeenCalledWith(req.body.email, req.body.password);
            expect(jwt.sign).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Giriş Başarılı!",
                user: mockUser,
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            });
        });
    });
});
