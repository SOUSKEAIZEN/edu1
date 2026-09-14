"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const rbac_1 = require("../middleware/rbac");
const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    return res;
};
(0, node_test_1.test)('Security - RBAC Enforcement (Student Accessing Mentor Route)', (t) => {
    const req = { user: { role: 'STUDENT' } };
    const res = mockRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    const middleware = (0, rbac_1.requireRole)(['MENTOR', 'ADMIN']);
    middleware(req, res, next);
    node_assert_1.default.strictEqual(nextCalled, false);
    node_assert_1.default.strictEqual(res.statusCode, 403);
    node_assert_1.default.strictEqual(res.data.error, 'Forbidden');
});
(0, node_test_1.test)('Security - RBAC Enforcement (Admin Accessing Mentor Route)', (t) => {
    const req = { user: { role: 'ADMIN' } };
    const res = mockRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    const middleware = (0, rbac_1.requireRole)(['MENTOR', 'ADMIN']);
    middleware(req, res, next);
    node_assert_1.default.strictEqual(nextCalled, true);
    node_assert_1.default.strictEqual(res.statusCode, undefined);
});
