const prisma = require('../utils/prisma');

const createPostWithImages = async (authorId, content, uploadedImagesData) => {
  return await prisma.post.create({
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
      blockingUsers: { none: { blockedId: parseInt(currentUserId) } },
      blockedUsers: { none: { blockerId: parseInt(currentUserId) } }
    }
  } : undefined;

  return await prisma.post.findMany({
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
  return await prisma.post.findUnique({
    where: { id: postId },
    include: { images: true }
  });
};

const deletePost = async (postId) => {
  return await prisma.post.delete({
    where: { id: postId }
  });
};

module.exports = {
  createPostWithImages,
  findAllPosts,
  findPostById,
  deletePost
};
