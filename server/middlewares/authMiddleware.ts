import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 2. JWT token Ã§Ã¶zÃ¼ldÃ¼ÄŸÃ¼nde ortaya Ã§Ä±kan veri iÃ§in bir JwtPayload arayÃ¼zÃ¼ tanÄ±mla
export interface AuthJwtPayload extends jwt.JwtPayload {
  id: string | number;
  email: string;
  role?: string;
}

// 3. Express'in standart Request objesini geniÅŸleterek Type Augmentation saÄŸla
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
    return res.status(401).json({ success: false, message: "EriÅŸim reddedildi. GeÃ§erli bir kimlik kartÄ± (Token) yok." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthJwtPayload;
    req.user = decoded; 
    next(); 
  } catch (error) {
    return res.status(403).json({ success: false, message: "GeÃ§ersiz veya sÃ¼resi dolmuÅŸ kimlik kartÄ±." });
  }
};

export default verifyToken;
