const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const driveClient = require('../utils/driveClient');
const fs = require('fs');

const createPostWithImages = async (authorId, content, files) => {
  let uploadedImagesData = [];

  if (files && files.length > 0) {
    const uploadPromises = files.map(async (file) => {
      const result = await driveClient.uploadToDrive(file);
      
      fs.unlink(file.path, (err) => {
        if (err) console.error("Geçici dosya silinemedi:", err);
      });

      return {
        url: result.publicUrl,
        fileId: result.fileId
      };
    });

    uploadedImagesData = await Promise.all(uploadPromises);
  }

  const newPost = await prisma.post.create({
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

  return newPost;
};

const getAllPosts = async () => {
  return await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      images: true,
      author: {
        select: { id: true, name: true, role: true, profileImage: true }
      }
    }
  });
};

const deletePost = async (postId, userId, userRole) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { images: true }
  });

  if (!post) throw new Error("Gönderi bulunamadı!");

  if (post.authorId !== userId && userRole !== 'SUPERADMIN') {
    throw new Error("Bu gönderiyi silme yetkiniz yok!");
  }

  if (post.images.length > 0) {
    const deletePromises = post.images.map(img => driveClient.deleteFromDrive(img.fileId));
    await Promise.all(deletePromises);
  }

  await prisma.post.delete({
    where: { id: postId }
  });

  return true;
};

module.exports = {
  createPostWithImages,
  getAllPosts,
  deletePost
};