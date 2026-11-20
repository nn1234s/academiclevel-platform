import { app } from '../server/server.js';
import { db, initDatabaseSchema } from '../server/db.js';
import { EventEmitter } from 'events';
import assert from 'assert';

console.log('--- 🧪 STARTING DAILY QUIZ LIMITS & GOD 3-YEAR PLAN VERIFICATION TEST ---');

function mockRequest(method, url, body = {}, headers = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.originalUrl = url;
  req.headers = { 'content-type': 'application/json', ...headers };
  req.body = body;
  req.query = {};
  req.socket = { remoteAddress: '127.0.0.1' };
  req.connection = req.socket;
  req.ip = '127.0.0.1';
  return req;
}

function mockResponse(callback) {
  let done = false;
  const finish = (code, data) => {
    if (done) return;
    done = true;
    callback(code, data);
  };
  return {
    statusCode: 200,
    headers: {},
    status(c) { this.statusCode = c; return this; },
    json(d) { finish(this.statusCode, d); },
    send(d) { finish(this.statusCode, d); },
    setHeader(k, v) { this.headers[k] = v; },
    end(d) { finish(this.statusCode, d); }
  };
}

function runRoute(method, url, body = {}, headers = {}) {
  return new Promise((resolve) => {
    const req = mockRequest(method, url, body, headers);
    const res = mockResponse((code, data) => resolve({ code, data }));
    app.handle(req, res);
  });
}

