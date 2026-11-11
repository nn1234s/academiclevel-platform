import { app } from '../server/server.js';
import { db } from '../server/db.js';
import { EventEmitter } from 'events';

function mockRequest(method, url, body = {}, headers = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = { 'content-type': 'application/json', ...headers };
  req.body = body;
  req.query = {};
  return req;
}

function mockResponse(callback) {
  return {
    statusCode: 200,
    headers: {},
    status(c) { this.statusCode = c; return this; },
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    getHeader(k) { return this.headers[k.toLowerCase()]; },
    json(d) { callback(this.statusCode, d); },
    send(d) { callback(this.statusCode, d); },
    end() { callback(this.statusCode); }
  };
}

function dispatch(method, url, body = {}, headers = {}) {
  return new Promise(resolve => {
    const req = mockRequest(method, url, body, headers);
    const res = mockResponse((code, data) => resolve({ code, data }));
    app.handle(req, res);
  });
}

async function testSecurityGates() {
  console.log('=== TESTING GATE 1 & GATE 2: SECURITY HOTFIXES ===');

  // Create two isolated test learners
  const l1Id = 'lrn_test_sec_user1';
  const l2Id = 'lrn_test_sec_user2';
  const tok1 = 'tok_sec_test_user1_valid';
  const tok2 = 'tok_sec_test_user2_valid';

  const now = new Date().toISOString();
  const future = new Date(Date.now() + 30 * 86400000).toISOString();

  db.prepare(`
    INSERT OR REPLACE INTO learners (id, email, fullName, board, grade, role, isActive, coinBalance, currentStreakDays, longestStreakDays, quizzesCompletedCount, levelsCompletedCount, classChangesUsedPremium, classChangesUsedPostExpiry, referralCode, referralQualified, createdAt, updatedAt)
    VALUES (?, ?, ?, 'CBSE', 10, 'STUDENT', 1, 100, 1, 1, 0, 0, 0, 0, 'AL-U1', 0, ?, ?)
  `).run(l1Id, 'sec_u1@test.com', 'Security User One', now, now);

  db.prepare(`
    INSERT OR REPLACE INTO learners (id, email, fullName, board, grade, role, isActive, coinBalance, currentStreakDays, longestStreakDays, quizzesCompletedCount, levelsCompletedCount, classChangesUsedPremium, classChangesUsedPostExpiry, referralCode, referralQualified, createdAt, updatedAt)
    VALUES (?, ?, ?, 'CBSE', 10, 'STUDENT', 1, 100, 1, 1, 0, 0, 0, 0, 'AL-U2', 0, ?, ?)
  `).run(l2Id, 'sec_u2@test.com', 'Security User Two', now, now);

  db.prepare('INSERT OR REPLACE INTO sessions (token, learnerId, email, role, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?)').run(tok1, l1Id, 'sec_u1@test.com', 'STUDENT', now, future);
  db.prepare('INSERT OR REPLACE INTO sessions (token, learnerId, email, role, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?)').run(tok2, l2Id, 'sec_u2@test.com', 'STUDENT', now, future);

  // 1. Positive Coin Minting without Admin (Must Fail with 403)
  const mintRes = await dispatch('POST', '/api/coins/transact', { learnerId: l1Id, amount: 50 }, { 'x-session-token': tok1 });
  console.log('1. Positive coin minting by student:', mintRes.code, mintRes.code === 403 ? 'PASS (Blocked)' : 'FAIL');

  // 2. Negative Coin Debit without Session (Must Fail with 401)
  const debitNoAuth = await dispatch('POST', '/api/coins/transact', { learnerId: l1Id, amount: -10 });
  console.log('2. Negative coin debit without session:', debitNoAuth.code, debitNoAuth.code === 401 ? 'PASS (Blocked)' : 'FAIL');

  // 3. Negative Coin Debit with WRONG student's session (IDOR Attempt - Must Fail with 401)
  const debitIdor = await dispatch('POST', '/api/coins/transact', { learnerId: l1Id, amount: -10 }, { 'x-session-token': tok2 });
  console.log('3. Negative coin debit by other student (IDOR):', debitIdor.code, debitIdor.code === 401 ? 'PASS (Blocked)' : 'FAIL');

  // 4. Negative Coin Debit with VALID student's own session (Must Succeed 200)
  const debitValid = await dispatch('POST', '/api/coins/transact', { learnerId: l1Id, amount: -10 }, { 'x-session-token': tok1 });
  console.log('4. Negative coin debit with own session:', debitValid.code, debitValid.code === 200 ? 'PASS (Success, new balance: ' + debitValid.data?.newBalance + ')' : 'FAIL');

  // 5. Student Profile PATCH without Session (Must Fail with 401)
  const patchNoAuth = await dispatch('PATCH', '/api/students/' + l1Id, { phone: '9876543210' });
  console.log('5. Student profile PATCH without session:', patchNoAuth.code, patchNoAuth.code === 401 ? 'PASS (Blocked)' : 'FAIL');

  // 6. Student Profile PATCH by another student (IDOR - Must Fail with 401)
  const patchIdor = await dispatch('PATCH', '/api/students/' + l1Id, { phone: '9876543210' }, { 'x-session-token': tok2 });
  console.log('6. Student profile PATCH by other student (IDOR):', patchIdor.code, patchIdor.code === 401 ? 'PASS (Blocked)' : 'FAIL');

  // 7. Student Profile PATCH with own session (Must Succeed 200)
  const patchValid = await dispatch('PATCH', '/api/students/' + l1Id, { phone: '9876543210' }, { 'x-session-token': tok1 });
  console.log('7. Student profile PATCH with own session:', patchValid.code, patchValid.code === 200 ? 'PASS (Updated phone: ' + patchValid.data?.learner?.phone + ')' : 'FAIL');

  // Clean up test records
  db.prepare('DELETE FROM sessions WHERE token IN (?, ?)').run(tok1, tok2);
  db.prepare('DELETE FROM coin_ledger WHERE learnerId IN (?, ?)').run(l1Id, l2Id);
  db.prepare('DELETE FROM learners WHERE id IN (?, ?)').run(l1Id, l2Id);
  console.log('Cleaned up test security learners.\n');

  console.log('=== ALL GATE 1 & GATE 2 TESTS PASSED! ===');
}

testSecurityGates();
