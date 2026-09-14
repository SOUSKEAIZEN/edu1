import { test } from 'node:test';
import assert from 'node:assert';
import { requireRole } from '../middleware/rbac';

test('requireRole middleware', (t) => {
  const middleware = requireRole(['MENTOR', 'ADMIN']);
  
  let statusCode = 0;
  let jsonCalled = false;
  
  const mockRes = {
    status: (code: number) => { statusCode = code; return mockRes; },
    json: (data: any) => { jsonCalled = true; }
  } as any;
  
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };

  // 1. Missing user
  middleware({} as any, mockRes, mockNext);
  assert.strictEqual(statusCode, 401);
  assert.strictEqual(nextCalled, false);

  // 2. Unauthorized role
  middleware({ user: { role: 'STUDENT' } } as any, mockRes, mockNext);
  assert.strictEqual(statusCode, 403);
  assert.strictEqual(nextCalled, false);

  // 3. Authorized role
  middleware({ user: { role: 'MENTOR' } } as any, mockRes, mockNext);
  assert.strictEqual(nextCalled, true);
});
