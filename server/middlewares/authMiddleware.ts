import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 2. JWT token çözüldüğünde ortaya çıkan veri için bir JwtPayload arayüzü tanımla
export interface AuthJwtPayload extends jwt.JwtPayload {
  id: string | number;
  email: string;
  role?: string;
}

// 3. Express'in standart Request objesini genişleterek Type Augmentation sağla
declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload;
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void | Response => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Erişim reddedildi. Geçerli bir kimlik kartı (Token) yok." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthJwtPayload;
    req.user = decoded; 
    next(); 
  } catch (error) {
    return res.status(403).json({ success: false, message: "Geçersiz veya süresi dolmuş kimlik kartı." });
  }
};

export default verifyToken;
