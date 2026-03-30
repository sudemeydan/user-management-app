"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../utils/prisma"));
const createConnection = async (senderId, receiverId) => {
    return await prisma_1.default.connection.create({
        data: { senderId: Number(senderId), receiverId: Number(receiverId), status: "PENDING" }
    });
};
const findConnection = async (senderId, receiverId) => {
    return await prisma_1.default.connection.findFirst({
        where: { senderId: Number(senderId), receiverId: Number(receiverId) }
    });
};
const findConnectionById = async (connectionId) => {
    return await prisma_1.default.connection.findUnique({
        where: { id: Number(connectionId) }
    });
};
const updateConnectionStatus = async (connectionId, status) => {
    return await prisma_1.default.connection.update({
        where: { id: Number(connectionId) },
        data: { status }
    });
};
const deleteConnection = async (connectionId) => {
    return await prisma_1.default.connection.delete({
        where: { id: Number(connectionId) }
    });
};
exports.default = {
    createConnection,
    findConnection,
    findConnectionById,
    updateConnectionStatus,
    deleteConnection
};
