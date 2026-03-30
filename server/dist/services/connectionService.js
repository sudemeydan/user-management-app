"use strict";
const connectionRepository = require('../repositories/connectionRepository');
const AppError = require('../utils/AppError');
const sendRequest = async (senderId, receiverId) => {
    if (senderId === receiverId) {
        throw new AppError("Kendinize istek atamazsınız!", 400);
    }
    const existingConnection = await connectionRepository.findConnection(senderId, receiverId);
    if (existingConnection) {
        throw new AppError("Zaten bir istek gönderdiniz veya bağlantınız var.", 400);
    }
    return await connectionRepository.createConnection(senderId, receiverId);
};
const acceptRequest = async (connectionId, userId) => {
    const connection = await connectionRepository.findConnectionById(connectionId);
    if (!connection || connection.receiverId !== userId) {
        throw new AppError("Bu isteği kabul etme yetkiniz yok.", 403);
    }
    return await connectionRepository.updateConnectionStatus(connectionId, "ACCEPTED");
};
const rejectOrRemoveRequest = async (connectionId) => {
    return await connectionRepository.deleteConnection(connectionId);
};
module.exports = {
    sendRequest,
    acceptRequest,
    rejectOrRemoveRequest
};
