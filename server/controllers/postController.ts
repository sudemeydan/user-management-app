import { Request, Response, NextFunction } from 'express';
import postService from '../services/postService';
import driveClient from '../utils/driveClient';

const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id as string | number;
    const { content } = req.body;
    const files = req.files as Express.Multer.File[] || [];

    const newPost = await postService.createPostWithImages(userId, content, files);
    res.status(201).json({ success: true, message: "Gönderi paylaşıldı!", data: newPost });
  } catch (error) {
    next(error);
  }
};

const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUserId = req.user ? req.user.id : undefined;
    const posts = await postService.getAllPosts(currentUserId);
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = parseInt(req.params.id as string);
    const userId = req.user?.id as string | number;
    const userRole = req.user?.role;

    await postService.deletePost(postId, userId, userRole);
    res.json({ success: true, message: "Gönderi silindi!" });
  } catch (error) {
    next(error);
  }
};

const getImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fileId = req.params.fileId as string;
    if (!fileId) {
      res.status(400).send("No file ID provided");
      return;
    }
    await driveClient.streamFile(fileId, res);
  } catch (error) {
    next(error);
  }
};

export default {
  createPost,
  getAllPosts,
  deletePost,
  getImage
};
