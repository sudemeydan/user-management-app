const authService = require('../services/authService');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const newUser = await authService.registerUser(req.body);
    res.status(201).json({ success: true, message: "Kayıt Başarılı! Lütfen e-postanızı onaylayın.", data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    await authService.verifyEmail(token);
    res.json({ success: true, message: "E-posta adresiniz başarıyla onaylandı! Artık giriş yapabilirsiniz." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      success: true,
      message: "Giriş Başarılı!",
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } catch (error) {
    res.status(error.statusCode || 401).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ success: true, message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ success: true, message: "Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Refresh Token bulunamadı!" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ success: false, message: "Geçersiz Refresh Token, tekrar giriş yapın." });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  refresh
};
