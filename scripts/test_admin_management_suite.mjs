import assert from 'assert';
import { db, initDatabaseSchema } from '../server/db.js';
import { apiRouter } from '../server/api.js';

const SUPER_ADMIN_EMAIL = 'admin@academiclevel.in';

initDatabaseSchema();

console.log('====================================================');
console.log('ACADEMICLEVEL ADMIN SUITE: DELETE & CMS AUDIT');
console.log('====================================================\n');

// Mock req and res for express router testing
function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
      return this;
    }
  };
  return res;
}

// TEST 1: Admin Delete Learner endpoint with complete database cascade
{
  const testLearnerId = 'lrn_test_deletion_' + Date.now();
  const testEmail = 'delete_me_' + Date.now() + '@temp.test';

  db.prepare(`DELETE FROM learners WHERE referralCode LIKE 'REF-DEL%'`).run();

  db.prepare(`
    INSERT INTO learners (id, email, fullName, board, grade, role, isActive, referralCode, coinBalance, quizzesCompletedCount, levelsCompletedCount, createdAt, updatedAt)
    VALUES (?, ?, 'Temporary Student', 'CBSE', 9, 'STUDENT', 1, ?, 100, 5, 1, datetime('now'), datetime('now'))
  `).run(testLearnerId, testEmail, 'REF-DEL-' + Date.now());

  db.prepare(`
    INSERT INTO subscriptions (id, learnerId, planTier, status, paymentMethod, amountInr, durationDays, startsAt, expiresAt, invoiceNumber, createdAt)
    VALUES (?, ?, 'LITE', 'ACTIVE', 'UPI_QR', 49, 60, datetime('now'), datetime('now', '+60 days'), 'INV-TEST-01', datetime('now'))
  `).run('sub_del_' + Date.now(), testLearnerId);

  db.prepare(`
    INSERT INTO coin_ledger (entryId, learnerId, amount, transactionType, reasonCode, balanceAfter, timestampUtc, signatureHash)
    VALUES (?, ?, 25, 'CREDIT', 'LEVEL_MASTERY', 125, datetime('now'), 'SIG_TEST')
  `).run('c_del_' + Date.now(), testLearnerId);

  db.prepare(`
    INSERT INTO quiz_attempts (id, learnerId, board, grade, subjectId, levelNode, score, maxScore, passed, createdAt)
    VALUES (?, ?, 'CBSE', 9, 'math', 'FOUNDATION', 5, 5, 1, datetime('now'))
  `).run('att_del_' + Date.now(), testLearnerId);

  // Invoke delete handler through express router matching
  const req = {
    method: 'DELETE',
    url: `/admin/learners/${testLearnerId}`,
    params: { id: testLearnerId },
    headers: {
      'x-admin-token': 'adm_sess_mock_valid_token',
      'x-admin-email': SUPER_ADMIN_EMAIL,
      'x-admin-passkey': 'naitik2026'
    }
  };
  const res = createMockRes();

  // Find layer handler for delete /admin/learners/:id
  const deleteRoute = apiRouter.stack.find(
    s => s.route && s.route.path === '/admin/learners/:id' && s.route.methods.delete
  );
  assert(deleteRoute, 'DELETE /admin/learners/:id endpoint must exist in apiRouter');

  // Execute middleware chain
  const handlers = deleteRoute.route.stack.map(s => s.handle);
  let idx = 0;
  function next(err) {
    if (err) throw err;
    if (idx < handlers.length) {
      const h = handlers[idx++];
      h(req, res, next);
    }
  }
  next();

  assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
  assert(res.body.success, 'Expected success: true in delete response');

  // Verify learner is purged
  const checkLearner = db.prepare('SELECT * FROM learners WHERE id = ?').get(testLearnerId);
  assert(!checkLearner, 'Learner must be purged from learners table');

  // Verify child tables purged
  const checkSubs = db.prepare('SELECT * FROM subscriptions WHERE learnerId = ?').all(testLearnerId);
  assert.strictEqual(checkSubs.length, 0, 'Subscriptions must be cascaded');

  const checkLedger = db.prepare('SELECT * FROM coin_ledger WHERE learnerId = ?').all(testLearnerId);
  assert.strictEqual(checkLedger.length, 0, 'Coin ledger entries must be cascaded');

  const checkAttempts = db.prepare('SELECT * FROM quiz_attempts WHERE learnerId = ?').all(testLearnerId);
  assert.strictEqual(checkAttempts.length, 0, 'Quiz attempts must be cascaded');

  // Verify audit log
  const audit = db.prepare(`SELECT * FROM security_audit_logs WHERE targetId = ? AND actionType = 'DELETE_LEARNER'`).get(testLearnerId);
  assert(audit, 'Security audit log must be recorded for DELETE_LEARNER');

  console.log('[PASS] Test 1: Admin DELETE /admin/learners/:id purges learner, cascades child records, and writes security audit log');
}

