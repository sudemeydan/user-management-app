const prisma = require('../utils/prisma');


const findAllUsers = async () => {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' } // En son eklenen en üstte olsun
  });
};

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id) }
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
  return await prisma.user.update({
    where: { id: parseInt(id) },
    data: userData
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  findAllUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser
};