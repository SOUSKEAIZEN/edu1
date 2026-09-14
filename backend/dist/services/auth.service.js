"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = require("../db");
const argon2 = __importStar(require("argon2"));
const crypto_1 = __importDefault(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
class AuthService {
    // Generates a 6-digit OTP
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // Request OTP for registration
    static async requestRegistrationOTP(email) {
        // Basic mock logic: in real app, send email
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        // Create an unverified user placeholder if not exists, or just store OTP mapped to email
        // For simplicity, we just store OTP. Let's create a temp user or check if exists.
        const userRes = await (0, db_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length > 0) {
            throw new Error('User already exists');
        }
        // In a real system we'd store OTPs without a user_id or with a temporary user state.
        // For the DB schema provided, otp_requests requires user_id. So we MUST create the user first.
        // But wait, the prompt says "Email -> OTP -> verification -> name -> password -> account creation".
        // This implies the user doesn't exist yet during OTP. The schema has user_id REFERENCES users.
        // So we might need a temporary table, or we just insert the user in an 'UNVERIFIED' state.
        // Let's insert the user with empty names and inactive state.
        const roleRes = await (0, db_1.query)('SELECT id FROM roles WHERE name = $1', ['STUDENT']); // Default role
        if (roleRes.rows.length === 0)
            throw new Error('Role not found');
        const roleId = roleRes.rows[0].id;
        const newUser = await (0, db_1.query)(`INSERT INTO users (email, first_name, last_name, role_id, is_active) VALUES ($1, '', '', $2, FALSE) RETURNING id`, [email, roleId]);
        const userId = newUser.rows[0].id;
        await (0, db_1.query)(`INSERT INTO otp_requests (user_id, otp_code, expires_at) VALUES ($1, $2, $3)`, [userId, otp, expiresAt]);
        console.log(`[DEV ONLY] OTP for ${email} is ${otp}`);
        return { success: true, message: 'OTP sent' };
    }
    // Verify OTP
    static async verifyOTP(email, otp) {
        const userRes = await (0, db_1.query)('SELECT id FROM users WHERE email = $1 AND is_active = FALSE', [email]);
        if (userRes.rows.length === 0)
            throw new Error('Invalid request');
        const userId = userRes.rows[0].id;
        const otpRes = await (0, db_1.query)(`SELECT id FROM otp_requests WHERE user_id = $1 AND otp_code = $2 AND expires_at > NOW() AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`, [userId, otp]);
        if (otpRes.rows.length === 0)
            throw new Error('Invalid or expired OTP');
        await (0, db_1.query)('UPDATE otp_requests SET used_at = NOW() WHERE id = $1', [otpRes.rows[0].id]);
        // Generate a temporary verification token to complete registration
        const tempToken = crypto_1.default.randomBytes(32).toString('hex');
        await (0, db_1.query)(`INSERT INTO email_verifications (user_id, token, expires_at, verified_at) VALUES ($1, $2, $3, NOW())`, [userId, tempToken, new Date(Date.now() + 30 * 60 * 1000)] // 30 mins to complete registration
        );
        return { token: tempToken };
    }
    // Complete Registration
    static async completeRegistration(token, firstName, lastName, passwordPlain) {
        const verifRes = await (0, db_1.query)(`SELECT user_id FROM email_verifications WHERE token = $1 AND expires_at > NOW()`, [token]);
        if (verifRes.rows.length === 0)
            throw new Error('Invalid or expired token');
        const userId = verifRes.rows[0].user_id;
        const passwordHash = await argon2.hash(passwordPlain);
        await (0, db_1.query)(`UPDATE users SET first_name = $1, last_name = $2, password_hash = $3, is_active = TRUE WHERE id = $4`, [firstName, lastName, passwordHash, userId]);
        return { success: true };
    }
    // Login
    static async login(email, passwordPlain, ip, userAgent) {
        const userRes = await (0, db_1.query)(`SELECT u.id, u.password_hash, u.is_active, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1`, [email]);
        if (userRes.rows.length === 0)
            throw new Error('Invalid credentials');
        const user = userRes.rows[0];
        if (!user.is_active)
            throw new Error('Account inactive');
        if (!user.password_hash)
            throw new Error('Invalid login method'); // Might be Google only
        const valid = await argon2.verify(user.password_hash, passwordPlain);
        if (!valid)
            throw new Error('Invalid credentials');
        // Create session
        const sessionToken = crypto_1.default.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        await (0, db_1.query)(`INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)`, [user.id, sessionToken, expiresAt, ip, userAgent]);
        return { token: sessionToken, user: { id: user.id, email, role: user.role } };
    }
    // Google Login
    static async googleLogin(idToken, ip, userAgent) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email)
            throw new Error('Invalid Google token');
        const email = payload.email;
        let userRes = await (0, db_1.query)(`SELECT u.id, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1`, [email]);
        let userId;
        let userRole;
        if (userRes.rows.length === 0) {
            // Create user
            const roleRes = await (0, db_1.query)('SELECT id FROM roles WHERE name = $1', ['STUDENT']);
            const roleId = roleRes.rows[0].id;
            userRole = 'STUDENT';
            const insertRes = await (0, db_1.query)(`INSERT INTO users (email, first_name, last_name, role_id, is_active) VALUES ($1, $2, $3, $4, TRUE) RETURNING id`, [email, payload.given_name || '', payload.family_name || '', roleId]);
            userId = insertRes.rows[0].id;
            await (0, db_1.query)(`INSERT INTO oauth_accounts (user_id, provider, provider_user_id) VALUES ($1, 'google', $2)`, [userId, payload.sub]);
        }
        else {
            userId = userRes.rows[0].id;
            userRole = userRes.rows[0].role;
        }
        const sessionToken = crypto_1.default.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        await (0, db_1.query)(`INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)`, [userId, sessionToken, expiresAt, ip, userAgent]);
        return { token: sessionToken, user: { id: userId, email, role: userRole } };
    }
    static async validateSession(token) {
        const res = await (0, db_1.query)(`SELECT s.user_id, u.email, r.name as role FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       JOIN roles r ON u.role_id = r.id
       WHERE s.token = $1 AND s.expires_at > NOW()`, [token]);
        if (res.rows.length === 0)
            return null;
        return res.rows[0];
    }
    static async logout(token) {
        await (0, db_1.query)(`DELETE FROM sessions WHERE token = $1`, [token]);
    }
}
exports.AuthService = AuthService;
