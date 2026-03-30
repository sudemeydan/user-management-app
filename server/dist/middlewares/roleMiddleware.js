"use strict";
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ success: false, message: "Erişim reddedildi. Rol bilgisi yok." });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Bu işlem için yetkiniz yok!" });
        }
        next();
    };
};
module.exports = roleMiddleware;
