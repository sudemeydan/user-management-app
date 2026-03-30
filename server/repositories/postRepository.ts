import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

const createPostWithImages = async (authorId: number, content: string, uploadedImagesData: any[]) => {
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

const findAllPosts = async (currentUserId?: string | number) => {
  const whereClause: Prisma.PostWhereInput | undefined = currentUserId ? {
    author: {
      blockingUsers: { none: { blockedId: Number(currentUserId) } },
      blockedUsers: { none: { blockerId: Number(currentUserId) } }
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

const findPostById = async (postId: number) => {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: { images: true }
  });
};

const deletePost = async (postId: number) => {
  return await prisma.post.delete({
    where: { id: postId }
  });
};

export default {
  createPostWithImages,
  findAllPosts,
  findPostById,
  deletePost
};
