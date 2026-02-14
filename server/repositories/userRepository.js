const prisma = require('../utils/prisma');

// Bu katman SADECE veritabanı ile konuşur (SQL yerine Prisma kullanır)

const findAllUsers = async () => {
  // SQL: SELECT * FROM User
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' } // En son eklenen en üstte olsun
  });
};

const findUserById = async (id) => {
  // SQL: SELECT * FROM User WHERE id = ?
  // id string gelirse int'e çeviriyoruz
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
  // SQL: INSERT INTO User (...) VALUES (...)
  return await prisma.user.create({
    data: userData
  });
};

const updateUser = async (id, userData) => {
  // SQL: UPDATE User SET ... WHERE id = ?
  return await prisma.user.update({
    where: { id: parseInt(id) },
    data: userData
  });
};

const deleteUser = async (id) => {
  // SQL: DELETE FROM User WHERE id = ?
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