const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');



const getAllUsers = async () => {
  return await userRepository.findAllUsers();
};

const getUserById = async (id) => {
  const user = await userRepository.findUserById(id);
  if (!user) {
    throw new Error('Kullanıcı bulunamadı!');
  }
  return user;
};

const registerUser = async (userData) => {
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Bu email adresi zaten kayıtlı!');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = {
    ...userData, 
    password: hashedPassword 
  };

  return await userRepository.createUser(newUser);
};

const loginUser = async (email, password) => {
 
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Kullanıcı bulunamadı!');
  }

  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Hatalı şifre!');
  }

  const { password: _, ...userWithoutPassword } = user; // Şifreyi çıkar
  return userWithoutPassword;
};

const updateUser = async (id, userData) => {
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  return await userRepository.updateUser(id, userData);
};

const deleteUser = async (id) => {
  return await userRepository.deleteUser(id);
};

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUser
};