// TEST 2: GET /config/public returns full dynamic platform configuration
{
  const route = apiRouter.stack.find(
    s => s.route && s.route.path === '/config/public' && s.route.methods.get
  );
  assert(route, 'GET /config/public endpoint must exist in apiRouter');

  const req = { method: 'GET', url: '/config/public', headers: {} };
  const res = createMockRes();

  const handlers = route.route.stack.map(s => s.handle);
  let idx = 0;
  function next() {
    if (idx < handlers.length) handlers[idx++](req, res, next);
  }
  next();

  assert.strictEqual(res.statusCode, 200);
  assert(res.body.success, 'Expected success: true');
  assert(res.body.config, 'Expected config object');
  assert(res.body.config.pricing, 'Expected pricing in config');
  assert(res.body.config.home, 'Expected home in config');
  assert(res.body.config.legal, 'Expected legal in config');
  assert(res.body.config.ads, 'Expected ads in config');

  assert.strictEqual(res.body.config.pricing.litePriceInr, 49);
  assert.strictEqual(res.body.config.pricing.plusPriceInr, 129);
  assert.strictEqual(res.body.config.ads.offerPriceInr, 49);

  console.log('[PASS] Test 2: GET /config/public returns complete pricing, home, legal, and ads configuration');
}

// TEST 3: Admin update & retrieve Pricing settings
{
  const route = apiRouter.stack.find(
    s => s.route && s.route.path === '/admin/settings/:group' && s.route.methods.post
  );
  assert(route, 'POST /admin/settings/:group endpoint must exist');

  const req = {
    method: 'POST',
    url: '/admin/settings/pricing',
    params: { group: 'pricing' },
    body: {
      litePriceInr: 59,
      liteDurationDays: 60,
      plusPriceInr: 149,
      plusDurationDays: 180,
      upiVpa: 'updatedvpa@okicici',
      merchantName: 'Updated Merchant'
    },
    headers: {
      'x-admin-passkey': 'naitik2026',
      'x-admin-email': SUPER_ADMIN_EMAIL
    }
  };
  const res = createMockRes();

  const handlers = route.route.stack.map(s => s.handle);
  let idx = 0;
  function next() {
    if (idx < handlers.length) handlers[idx++](req, res, next);
  }
  next();

  assert.strictEqual(res.statusCode, 200);
  assert(res.body.success);
  assert.strictEqual(res.body.data.litePriceInr, 59);
  assert.strictEqual(res.body.data.plusPriceInr, 149);

  // Verify persistence in system_settings table
  const row = db.prepare(`SELECT value FROM system_settings WHERE key = 'cfg_pricing'`).get();
  assert(row, 'system_settings must contain cfg_pricing');
  const parsed = JSON.parse(row.value);
  assert.strictEqual(parsed.litePriceInr, 59);
  assert.strictEqual(parsed.plusPriceInr, 149);

  // Restore defaults
  db.prepare(`DELETE FROM system_settings WHERE key = 'cfg_pricing'`).run();
  console.log('[PASS] Test 3: Admin POST /admin/settings/pricing updates and persists custom pricing & UPI');
}

