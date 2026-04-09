import { Request, Response, NextFunction } from 'express';
import authService, { RegisterUserData } from '../services/authService';
import jwt from 'jsonwebtoken';

// 1. Kullanıcı Login isteklerinin tipleri
export interface LoginRequestData {
  email?: string;
  password?: string;
}

const registerUser = async (req: Request<{}, {}, RegisterUserData>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newUser = await authService.registerUser(req.body);
    res.status(201).json({ success: true, message: "Kayıt Başarılı! Lütfen e-postanızı onaylaın.", data: newUser });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req: Request<{ token: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    await authService.verifyEmail(token);
    res.json({ success: true, message: "E-posta adresiniz başarıyla onaylanıdı! Artık giriş yapabilirsiniz." });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request<{}, {}, LoginRequestData>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "E-posta ve şifre zorunludur." });
      return;
    }
    const user = await authService.loginUser(email, password);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
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
    next(error);
  }
};

const forgotPassword = async (req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ success: true, message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req: Request<{ token: string }, {}, { newPassword: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ success: true, message: "Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz." });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req: Request<{}, {}, { refreshToken: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ success: false, message: "Refresh Token bulunamadı!" });
    return;
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as import('../middlewares/authMiddleware').AuthJwtPayload;
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );
    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

export default {
  registerUser,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  refresh
};
