"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connectionService_1 = __importDefault(require("../services/connectionService"));
const sendRequest = async (req, res, next) => {
    try {
        const senderId = req.user?.id;
        const receiverId = parseInt(req.body.receiverId);
        const connection = await connectionService_1.default.sendRequest(senderId, receiverId);
        res.json({ success: true, message: "İstek başarıyla gönderildi", data: connection });
    }
    catch (error) {
        next(error);
    }
};
const acceptRequest = async (req, res, next) => {
    try {
        const connectionId = parseInt(req.params.id);
        const userId = req.user?.id;
        const updatedConnection = await connectionService_1.default.acceptRequest(connectionId, userId);
        res.json({ success: true, message: "İstek kabul edildi!", data: updatedConnection });
    }
    catch (error) {
        next(error);
    }
};
const rejectOrRemoveRequest = async (req, res, next) => {
    try {
        const connectionId = parseInt(req.params.id);
        await connectionService_1.default.rejectOrRemoveRequest(connectionId);
        res.json({ success: true, message: "Bağlantı silindi" });
    }
    catch (error) {
        next(error);
    }
};
exports.default = { sendRequest, acceptRequest, rejectOrRemoveRequest };