// TEST 4: Admin update & retrieve Home Page & Legal/Privacy CMS settings
{
  const route = apiRouter.stack.find(
    s => s.route && s.route.path === '/admin/settings/:group' && s.route.methods.post
  );

  // Home update
  const homeReq = {
    method: 'POST',
    url: '/admin/settings/home',
    params: { group: 'home' },
    body: {
      heroTitle: 'Custom Hero Title for Exams',
      heroSubtitle: 'Personalized Socratic AI Tutoring for India',
      announcementActive: true,
      announcementText: 'Special Weekend Olympiad Challenge Live!'
    },
    headers: { 'x-admin-passkey': 'naitik2026', 'x-admin-email': SUPER_ADMIN_EMAIL }
  };
  const homeRes = createMockRes();
  const handlers = route.route.stack.map(s => s.handle);
  let idx = 0;
  function nextHome() { if (idx < handlers.length) handlers[idx++](homeReq, homeRes, nextHome); }
  nextHome();

  assert.strictEqual(homeRes.statusCode, 200);
  assert.strictEqual(homeRes.body.data.heroTitle, 'Custom Hero Title for Exams');

  // Legal update
  const legalReq = {
    method: 'POST',
    url: '/admin/settings/legal',
    params: { group: 'legal' },
    body: {
      contactEmail: 'grievance@academiclevel.in',
      privacyPolicyHeading: 'Updated Data Protection Charter',
      privacySummary: 'Strict Zero-Tracker Policy for all enrolled scholars.'
    },
    headers: { 'x-admin-passkey': 'naitik2026', 'x-admin-email': SUPER_ADMIN_EMAIL }
  };
  const legalRes = createMockRes();
  idx = 0;
  function nextLegal() { if (idx < handlers.length) handlers[idx++](legalReq, legalRes, nextLegal); }
  nextLegal();

  assert.strictEqual(legalRes.statusCode, 200);
  assert.strictEqual(legalRes.body.data.contactEmail, 'grievance@academiclevel.in');

  // Clean up
  db.prepare(`DELETE FROM system_settings WHERE key = 'cfg_home'`).run();
  db.prepare(`DELETE FROM system_settings WHERE key = 'cfg_legal'`).run();
  console.log('[PASS] Test 4: Admin POST /admin/settings/home and legal updates and persists Home & Privacy Policy');
}

// TEST 5: Admin update & retrieve Ads Pages & Funnels settings
{
  const route = apiRouter.stack.find(
    s => s.route && s.route.path === '/admin/settings/:group' && s.route.methods.post
  );

  const adsReq = {
    method: 'POST',
    url: '/admin/settings/ads',
    params: { group: 'ads' },
    body: {
      mainHeading: 'Crack Class 10 Boards with 98%+',
      offerPriceInr: 49,
      discountPercent: 95,
      urgentNotice: '⚡ FLASH SALE: Final 5 spots remaining!'
    },
    headers: { 'x-admin-passkey': 'naitik2026', 'x-admin-email': SUPER_ADMIN_EMAIL }
  };
  const adsRes = createMockRes();
  const handlers = route.route.stack.map(s => s.handle);
  let idx = 0;
  function nextAds() { if (idx < handlers.length) handlers[idx++](adsReq, adsRes, nextAds); }
  nextAds();

  assert.strictEqual(adsRes.statusCode, 200);
  assert.strictEqual(adsRes.body.data.mainHeading, 'Crack Class 10 Boards with 98%+');
  assert.strictEqual(adsRes.body.data.urgentNotice, '⚡ FLASH SALE: Final 5 spots remaining!');

  // Clean up
  db.prepare(`DELETE FROM system_settings WHERE key = 'cfg_ads'`).run();
  console.log('[PASS] Test 5: Admin POST /admin/settings/ads updates and persists Ad Funnels & conversion copy');
}

console.log('\n====================================================');
console.log('RESULTS: ALL 5 / 5 ADMIN TESTS PASSED PERFECTLY');
console.log('====================================================');
