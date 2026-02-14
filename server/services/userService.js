const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');

// --- AŞÇI KATMANI (SERVICE) ---
// Kurallar, kontroller ve şifreleme burada yapılır.

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
  // 1. Kontrol: Bu email veya kullanıcı adı zaten var mı?
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Bu email adresi zaten kayıtlı!');
  }

  // 2. İşlem: Şifreyi güvenli hale getir (Hashing)
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // 3. Kayıt: Veritabanına hashlenmiş şifreyle gönder
  const newUser = {
    ...userData, // Diğer bilgileri (ad, yaş vb.) aynen al
    password: hashedPassword // Şifreyi değiştir
  };

  return await userRepository.createUser(newUser);
};

const loginUser = async (email, password) => {
  // 1. Kullanıcıyı bul
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Kullanıcı bulunamadı!');
  }

  // 2. Şifreyi kontrol et (Hash kıyaslama)
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Hatalı şifre!');
  }

  // 3. Başarılıysa kullanıcıyı döndür (Şifreyi gizleyerek)
  const { password: _, ...userWithoutPassword } = user; // Şifreyi çıkar
  return userWithoutPassword;
};

const updateUser = async (id, userData) => {
  // Eğer şifre güncelleniyorsa, onu tekrar hashlememiz gerekir
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