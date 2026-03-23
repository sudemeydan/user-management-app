const postRepository = require('../repositories/postRepository');
const prisma = require('../utils/prisma'); // still needed for user check
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

  const newPost = await postRepository.createPostWithImages(authorId, content, uploadedImagesData);
  return newPost;
};

const getAllPosts = async (currentUserId) => {
  return await postRepository.findAllPosts(currentUserId);
};

const deletePost = async (postId, userId, userRole) => {
  const post = await postRepository.findPostById(postId);

  if (!post) throw new Error("Gönderi bulunamadı!");

  if (post.authorId !== userId && userRole !== 'SUPERADMIN') {
    throw new Error("Bu gönderiyi silme yetkiniz yok!");
  }

  if (post.images.length > 0) {
    const deletePromises = post.images.map(img => driveClient.deleteFromDrive(img.fileId));
    await Promise.all(deletePromises);
  }

  await postRepository.deletePost(postId);

  return true;
};

module.exports = {
  createPostWithImages,
  getAllPosts,
  deletePost
};