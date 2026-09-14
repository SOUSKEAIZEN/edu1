"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const auth_service_1 = require("../services/auth.service");
const authMiddleware = async (req, res, next) => {
    const token = req.cookies?.session_id;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const user = await auth_service_1.AuthService.validateSession(token);
        if (!user) {
            res.clearCookie('session_id');
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.authMiddleware = authMiddleware;
