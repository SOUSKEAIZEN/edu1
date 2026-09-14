"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const rbac_1 = require("../middleware/rbac");
(0, node_test_1.test)('requireRole middleware', (t) => {
    const middleware = (0, rbac_1.requireRole)(['MENTOR', 'ADMIN']);
    let statusCode = 0;
    let jsonCalled = false;
    const mockRes = {
        status: (code) => { statusCode = code; return mockRes; },
        json: (data) => { jsonCalled = true; }
    };
    let nextCalled = false;
    const mockNext = () => { nextCalled = true; };
    // 1. Missing user
    middleware({}, mockRes, mockNext);
    node_assert_1.default.strictEqual(statusCode, 401);
    node_assert_1.default.strictEqual(nextCalled, false);
    // 2. Unauthorized role
    middleware({ user: { role: 'STUDENT' } }, mockRes, mockNext);
    node_assert_1.default.strictEqual(statusCode, 403);
    node_assert_1.default.strictEqual(nextCalled, false);
    // 3. Authorized role
    middleware({ user: { role: 'MENTOR' } }, mockRes, mockNext);
    node_assert_1.default.strictEqual(nextCalled, true);
});