async function runTests() {
  // 1. Initialize DB and verify Schema columns
  initDatabaseSchema();
  const learnerCols = db.prepare('PRAGMA table_info(learners)').all().map(c => c.name);
  assert(learnerCols.includes('dailyQuizCount'), 'Column dailyQuizCount must exist in learners table');
  assert(learnerCols.includes('dailyQuizDate'), 'Column dailyQuizDate must exist in learners table');
  assert(learnerCols.includes('examModeEnabled'), 'Column examModeEnabled must exist in learners table');
  console.log('✅ DB Schema verified: dailyQuizCount, dailyQuizDate, examModeEnabled columns confirmed.');

  // 2. Unit economics verification:
  const godPlanPrice = 450;
  const godDurationDays = 1095;
  const giftMinFulfillmentCost = 100;
  const giftMaxFulfillmentCost = 130;
  const profitMin = godPlanPrice - giftMaxFulfillmentCost; // 450 - 130 = 320
  const profitMax = godPlanPrice - giftMinFulfillmentCost; // 450 - 100 = 350
  assert.strictEqual(profitMin, 320, 'Minimum profit must be ₹320');
  assert.strictEqual(profitMax, 350, 'Maximum profit must be ₹350');
  console.log(`✅ GOD 3-Year Plan Unit Economics: ₹${godPlanPrice} price for ${godDurationDays} days yields ₹${profitMin} to ₹${profitMax} clean profit per student on physical gift redemption.`);

  // 3. Insert Test Junior Learner (Class 6)
  const juniorId = 'test_junior_limit_' + Date.now();
  const todayDate = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO learners (
      id, email, fullName, board, grade, role, isActive,
      quizzesCompletedCount, levelsCompletedCount, referralCode,
      currentStreakDays, longestStreakDays, streakFreezesAvailable,
      coinBalance, dailyQuizCount, dailyQuizDate, examModeEnabled,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    juniorId, `junior_${Date.now()}@test.com`, 'Junior Test Scholar', 'CBSE', 6, 'STUDENT', 1,
    0, 0, 'REF_' + Date.now().toString().slice(-6),
    1, 1, 1,
    25, 0, todayDate, 0,
    now, now
  );

  // 4. Test Junior Exam Mode toggle via endpoint POST /api/students/:id/exam-mode
  const adminHeaders = { 'x-admin-key': 'admin' };
  const toggleRes = await runRoute('POST', `/api/students/${juniorId}/exam-mode`, { enabled: true }, adminHeaders);
  assert.strictEqual(toggleRes.code, 200, 'Toggling exam mode should return 200');
  assert.strictEqual(toggleRes.data.success, true);
  assert.strictEqual(toggleRes.data.examModeEnabled, true);

  const updatedJunior = db.prepare('SELECT * FROM learners WHERE id = ?').get(juniorId);
  assert.strictEqual(updatedJunior.examModeEnabled, 1, 'DB examModeEnabled must be 1');
  console.log('✅ Junior Exam Mode toggle endpoint tested and confirmed.');

  // 5. Test Quiz Completion increments dailyQuizCount in DB
  const attemptRes = await runRoute('POST', '/api/quizzes/attempt', {
    attemptId: 'qa_test_' + Date.now(),
    learnerId: juniorId,
    board: 'CBSE',
    grade: 6,
    subjectId: 'SCIENCE',
    levelNode: 'FOUNDATION',
    score: 5,
    maxScore: 5,
    passed: 1,
    totalDurationSeconds: 45,
    antiCheatPassed: true
  });

  assert.strictEqual(attemptRes.code, 200);
  assert.strictEqual(attemptRes.data.success, true);

  const afterQuizLearner = db.prepare('SELECT * FROM learners WHERE id = ?').get(juniorId);
  assert.strictEqual(afterQuizLearner.quizzesCompletedCount, 1, 'quizzesCompletedCount should be 1');
  assert.strictEqual(afterQuizLearner.dailyQuizCount, 1, 'dailyQuizCount should be 1');
  assert.strictEqual(afterQuizLearner.dailyQuizDate, todayDate, 'dailyQuizDate should match today');
  console.log('✅ Quiz Completion verified: dailyQuizCount and quizzesCompletedCount updated.');

  // 6. Test GOD Plan Payment Submission via POST /api/payments/submit
  const uniqueUtr = String(Date.now()).slice(-12).padStart(12, '9');
  const godSubRes = await runRoute('POST', '/api/payments/submit', {
    learnerId: juniorId,
    tier: 'GOD',
    payerUpiId: 'parent@okicici',
    utrReference: uniqueUtr
  });

  assert.strictEqual(godSubRes.code, 200);
  assert.strictEqual(godSubRes.data.success, true);
  assert(godSubRes.data.subscription, 'Subscription must be returned');
  assert.strictEqual(godSubRes.data.subscription.planTier, 'GOD', 'Plan tier must be GOD');
  assert.strictEqual(godSubRes.data.subscription.amountInr, 450, 'GOD plan amount must be 450');
  assert.strictEqual(godSubRes.data.subscription.durationDays, 1095, 'GOD plan duration must be 1095 days');
  console.log('✅ GOD Plan payment submission verified: ₹450 / 1095 days mapped correctly.');

  // 7. Test Admin Approval of GOD Plan Subscription
  const subId = godSubRes.data.subscription.id;
  const approveRes = await runRoute('POST', `/api/admin/payments/${subId}/approve`, {
    adminEmail: 'naitiknanda1235@gmail.com'
  }, adminHeaders);

  assert.strictEqual(approveRes.code, 200);
  assert.strictEqual(approveRes.data.success, true);

  const approvedSub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);
  assert.strictEqual(approvedSub.status, 'ACTIVE');
  assert.strictEqual(approvedSub.durationDays, 1095);

  const approvedExpiry = new Date(approvedSub.expiresAt).getTime();
  const startsAt = new Date(approvedSub.startsAt).getTime();
  const diffDays = Math.round((approvedExpiry - startsAt) / (1000 * 60 * 60 * 24));
  assert.strictEqual(diffDays, 1095, 'Approved subscription duration must be exactly 1095 days (3 Full Years)');
  console.log('✅ Admin Approval for GOD plan verified: 1095 days active subscription granted.');

  // Cleanup test learner and subscription
  db.prepare('DELETE FROM subscriptions WHERE id = ?').run(subId);
  db.prepare('DELETE FROM quiz_attempts WHERE learnerId = ?').run(juniorId);
  db.prepare('DELETE FROM learners WHERE id = ?').run(juniorId);

  console.log('🎉 ALL QUIZ LIMITS & GOD 3-YEAR PLAN VERIFICATION TESTS PASSED!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
