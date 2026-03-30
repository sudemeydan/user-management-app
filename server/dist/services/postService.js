"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../utils/AppError"));
const postRepository_1 = __importDefault(require("../repositories/postRepository"));
const driveClient_1 = __importDefault(require("../utils/driveClient"));
const fs_1 = __importDefault(require("fs"));
const createPostWithImages = async (authorId, content, files) => {
    let uploadedImagesData = [];
    if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
            const result = await driveClient_1.default.uploadToDrive(file);
            fs_1.default.unlink(file.path, (err) => {
                if (err)
                    console.error("Geçici dosya silinemedi:", err);
            });
            return {
                url: result.publicUrl,
                fileId: result.fileId
            };
        });
        uploadedImagesData = await Promise.all(uploadPromises);
    }
    const newPost = await postRepository_1.default.createPostWithImages(Number(authorId), content, uploadedImagesData);
    return newPost;
};
const getAllPosts = async (currentUserId) => {
    return await postRepository_1.default.findAllPosts(currentUserId);
};
const deletePost = async (postId, userId, userRole) => {
    const post = await postRepository_1.default.findPostById(postId);
    if (!post)
        throw new AppError_1.default("Gönderi bulunamadı!", 400);
    if (post.authorId !== Number(userId) && userRole !== 'SUPERADMIN') {
        throw new AppError_1.default("Bu gönderiyi silme yetkiniz yok!", 400);
    }
    if (post.images.length > 0) {
        const deletePromises = post.images.map((img) => driveClient_1.default.deleteFromDrive(img.fileId));
        await Promise.all(deletePromises);
    }
    await postRepository_1.default.deletePost(postId);
    return true;
};
exports.default = {
    createPostWithImages,
    getAllPosts,
    deletePost
};
