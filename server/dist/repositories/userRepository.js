"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../utils/prisma"));
const findAllUsers = async (currentUserId) => {
    const whereClause = currentUserId ? {
        blockingUsers: {
            none: { blockedId: Number(currentUserId) }
        }
    } : undefined;
    return await prisma_1.default.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
            upgradeRequests: true,
            profileImage: true,
            sentConnections: true,
            receivedConnections: true,
            blockedUsers: currentUserId ? {
                where: { blockerId: Number(currentUserId) }
            } : false
        }
    });
};
const findUserById = async (id) => {
    return await prisma_1.default.user.findUnique({
        where: { id: Number(id) },
        include: { upgradeRequests: true, profileImage: true }
    });
};
const findUserByEmail = async (email) => {
    return await prisma_1.default.user.findUnique({
        where: { email }
    });
};
const createUser = async (userData) => {
    return await prisma_1.default.user.create({
        data: userData
    });
};
const updateUser = async (id, userData) => {
    const { isUpgradeRequested, upgradeRequests, id: userId, ...safeData } = userData;
    if (Object.keys(safeData).length === 0) {
        return await prisma_1.default.user.findUnique({ where: { id: Number(id) } });
    }
    return await prisma_1.default.user.update({
        where: { id: Number(id) },
        data: safeData
    });
};
const deleteUser = async (id) => {
    return await prisma_1.default.user.delete({
        where: { id: Number(id) }
    });
};
const createUpgradeRequest = async (userId) => {
    return await prisma_1.default.upgradeRequest.create({
        data: {
            userId: Number(userId),
            status: 'PENDING'
        }
    });
};
const findLatestUpgradeRequest = async (userId) => {
    return await prisma_1.default.upgradeRequest.findFirst({
        where: { userId: Number(userId) },
        orderBy: { createdAt: 'desc' }
    });
};
const updateUpgradeRequestStatus = async (requestId, status) => {
    return await prisma_1.default.upgradeRequest.update({
        where: { id: Number(requestId) },
        data: { status }
    });
};
const blockUser = async (blockerId, blockedId) => {
    return await prisma_1.default.block.create({
        data: {
            blockerId: Number(blockerId),
            blockedId: Number(blockedId)
        }
    });
};
const unblockUser = async (blockerId, blockedId) => {
    return await prisma_1.default.block.delete({
        where: {
            blockerId_blockedId: {
                blockerId: Number(blockerId),
                blockedId: Number(blockedId)
            }
        }
    });
};
const findUserWithConnections = async (targetUserId, requesterId) => {
    return await prisma_1.default.user.findUnique({
        where: { id: Number(targetUserId) },
        include: {
            sentConnections: { where: { receiverId: Number(requesterId), status: 'ACCEPTED' } },
            receivedConnections: { where: { senderId: Number(requesterId), status: 'ACCEPTED' } }
        }
    });
};
exports.default = {
    findAllUsers,
    findUserById,
    findUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    createUpgradeRequest,
    findLatestUpgradeRequest,
    updateUpgradeRequestStatus,
    blockUser,
    unblockUser,
    findUserWithConnections
};
