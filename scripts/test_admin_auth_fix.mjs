import assert from 'node:assert';
import { db } from '../server/db.js';
import { apiRouter, isAuthorizedAdminEmail, isAuthorizedAdminPasskey } from '../server/api.js';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

const server = app.listen(3099, '127.0.0.1', async () => {
  console.log('Test server started on port 3099');
  try {
    // 1. Unit test helper functions
    assert.strictEqual(isAuthorizedAdminEmail('naitiknanda1235@gmail.com'), true, 'Founder email must be authorized');
    assert.strictEqual(isAuthorizedAdminEmail('admin@academiclevel.in'), true, 'Default admin email must be authorized');
    assert.strictEqual(isAuthorizedAdminEmail('random@stranger.com'), false, 'Stranger email must NOT be authorized');

    assert.strictEqual(isAuthorizedAdminPasskey('naitik2026'), true, 'Primary passkey must be authorized');
    assert.strictEqual(isAuthorizedAdminPasskey('vault99'), true, 'Vault passkey must be authorized');
    assert.strictEqual(isAuthorizedAdminPasskey('wrongpassword123'), false, 'Wrong passkey must NOT be authorized');
    console.log('[PASS] Credential hash checks verified successfully');

    // 2. Test /api/auth/admin-verify with founder credentials
    const verifyRes = await fetch('http://localhost:3099/api/auth/admin-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'naitiknanda1235@gmail.com',
        passkey: 'naitik2026'
      })
    });
    assert.strictEqual(verifyRes.status, 200, `Admin verify should succeed (HTTP ${verifyRes.status})`);
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.success, true);
    assert.ok(verifyData.token, 'Must return a valid session token');
    const adminToken = verifyData.token;
    console.log('[PASS] /api/auth/admin-verify successful with token:', adminToken.substring(0, 16) + '...');

    // 3. Test /api/auth/login with founder email (auto-provision and authenticate)
    const loginRes = await fetch('http://localhost:3099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'naitiknanda1235@gmail.com'
      })
    });
    assert.strictEqual(loginRes.status, 200, `Student login for admin should succeed (HTTP ${loginRes.status})`);
    const loginData = await loginRes.json();
    assert.strictEqual(loginData.success, true);
    assert.strictEqual(loginData.learner.role, 'SUPER_ADMIN', 'Learner must have SUPER_ADMIN role');
    console.log('[PASS] /api/auth/login successfully recognized and auto-provisioned admin learner');

    // 4. Test admin-protected routes with the token
    const learnersRes = await fetch('http://localhost:3099/api/admin/learners', {
      headers: { 'x-admin-token': adminToken }
    });
    assert.strictEqual(learnersRes.status, 200, 'Admin learners should be accessible');
    console.log('[PASS] /api/admin/learners accessible with admin token');

    const storageRes = await fetch('http://localhost:3099/api/storage', {
      headers: { 'x-admin-token': adminToken }
    });
    assert.strictEqual(storageRes.status, 200, 'Storage dump should be accessible with admin token');
    console.log('[PASS] /api/storage accessible with admin token');

    // 5. Test invalid credentials returns 401
    const badRes = await fetch('http://localhost:3099/api/auth/admin-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'naitiknanda1235@gmail.com',
        passkey: 'incorrect_pass_999'
      })
    });
    assert.strictEqual(badRes.status, 401, 'Bad credentials should return 401');
    console.log('[PASS] Invalid credentials properly rejected with 401');

    console.log('\n=== ALL ADMIN AUTHENTICATION TESTS PASSED 100%! ===');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('TEST FAILED:', err);
    server.close();
    process.exit(1);
  }
});
