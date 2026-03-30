const AppError = require('../../utils/AppError');

describe('AppError Utility', () => {
    // Test 1: 4xx hataları (İstemci hataları - Client Errors)
    it('4xx (Örn: 400, 404) durum kodları için "status" değerini "fail" yapmalı', () => {
        const error = new AppError('Bulunamadı', 404);

        expect(error.message).toBe('Bulunamadı');
        expect(error.statusCode).toBe(404);
        expect(error.status).toBe('fail'); // 4 ile başladığı için 'fail' olmalı
        expect(error.isOperational).toBe(true);
    });

    // Test 2: 5xx hataları (Sunucu hataları - Server Errors)
    it('5xx (Örn: 500) durum kodları için "status" değerini "error" yapmalı', () => {
        const error = new AppError('Sunucu Hatası', 500);

        expect(error.message).toBe('Sunucu Hatası');
        expect(error.statusCode).toBe(500);
        expect(error.status).toBe('error'); // 4 ile başlamadığı için 'error' olmalı
        expect(error.isOperational).toBe(true);
    });
});