"use strict";
const connectionService = require('../services/connectionService');
const sendRequest = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const receiverId = parseInt(req.body.receiverId);
        const connection = await connectionService.sendRequest(senderId, receiverId);
        res.json({ success: true, message: "İstek başarıyla gönderildi 📩", data: connection });
    }
    catch (error) {
        next(error);
    }
};
const acceptRequest = async (req, res, next) => {
    try {
        const connectionId = parseInt(req.params.id);
        const userId = req.user.id;
        const updatedConnection = await connectionService.acceptRequest(connectionId, userId);
        res.json({ success: true, message: "İstek kabul edildi! 🎉", data: updatedConnection });
    }
    catch (error) {
        next(error);
    }
};
const rejectOrRemoveRequest = async (req, res, next) => {
    try {
        const connectionId = parseInt(req.params.id);
        await connectionService.rejectOrRemoveRequest(connectionId);
        res.json({ success: true, message: "Bağlantı/İstek silindi 🗑️" });
    }
    catch (error) {
        next(error);
    }
};
module.exports = { sendRequest, acceptRequest, rejectOrRemoveRequest };
