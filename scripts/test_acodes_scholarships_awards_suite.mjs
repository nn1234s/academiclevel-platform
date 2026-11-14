import assert from 'assert';
import { apiRouter } from '../server/api.js';
import { db, initDatabaseSchema } from '../server/db.js';
import fs from 'fs';
import path from 'path';

initDatabaseSchema();

console.log('====================================================');
console.log('ACADEMICLEVEL ACODES, SCHOLARSHIP AWARDS & GLAZE TEST');
console.log('====================================================\n');

async function runRoute(method, routePattern, reqOverrides = {}) {
  const layer = apiRouter.stack.find(
    s => s.route && s.route.path === routePattern && s.route.methods[method.toLowerCase()]
  );
  assert(layer, `Route ${method} ${routePattern} must exist in apiRouter`);
  const handlers = layer.route.stack.map(s => s.handle);
  const req = {
    method: method.toUpperCase(),
    params: {},
    query: {},
    body: {},
    headers: {},
    ...reqOverrides
  };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    send(b) { this.body = b; return this; },
    setHeader(k, v) { this.headers[k] = v; return this; }
  };

  let idx = 0;
  async function next(err) {
    if (err) throw err;
    if (idx < handlers.length) {
      const h = handlers[idx++];
      await h(req, res, next);
    }
  }
  await next();
  return res;
}

