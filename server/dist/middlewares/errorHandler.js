"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    console.error(`[ERROR] ${err.statusCode} - ${err.message}`);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message
    });
};
exports.default = errorHandler;
