"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../utils/prisma"));
const createPostWithImages = async (authorId, content, uploadedImagesData) => {
    return await prisma_1.default.post.create({
        data: {
            content: content,
            authorId: authorId,
            images: {
                create: uploadedImagesData
            }
        },
        include: {
            images: true,
            author: {
                select: { id: true, name: true, profileImage: true }
            }
        }
    });
};
const findAllPosts = async (currentUserId) => {
    const whereClause = currentUserId ? {
        author: {
            blockingUsers: { none: { blockedId: Number(currentUserId) } },
            blockedUsers: { none: { blockerId: Number(currentUserId) } }
        }
    } : undefined;
    return await prisma_1.default.post.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
            images: true,
            author: {
                select: { id: true, name: true, role: true, profileImage: true }
            }
        }
    });
};
const findPostById = async (postId) => {
    return await prisma_1.default.post.findUnique({
        where: { id: postId },
        include: { images: true }
    });
};
const deletePost = async (postId) => {
    return await prisma_1.default.post.delete({
        where: { id: postId }
    });
};
exports.default = {
    createPostWithImages,
    findAllPosts,
    findPostById,
    deletePost
};
