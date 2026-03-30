"use strict";
const prisma = require('../utils/prisma');
const createConnection = async (senderId, receiverId) => {
    return await prisma.connection.create({
        data: { senderId, receiverId, status: "PENDING" }
    });
};
const findConnection = async (senderId, receiverId) => {
    return await prisma.connection.findFirst({
        where: { senderId, receiverId }
    });
};
const findConnectionById = async (connectionId) => {
    return await prisma.connection.findUnique({
        where: { id: connectionId }
    });
};
const updateConnectionStatus = async (connectionId, status) => {
    return await prisma.connection.update({
        where: { id: connectionId },
        data: { status }
    });
};
const deleteConnection = async (connectionId) => {
    return await prisma.connection.delete({
        where: { id: connectionId }
    });
};
module.exports = {
    createConnection,
    findConnection,
    findConnectionById,
    updateConnectionStatus,
    deleteConnection
};
