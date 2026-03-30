"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atsService_1 = __importDefault(require("../services/atsService"));
const optimizeCVFormat = async (req, res, next) => {
    try {
        const cvId = parseInt(req.params.cvId, 10);
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized: User not found" });
            return;
        }
        const result = await atsService_1.default.optimizeCVFormat(userId, cvId);
        const response = {
            success: true,
            message: "CV başarıyla ATS formatına dönüştürüldü!",
            data: result
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
};
const getATSStatus = async (req, res, next) => {
    try {
        const cvId = parseInt(req.params.cvId, 10);
        const status = await atsService_1.default.getUserATSStatus(cvId);
        const response = {
            success: true,
            data: status
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    optimizeCVFormat,
    getATSStatus
};
