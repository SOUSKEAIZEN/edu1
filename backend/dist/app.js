"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = require("./middleware/logger");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const mentor_routes_1 = __importDefault(require("./routes/mentor.routes"));
const academic_routes_1 = __importDefault(require("./routes/academic.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const risk_routes_1 = __importDefault(require("./routes/risk.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security middlewares
app.use(logger_1.loggerMiddleware);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/student', student_routes_1.default);
app.use('/api/mentor', mentor_routes_1.default);
app.use('/api/academic', academic_routes_1.default);
app.use('/api', analytics_routes_1.default);
app.use('/api', risk_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = app;
// Demo RBAC routes
const auth_1 = require("./middleware/auth");
const rbac_1 = require("./middleware/rbac");
app.get('/api/student-data', auth_1.authMiddleware, (0, rbac_1.requireRole)(['STUDENT']), (req, res) => {
    res.json({ message: 'Student data accessed' });
});
app.get('/api/mentor-data', auth_1.authMiddleware, (0, rbac_1.requireRole)(['MENTOR']), (req, res) => {
    res.json({ message: 'Mentor data accessed' });
});
app.get('/api/admin-data', auth_1.authMiddleware, (0, rbac_1.requireRole)(['ADMIN']), (req, res) => {
    res.json({ message: 'Admin data accessed' });
});
