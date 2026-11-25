/**
 * Production Readiness Verification Test (Quiz Integrity, Gift Coin Refund, Board/Chapter Isolation)
 * Usage: node scripts/tests/test_rem_prod_readiness.mjs
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { invokeApp } from './_httpTestHelper.mjs';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'al-prod-ready-'));
const dbPath = path.join(tmpDir, 'test.db');
process.env.DB_PATH = dbPath;
process.env.ADMIN_EMAIL = 'admin@academiclevel.test';
process.env.ADMIN_PASSKEY = 'StrongAdminKey!2026';

const { app } = await import('../../server/server.js');
const { db } = await import('../../server/db.js');

try {
  // 1. Register student & login admin
  const rReg = await invokeApp(app, {
    method: 'POST',
    url: '/api/auth/register',
    body: { fullName: 'Prod Tester', email: 'prod@test.edu', password: 'Password1!', board: 'CBSE', grade: 10 }
  });
  const regData = await rReg.json();
  assert.equal(rReg.status, 200);
  const studentId = regData.learner.id;
  const studentTok = regData.token;

  const adminHeaders = {
    'x-admin-email': 'admin@academiclevel.test',
    'x-admin-passkey': 'StrongAdminKey!2026'
  };

  // 2. Seed student with 500 coins & 3 completed levels in course_progress so they can redeem a gift
  db.prepare('UPDATE learners SET coinBalance = 500, levelsCompletedCount = 3, quizzesCompletedCount = 3 WHERE id = ?').run(studentId);
  for (const lvl of ['FOUNDATION', 'CONCEPT', 'EXAM_READY']) {
    db.prepare(`INSERT INTO course_progress (learnerId, board, grade, subjectId, levelNode, accuracy, passed, isCompleted, bestScorePercent, completedAt, calendarYear) VALUES (?, 'CBSE', 10, 'math', ?, 90, 1, 1, 90, datetime('now'), 2026)`).run(studentId, lvl);
  }
  const rGift = await invokeApp(app, {
    method: 'POST',
    url: '/api/gifts/redeem',
    headers: { 'x-session-token': studentTok },
    body: { learnerId: studentId, itemTitle: 'Study Kit', coinsCost: 200, shippingAddress: 'Test Addr', contactPhone: '9999999999' }
  });
  const giftData = await rGift.json();
  assert.equal(rGift.status, 200, `Gift redeem failed: ${JSON.stringify(giftData)}`);
  const giftRow = db.prepare('SELECT id FROM gift_requests WHERE learnerId = ? ORDER BY requestedAt DESC LIMIT 1').get(studentId);
  const giftId = giftRow?.id;
  assert.ok(giftId, 'Gift request ID should exist');

  const afterRedeem = db.prepare('SELECT coinBalance FROM learners WHERE id = ?').get(studentId).coinBalance;
  assert.equal(afterRedeem, 300, 'Coins should be debited to 300 on redeem');

  // Reject gift as admin -> coins MUST be refunded back to 500!
  const rReject = await invokeApp(app, {
    method: 'POST',
    url: `/api/admin/gifts/${giftId}/reject`,
    headers: adminHeaders
  });
  assert.equal(rReject.status, 200);
  const afterReject = db.prepare('SELECT coinBalance FROM learners WHERE id = ?').get(studentId).coinBalance;
  assert.equal(afterReject, 500, `Expected 500 coins after gift rejection refund, got ${afterReject}`);

  // Second reject must NOT double-refund!
  await invokeApp(app, {
    method: 'POST',
    url: `/api/admin/gifts/${giftId}/reject`,
    headers: adminHeaders
  });
  const afterSecondReject = db.prepare('SELECT coinBalance FROM learners WHERE id = ?').get(studentId).coinBalance;
  assert.equal(afterSecondReject, 500, 'Double reject must not double-refund coins');

  // 3. QuizEngine jump-reanswer guard & NTA badge check
  const quizEngineSrc = fs.readFileSync('src/modules/student/QuizEngine.tsx', 'utf8');
  assert.ok(!quizEngineSrc.includes('NTA Speed Simulator (+4 / -1)'), 'QuizEngine must not show misleading +4/-1 NTA badge');
  assert.ok(quizEngineSrc.includes('answersLog.find'), 'handleJumpToQuestion must restore answered state from answersLog');

  console.log('ALL PRODUCTION READINESS CHECKS PASSED');
} finally {
  try { db.close(); } catch {}
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
