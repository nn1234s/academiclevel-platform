import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { invokeApp } from './_httpTestHelper.mjs';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'al-p0-01-'));
const dbPath = path.join(tmpDir, 'test.db');
process.env.DB_PATH = dbPath;
process.env.ADMIN_EMAIL = 'root-sec@academiclevel.test';
process.env.ADMIN_PASSKEY = 'Sup3rStr0ng!Key2026';
process.env.ADMIN_PASSKEY_FALLBACK = '';

const { app } = await import('../../server/server.js');
const { db } = await import('../../server/db.js');

try {
  // 1. Forged fallback token must fail with 401
  const rForged = await invokeApp(app, {
    method: 'GET',
    url: '/api/admin/learners',
    headers: { 'x-admin-token': 'adm_sess_fb_attacker123', 'x-admin-email': 'root-sec@academiclevel.test' }
  });
  assert.equal(rForged.status, 401, 'Forged adm_sess_fb_ prefix must be rejected with 401');

  // 2. Old hardcoded passkey must fail with 401
  const rLegacyKey = await invokeApp(app, {
    method: 'GET',
    url: '/api/storage',
    headers: { 'x-admin-passkey': 'AL-ADMIN-VAULT-2026', 'x-admin-email': 'admin@academiclevel.in' }
  });
  assert.equal(rLegacyKey.status, 401, 'Legacy hardcoded passkey AL-ADMIN-VAULT-2026 must be rejected with 401');

  // 3. Failed admin verify must return 401 and record security_audit_logs row cleanly
  const rBadLogin = await invokeApp(app, {
    method: 'POST',
    url: '/api/auth/admin-verify',
    body: { email: 'root-sec@academiclevel.test', passkey: 'wrong-pass' }
  });
  assert.equal(rBadLogin.status, 401, 'Invalid admin passkey must return 401');
  const failLog = db.prepare("SELECT * FROM security_audit_logs WHERE actionType = 'FAILED_ADMIN_LOGIN_CHALLENGE'").get();
  assert.ok(failLog, 'Failed admin login challenge must be recorded in security_audit_logs');

  // 4. Valid admin login returns real session token, accesses admin route, and logout revokes both Map + SQLite
  const rGoodLogin = await invokeApp(app, {
    method: 'POST',
    url: '/api/auth/admin-verify',
    body: { email: 'root-sec@academiclevel.test', passkey: 'Sup3rStr0ng!Key2026' }
  });
  assert.equal(rGoodLogin.status, 200, 'Valid configured env admin credentials must authenticate');
  const loginBody = await rGoodLogin.json();
  assert.ok(loginBody.token && !loginBody.token.startsWith('adm_sess_fb_'), 'Server must issue opaque adm_sess_ token');

  const rAdminCheck = await invokeApp(app, {
    method: 'GET',
    url: '/api/admin/learners',
    headers: { 'x-admin-token': loginBody.token, 'x-admin-email': 'root-sec@academiclevel.test' }
  });
  assert.equal(rAdminCheck.status, 200, 'Valid admin session must succeed on /admin/learners');

  const rLogout = await invokeApp(app, {
    method: 'POST',
    url: '/api/auth/logout',
    headers: { 'x-admin-token': loginBody.token }
  });
  assert.equal(rLogout.status, 200);

  const rAfterLogout = await invokeApp(app, {
    method: 'GET',
    url: '/api/admin/learners',
    headers: { 'x-admin-token': loginBody.token, 'x-admin-email': 'root-sec@academiclevel.test' }
  });
  assert.equal(rAfterLogout.status, 401, 'Logged-out admin token must be revoked from memory Map AND SQLite sessions');

  // 5. Maintenance log retention check (>= 180 days per CERT-In)
  const tursoSrc = fs.readFileSync('server/tursoClient.js', 'utf8');
  assert.ok(!tursoSrc.includes("'-90 days'"), 'CERT-In mandates >= 180 days audit log retention');

  // 6. Frontend / Docker hygiene invariants
  const guardSrc = fs.readFileSync('src/core/auth/SuperAdminGuard.tsx', 'utf8');
  assert.ok(!guardSrc.includes('KNOWN_ADMIN_PASS_HASHES'), 'Client SuperAdminGuard must not embed admin password hashes');
  assert.ok(!guardSrc.includes('adm_sess_fb_'), 'Client SuperAdminGuard must not mint fallback admin tokens');

  const rlsSrc = fs.readFileSync('src/core/storage/StorageRLSLayer.ts', 'utf8');
  assert.ok(!rlsSrc.includes('AL-ADMIN-VAULT-2026'), 'Client StorageRLSLayer must not embed hardcoded admin passkey');

  const dockerIgnore = fs.readFileSync('.dockerignore', 'utf8');
  assert.ok(dockerIgnore.includes('.env') && dockerIgnore.includes('*.db'), '.dockerignore must exclude .env and SQLite databases');

  console.log('ALL REM-P0-01 CHECKS PASSED');
} finally {
  try { db.close(); } catch {}
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
