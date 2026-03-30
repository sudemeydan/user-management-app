"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postService_1 = __importDefault(require("../services/postService"));
const driveClient_1 = __importDefault(require("../utils/driveClient"));
const createPost = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { content } = req.body;
        const files = req.files || [];
        const newPost = await postService_1.default.createPostWithImages(userId, content, files);
        res.status(201).json({ success: true, message: "Gönderi paylaşıldı!", data: newPost });
    }
    catch (error) {
        next(error);
    }
};
const getAllPosts = async (req, res, next) => {
    try {
        const currentUserId = req.user ? req.user.id : undefined;
        const posts = await postService_1.default.getAllPosts(currentUserId);
        res.json({ success: true, data: posts });
    }
    catch (error) {
        next(error);
    }
};
const deletePost = async (req, res, next) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user?.id;
        const userRole = req.user?.role;
        await postService_1.default.deletePost(postId, userId, userRole);
        res.json({ success: true, message: "Gönderi silindi!" });
    }
    catch (error) {
        next(error);
    }
};
const getImage = async (req, res, next) => {
    try {
        const fileId = req.params.fileId;
        if (!fileId) {
            res.status(400).send("No file ID provided");
            return;
        }
        await driveClient_1.default.streamFile(fileId, res);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createPost,
    getAllPosts,
    deletePost,
    getImage
};
