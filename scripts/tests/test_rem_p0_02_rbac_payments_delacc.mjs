import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { invokeApp } from './_httpTestHelper.mjs';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'al-p0-02-'));
process.env.DB_PATH = path.join(tmpDir, 'test.db');
process.env.ADMIN_EMAIL = 'root-sec@academiclevel.test';
process.env.ADMIN_PASSKEY = 'Sup3rStr0ng!Key2026';

const { app } = await import('../../server/server.js');
const { db } = await import('../../server/db.js');

try {
  // Register Student A & Student B cleanly
  const regA = await invokeApp(app, {
    method: 'POST',
    url: '/api/auth/register',
    body: {
      fullName: 'Student Alpha',
      email: 'alpha@test.edu',
      password: 'Password123!',
      board: 'CBSE',
      grade: 8,
      role: 'TEACHER', // Attempt privilege escalation!
      planTier: 'GOLD' // Attempt free GOLD activation on register!
    }
  });
  assert.equal(regA.status, 200);
  const bodyA = await regA.json();
  assert.equal(bodyA.learner.role, 'STUDENT', 'Register must reject/ignore client TEACHER role escalation');
  assert.equal(bodyA.learner.hasActiveSubscription, false, 'Register must NOT grant unverified active GOLD subscription');

  const regB = await invokeApp(app, {
    method: 'POST',
    url: '/api/auth/register',
    body: {
      fullName: 'Student Beta',
      email: 'beta@test.edu',
      password: 'Password456!',
      board: 'ICSE',
      grade: 8,
      parentPin: '8492'
    }
  });
  const bodyB = await regB.json();
  const idA = bodyA.learner.id;
  const tokA = bodyA.token;
  const idB = bodyB.learner.id;

  // 1. Unauthenticated / cross-tenant GET /students/:id must fail 401/403
  const rUnauthStudent = await invokeApp(app, { method: 'GET', url: `/api/students/${idB}` });
  assert.ok([401, 403].includes(rUnauthStudent.status), `GET /students/:id unauthenticated must fail 401/403, got ${rUnauthStudent.status}`);

  const rCrossStudent = await invokeApp(app, {
    method: 'GET',
    url: `/api/students/${idB}`,
    headers: { 'x-session-token': tokA }
  });
  assert.ok([401, 403].includes(rCrossStudent.status), `Student A reading Student B must fail 401/403, got ${rCrossStudent.status}`);

  // Own read must NOT leak parentPin / passwordHash / passwordSalt
  const rOwnStudent = await invokeApp(app, {
    method: 'GET',
    url: `/api/students/${idA}`,
    headers: { 'x-session-token': tokA }
  });
  assert.equal(rOwnStudent.status, 200);
  const ownBody = await rOwnStudent.json();
  assert.equal(ownBody.learner.parentPin, undefined, 'parentPin must never be exposed in /students/:id DTO');

  // 2. Unauthenticated coin minting must fail 401
  const rCoinUnauth = await invokeApp(app, {
    method: 'POST',
    url: '/api/coins/transact',
    body: { learnerId: idA, amount: 60, transactionType: 'CREDIT', reasonCode: 'QUIZ_DUEL_WIN' }
  });
  assert.ok([401, 403].includes(rCoinUnauth.status), `Unauthenticated /coins/transact must fail 401/403, got ${rCoinUnauth.status}`);

  // 3. Student redeeming gift cannot bypass 3-level milestone via client levelsCount
  const rGiftBypass = await invokeApp(app, {
    method: 'POST',
    url: '/api/gifts/redeem',
    headers: { 'x-session-token': tokA },
    body: { learnerId: idA, itemTitle: 'Test Gift', coinsCost: 100, levelsCount: 99, quizzesCount: 99, shippingAddress: 'Addr', contactPhone: '9999999999' }
  });
  assert.equal(rGiftBypass.status, 400, 'Gift redeem must reject insufficient DB balance/milestone even if client sends levelsCount=99');

  // 4. Unauthenticated /payments/activate-gateway must fail 401
  const rPayBypass = await invokeApp(app, {
    method: 'POST',
    url: '/api/payments/activate-gateway',
    body: { learnerId: idA, tier: 'GOLD' }
  });
  assert.equal(rPayBypass.status, 401, 'Unauthenticated activate-gateway must be rejected with 401');

  // 5. Public account deletion MUST NOT purge Student B without verified password or PIN
  const rDelAttack = await invokeApp(app, {
    method: 'POST',
    url: '/api/public/request-account-deletion',
    body: { emailOrPhone: 'beta@test.edu' }
  });
  assert.equal(rDelAttack.status, 401, 'Public deletion without password/PIN must be rejected (401) and NOT purge Student B');
  const stillExists = db.prepare('SELECT id FROM learners WHERE id = ?').get(idB);
  assert.ok(stillExists, 'Student B must remain in DB after unauthenticated deletion attempt');

  // 6. School pack endpoint must require authentication & valid verification (no free TEACHER escalation)
  const rSchoolBypass = await invokeApp(app, {
    method: 'POST',
    url: '/api/school/activate-pack',
    headers: { 'x-session-token': tokA },
    body: { teacherId: idA, packType: 'LITE_40' }
  });
  assert.ok(rSchoolBypass.status >= 400, 'Unverified /school/activate-pack must fail >= 400 without valid verified UTR/admin approval');

  // 7. Mailbox cross-tenant read/send must fail
  const rMailboxCross = await invokeApp(app, {
    method: 'GET',
    url: `/api/mailbox?learnerId=${idB}`,
    headers: { 'x-session-token': tokA }
  });
  assert.ok([401, 403].includes(rMailboxCross.status), 'Cross-tenant mailbox read must fail 401/403');

  // 8. Client hygiene checks
  const quotaSrc = fs.readFileSync('src/services/quotaService.ts', 'utf8');
  assert.ok(!quotaSrc.includes('prabir' + '2gmailc') && !quotaSrc.includes('98614' + '39460'), 'QuotaService must not hardcode personal bypasses');
  const referralSrc = fs.readFileSync('src/modules/student/ReferralProgramme.tsx', 'utf8');
  assert.ok(!referralSrc.includes('getAllLearnersAdmin(SUPER_ADMIN_EMAIL)'), 'ReferralProgramme must not use SUPER_ADMIN_EMAIL bypass');

  console.log('ALL REM-P0-02 CHECKS PASSED');
} finally {
  try { db.close(); } catch {}
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
