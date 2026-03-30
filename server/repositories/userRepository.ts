import prisma from '../utils/prisma';
import { User, Prisma, UpgradeRequest, Block } from '@prisma/client';

const findAllUsers = async (currentUserId?: string | number) => {
  const whereClause: Prisma.UserWhereInput | undefined = currentUserId ? {
    blockingUsers: {
      none: { blockedId: Number(currentUserId) }
    }
  } : undefined;

  return await prisma.user.findMany({
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

const findUserById = async (id: string | number) => {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
    include: { upgradeRequests: true, profileImage: true }
  });
};

const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};

const createUser = async (userData: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data: userData
  });
};

const updateUser = async (id: string | number, userData: any) => {
  const {
    isUpgradeRequested,
    upgradeRequests,
    id: userId,
    ...safeData
  } = userData;

  if (Object.keys(safeData).length === 0) {
    return await prisma.user.findUnique({ where: { id: Number(id) } });
  }

  return await prisma.user.update({
    where: { id: Number(id) },
    data: safeData as Prisma.UserUpdateInput
  });
};

const deleteUser = async (id: string | number) => {
  return await prisma.user.delete({
    where: { id: Number(id) }
  });
};

const createUpgradeRequest = async (userId: string | number) => {
  return await prisma.upgradeRequest.create({
    data: {
      userId: Number(userId),
      status: 'PENDING'
    }
  });
};

const findLatestUpgradeRequest = async (userId: string | number) => {
  return await prisma.upgradeRequest.findFirst({
    where: { userId: Number(userId) },
    orderBy: { createdAt: 'desc' }
  });
};

const updateUpgradeRequestStatus = async (requestId: string | number, status: any) => {
  return await prisma.upgradeRequest.update({
    where: { id: Number(requestId) },
    data: { status }
  });
};

const blockUser = async (blockerId: string | number, blockedId: string | number) => {
  return await prisma.block.create({
    data: {
      blockerId: Number(blockerId),
      blockedId: Number(blockedId)
    }
  });
};

const unblockUser = async (blockerId: string | number, blockedId: string | number) => {
  return await prisma.block.delete({
    where: {
      blockerId_blockedId: {
        blockerId: Number(blockerId),
        blockedId: Number(blockedId)
      }
    }
  });
};

const findUserWithConnections = async (targetUserId: string | number, requesterId: string | number) => {
  return await prisma.user.findUnique({
    where: { id: Number(targetUserId) },
    include: {
      sentConnections: { where: { receiverId: Number(requesterId), status: 'ACCEPTED' } },
      receivedConnections: { where: { senderId: Number(requesterId), status: 'ACCEPTED' } }
    }
  });
};

export default {
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