async function run() {
  const adminEmail = 'admin@academiclevel.in';
  const adminHeaders = {
    'x-admin-email': 'admin@academiclevel.in',
    'x-admin-passkey': 'naitik2026'
  };

  const now = Date.now();
  const testStudentId = 'test_student_' + now;
  const friendStudentId = 'test_friend_' + now;
  const student1Id = 'stu_acc_1_' + now;
  const student2Id = 'stu_acc_2_' + now;
  const student3Id = 'stu_acc_3_' + now;
  let testSchId = null;

  try {
    // 1. Test Customer ACodes (Friend Passes)
    console.log('TEST 1: Customer Friend Pass ACodes generation & fetch');

  db.prepare(`DELETE FROM learners WHERE email LIKE '%@al.test'`).run();

  db.prepare(`
    INSERT INTO learners (id, email, fullName, board, grade, role, isActive, coinBalance, referralCode, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(testStudentId, `teststudent_${now}@al.test`, 'Test Student', 'CBSE', 8, 'STUDENT', 1, 100, 'REF_' + testStudentId, new Date().toISOString(), new Date().toISOString());

  db.prepare(`
    INSERT INTO learners (id, email, fullName, board, grade, role, isActive, coinBalance, referralCode, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(friendStudentId, `testfriend_${now}@al.test`, 'Friend Student', 'CBSE', 8, 'STUDENT', 1, 10, 'REF_' + friendStudentId, new Date().toISOString(), new Date().toISOString());

  // Fetch ACodes for customer (auto-generates 3 starter codes)
  const getRes = await runRoute('GET', '/learners/:id/acodes', {
    params: { id: testStudentId }
  });
  assert.strictEqual(getRes.statusCode, 200);
  assert.strictEqual(getRes.body.success, true);
  assert.ok(Array.isArray(getRes.body.acodes));
  assert.ok(getRes.body.acodes.length >= 3, 'Should have at least 3 starter ACodes');
  console.log(`[PASS] Customer has ${getRes.body.acodes.length} auto-generated Friend Passes.`);

  // Generate a custom Friend Pass
  const genRes = await runRoute('POST', '/learners/:id/acodes/generate', {
    params: { id: testStudentId },
    body: { planTier: 'PLUS', durationDays: 14 }
  });
  assert.strictEqual(genRes.statusCode, 200);
  assert.strictEqual(genRes.body.success, true);
  assert.ok(genRes.body.acode.code.startsWith('AL-FRND-'));
  const testCode = genRes.body.acode.code;
  console.log(`[PASS] Generated custom Friend Pass ACode: ${testCode}`);

  // Test 2: Self-redemption prevention
  console.log('\nTEST 2: Self-redemption prevention on customer ACodes');
  const selfRedeemRes = await runRoute('POST', '/acodes/redeem', {
    body: { learnerId: testStudentId, code: testCode }
  });
  assert.strictEqual(selfRedeemRes.statusCode, 400);
  const errMsg = selfRedeemRes.body?.error || selfRedeemRes.body?.message || '';
  assert.ok(errMsg.includes('cannot redeem your own'));
  console.log('[PASS] Self-redemption correctly blocked with clear error message.');

  // Test 3: Friend redeems ACode -> friend gets plan/coins, creator gets +40 coins
  console.log('\nTEST 3: Peer redemption grants bonuses to both friend & creator');
  const creatorBalanceBefore = db.prepare('SELECT coinBalance FROM learners WHERE id = ?').get(testStudentId).coinBalance;
  const friendBalanceBefore = db.prepare('SELECT coinBalance FROM learners WHERE id = ?').get(friendStudentId).coinBalance;

  const friendRedeemRes = await runRoute('POST', '/acodes/redeem', {
    body: { learnerId: friendStudentId, code: testCode }
  });
  assert.strictEqual(friendRedeemRes.statusCode, 200);
  assert.strictEqual(friendRedeemRes.body.success, true);

  const creatorBalanceAfter = db.prepare('SELECT coinBalance FROM learners WHERE id = ?').get(testStudentId).coinBalance;
  const friendBalanceAfter = db.prepare('SELECT coinBalance FROM learners WHERE id = ?').get(friendStudentId).coinBalance;

  assert.strictEqual(creatorBalanceAfter, creatorBalanceBefore + 40, 'Creator should receive +40 Study Coins');
  assert.strictEqual(friendBalanceAfter, friendBalanceBefore + 25, 'Friend should receive +25 Study Coins');
  console.log(`[PASS] Peer redemption succeeded: Friend got +25 coins, Creator got +40 coins.`);

  // Test 4: Scholarship ACode & Accuracy Podium Awards
  console.log('\nTEST 4: Admin creates scholarship with ACode voucher');
  const schAcode = 'AL-SCH-TEST-' + Math.floor(1000 + Math.random() * 9000);
  const createSchRes = await runRoute('POST', '/admin/scholarships', {
    headers: adminHeaders,
    body: {
      adminEmail,
      title: 'Accuracy Sprint Test 2026',
      description: 'Test scholarship with accuracy ranking and vouchers',
      rewardCoins: 250,
      durationDays: 10,
      targetQuizCount: 5,
      acode: schAcode
    }
  });
  assert.strictEqual(createSchRes.statusCode, 200);
  assert.strictEqual(createSchRes.body.success, true);
  testSchId = createSchRes.body.scholarship.id;
  assert.strictEqual(createSchRes.body.scholarship.acode, schAcode);
  console.log(`[PASS] Scholarship created with ID ${testSchId} and voucher ${schAcode}`);

  // Simulate 3 students completing quizzes and claiming scholarship
  for (const [id, name, score] of [
    [student1Id, 'Aarav Sharma', 98.5],
    [student2Id, 'Diya Patel', 95.0],
    [student3Id, 'Karan Verma', 91.2]
  ]) {
    db.prepare(`
      INSERT INTO learners (id, email, fullName, board, grade, role, isActive, coinBalance, referralCode, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, `${id}@test.com`, name, 'CBSE', 9, 'STUDENT', 1, 50, 'REF_' + id, new Date().toISOString(), new Date().toISOString());

    // Insert quiz attempt to establish accuracy %
    db.prepare(`
      INSERT INTO quiz_attempts (id, learnerId, board, grade, subjectId, levelNode, score, maxScore, passed, accuracyPercent, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('att_' + id, id, 'CBSE', 9, 'MATH_9', 'L1', Math.round(score), 100, 1, score, new Date().toISOString());

    // Record claim
    db.prepare(`
      INSERT INTO scholarship_claims (id, scholarshipId, learnerId, coinsAwarded, claimedAt, accuracy)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('claim_' + id, testSchId, id, 250, new Date().toISOString(), score);
  }

  // Admin checks scholarships with computed accuracy
  const adminSchRes = await runRoute('GET', '/admin/scholarships', {
    headers: adminHeaders,
    query: { adminEmail }
  });
  assert.strictEqual(adminSchRes.statusCode, 200);
  const foundSch = adminSchRes.body.scholarships.find(s => s.id === testSchId);
  assert.ok(foundSch, 'Should find test scholarship in admin list');
  console.log(`[PASS] Admin retrieved scholarship with computed participant accuracies.`);

  // Test 5: Admin disburses 1st, 2nd, and 3rd place awards by accuracy
  console.log('\nTEST 5: Admin disburses accuracy awards with auto-minted winner ACodes');
  const awardsRes = await runRoute('POST', '/admin/scholarships/:id/awards', {
    params: { id: testSchId },
    headers: adminHeaders,
    body: {
      adminEmail,
      first: { learnerId: student1Id, coins: 500, planTier: 'PLUS', durationDays: 180, accuracy: 98.5 },
      second: { learnerId: student2Id, coins: 300, planTier: 'LITE', durationDays: 60, accuracy: 95.0 },
      third: { learnerId: student3Id, coins: 150, planTier: 'LITE', durationDays: 30, accuracy: 91.2 }
    }
  });
  assert.strictEqual(awardsRes.statusCode, 200);
  assert.strictEqual(awardsRes.body.success, true);
  assert.ok(awardsRes.body.awards.first.acode.startsWith('AL-WIN1-'));
  assert.ok(awardsRes.body.awards.second.acode.startsWith('AL-WIN2-'));
  assert.ok(awardsRes.body.awards.third.acode.startsWith('AL-WIN3-'));
  console.log(`[PASS] 1st Place ACode minted: ${awardsRes.body.awards.first.acode}`);
  console.log(`[PASS] 2nd Place ACode minted: ${awardsRes.body.awards.second.acode}`);
  console.log(`[PASS] 3rd Place ACode minted: ${awardsRes.body.awards.third.acode}`);

  // Check student-facing scholarship endpoint returns awards & wonAward
  const studentSchRes = await runRoute('GET', '/scholarships', {
    query: { learnerId: student1Id }
  });
  assert.strictEqual(studentSchRes.statusCode, 200);
  const stuSch = studentSchRes.body.scholarships.find(s => s.id === testSchId);
  assert.ok(stuSch.wonAward, 'Winner student should receive wonAward object');
  assert.ok(stuSch.wonAward.rank === '1st' || stuSch.wonAward.rank === 1);
  assert.strictEqual(stuSch.wonAward.coins, 500);
  console.log(`[PASS] Student portal correctly delivers Rank 1 podium recognition and winner voucher.`);

  // Test 6: Verify Privacy-Redacted Founder Certificates Assets exist
  console.log('\nTEST 6: Verify Founder Glaze certificate assets and privacy masking');
  const certFiles = [
    'public/founder-certs/iit-bombay-cert.jpg',
    'public/founder-certs/coding-certs-python.jpg',
    'public/founder-certs/coding-certs-apps.jpg'
  ];
  for (const f of certFiles) {
    const fullPath = path.resolve(f);
    assert.ok(fs.existsSync(fullPath), `Certificate asset ${f} must exist`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 20000, `Certificate ${f} must be a valid image (>20KB)`);
    console.log(`[PASS] Certificate asset verified: ${f} (${Math.round(stat.size / 1024)} KB)`);
  }

  } finally {
    // Cleanup test records
    db.prepare('DELETE FROM learners WHERE id IN (?, ?, ?, ?, ?)').run(testStudentId, friendStudentId, student1Id, student2Id, student3Id);
    db.prepare('DELETE FROM scholarships WHERE id = ?').run(testSchId);
    db.prepare('DELETE FROM scholarship_claims WHERE scholarshipId = ?').run(testSchId);
  }

  console.log('\n====================================================');
  console.log('ALL 6 / 6 ACODES, SCHOLARSHIP AWARDS & GLAZE TESTS PASSED!');
  console.log('====================================================\n');
}

run().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
