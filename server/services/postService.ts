import AppError from "../utils/AppError";
import postRepository from '../repositories/postRepository';
import prisma from '../utils/prisma'; 
import driveClient from '../utils/driveClient';
import fs from 'fs';

const createPostWithImages = async (authorId: number | string, content: string, files: Express.Multer.File[]) => {
  let uploadedImagesData: any[] = [];

  if (files && files.length > 0) {
    const uploadPromises = files.map(async (file) => {
      const result = await driveClient.uploadToDrive(file);

      fs.unlink(file.path, (err) => {
        if (err) console.error("GeÃ§ici dosya silinemedi:", err);
      });

      return {
        url: result.publicUrl,
        fileId: result.fileId
      };
    });

    uploadedImagesData = await Promise.all(uploadPromises);
  }

  const newPost = await postRepository.createPostWithImages(Number(authorId), content, uploadedImagesData);
  return newPost;
};

const getAllPosts = async (currentUserId?: number | string) => {
  return await postRepository.findAllPosts(currentUserId);
};

const deletePost = async (postId: number, userId: number | string, userRole?: string) => {
  const post: any = await postRepository.findPostById(postId);

  if (!post) throw new AppError("GÃ¶nderi bulunamadÄ±!", 400);

  if (post.authorId !== Number(userId) && userRole !== 'SUPERADMIN') {
    throw new AppError("Bu gÃ¶nderiyi silme yetkiniz yok!", 400);
  }

  if (post.images.length > 0) {
    const deletePromises = post.images.map((img: any) => driveClient.deleteFromDrive(img.fileId));
    await Promise.all(deletePromises);
  }

  await postRepository.deletePost(postId);

  return true;
};

export default {
  createPostWithImages,
  getAllPosts,
  deletePost
};
