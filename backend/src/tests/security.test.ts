import { test, mock } from 'node:test';
import assert from 'node:assert';
import { requireRole } from '../middleware/rbac';

const mockRes = () => {
  const res: any = {};
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (data: any) => { res.data = data; return res; };
  return res;
};

test('Security - RBAC Enforcement (Student Accessing Mentor Route)', (t) => {
  const req = { user: { role: 'STUDENT' } } as any;
  const res = mockRes();
  
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  const middleware = requireRole(['MENTOR', 'ADMIN']);
  middleware(req, res, next);

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.data.error, 'Forbidden');
});

test('Security - RBAC Enforcement (Admin Accessing Mentor Route)', (t) => {
  const req = { user: { role: 'ADMIN' } } as any;
  const res = mockRes();
  
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  const middleware = requireRole(['MENTOR', 'ADMIN']);
  middleware(req, res, next);

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(res.statusCode, undefined);
});
