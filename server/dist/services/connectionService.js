"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connectionRepository_1 = __importDefault(require("../repositories/connectionRepository"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const sendRequest = async (senderId, receiverId) => {
    if (Number(senderId) === Number(receiverId)) {
        throw new AppError_1.default("Kendinize istek atamazsınız!", 400);
    }
    const existingConnection = await connectionRepository_1.default.findConnection(senderId, receiverId);
    if (existingConnection) {
        throw new AppError_1.default("Zaten bir istek gönderdiniz veya bağlantınız var.", 400);
    }
    return await connectionRepository_1.default.createConnection(senderId, receiverId);
};
const acceptRequest = async (connectionId, userId) => {
    const connection = await connectionRepository_1.default.findConnectionById(connectionId);
    if (!connection || connection.receiverId !== Number(userId)) {
        throw new AppError_1.default("Bu isteği kabul etme yetkiniz yok.", 403);
    }
    return await connectionRepository_1.default.updateConnectionStatus(connectionId, "ACCEPTED");
};
const rejectOrRemoveRequest = async (connectionId) => {
    return await connectionRepository_1.default.deleteConnection(connectionId);
};
exports.default = {
    sendRequest,
    acceptRequest,
    rejectOrRemoveRequest
};
