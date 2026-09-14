"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};
exports.requireRole = requireRole;
