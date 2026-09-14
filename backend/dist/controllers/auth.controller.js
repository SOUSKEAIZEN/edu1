"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async requestOtp(req, res) {
        try {
            const { email } = req.body;
            const result = await auth_service_1.AuthService.requestRegistrationOTP(email);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const result = await auth_service_1.AuthService.verifyOTP(email, otp);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async completeRegistration(req, res) {
        try {
            const { token, firstName, lastName, password } = req.body;
            const result = await auth_service_1.AuthService.completeRegistration(token, firstName, lastName, password);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const ip = req.ip || '';
            const ua = req.headers['user-agent'] || '';
            const result = await auth_service_1.AuthService.login(email, password, ip, ua);
            res.cookie('session_id', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            res.json({ user: result.user });
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    static async googleLogin(req, res) {
        try {
            const { idToken } = req.body;
            const ip = req.ip || '';
            const ua = req.headers['user-agent'] || '';
            const result = await auth_service_1.AuthService.googleLogin(idToken, ip, ua);
            res.cookie('session_id', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });
            res.json({ user: result.user });
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    static async logout(req, res) {
        try {
            const token = req.cookies.session_id;
            if (token) {
                await auth_service_1.AuthService.logout(token);
            }
            res.clearCookie('session_id');
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async me(req, res) {
        // Requires auth middleware
        res.json({ user: req.user });
    }
}
exports.AuthController = AuthController;
