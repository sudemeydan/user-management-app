import { Request, Response, NextFunction } from 'express';

const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: "Erişim reddedildi. Rol bilgisi yok." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Bu işlem için yetkiniz yok!" });
    }
    next();
  };
};

export default roleMiddleware;
