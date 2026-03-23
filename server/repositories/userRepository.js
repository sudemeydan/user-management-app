const prisma = require('../utils/prisma');

const findAllUsers = async (currentUserId) => {
  const whereClause = currentUserId ? {
    blockingUsers: {
      none: { blockedId: parseInt(currentUserId) }
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
        where: { blockerId: parseInt(currentUserId) }
      } : false
    }
  });
};

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id) },
    include: { upgradeRequests: true, profileImage: true }
  });
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email: email }
  });
};

const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData
  });
};

const updateUser = async (id, userData) => {

  const {
    isUpgradeRequested,
    upgradeRequests,
    id: userId,
    ...safeData
  } = userData;

  if (Object.keys(safeData).length === 0) {
    return await prisma.user.findUnique({ where: { id: parseInt(id) } });
  }

  return await prisma.user.update({
    where: { id: parseInt(id) },
    data: safeData
  });
};


const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id: parseInt(id) }
  });
};


const createUpgradeRequest = async (userId) => {
  return await prisma.upgradeRequest.create({
    data: {
      userId: parseInt(userId),
      status: 'PENDING'
    }
  });
};

const findLatestUpgradeRequest = async (userId) => {
  return await prisma.upgradeRequest.findFirst({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' }
  });
};

const updateUpgradeRequestStatus = async (requestId, status) => {
  return await prisma.upgradeRequest.update({
    where: { id: parseInt(requestId) },
    data: { status: status }
  });
};

const blockUser = async (blockerId, blockedId) => {
  return await prisma.block.create({
    data: {
      blockerId: parseInt(blockerId),
      blockedId: parseInt(blockedId)
    }
  });
};

const unblockUser = async (blockerId, blockedId) => {
  return await prisma.block.delete({
    where: {
      blockerId_blockedId: {
        blockerId: parseInt(blockerId),
        blockedId: parseInt(blockedId)
      }
    }
  });
};

module.exports = {
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
  unblockUser
};