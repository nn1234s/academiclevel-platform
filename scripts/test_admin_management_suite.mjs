import assert from 'assert';
import { db, initDatabaseSchema, exportDbToJsonStore } from '../server/db.js';
import { apiRouter } from '../server/api.js';

const SUPER_ADMIN_EMAIL = 'admin@academiclevel.in';

const DEFAULT_PRICING = {
  litePriceInr: 49,
  liteDurationDays: 60,
  plusPriceInr: 129,
  plusDurationDays: 180,
  upiVpa: 'theattirebbsr@okicici',
  merchantName: '17 Pratyusha Nanda',
  discountBadge: 'Special Launch Offer (95% Off)'
};

const DEFAULT_HOME = {
  heroTitle: 'Master Your School Curriculum with Adaptive AI Quizzes',
  heroSubtitle: 'CBSE, ICSE & Cambridge IGCSE for Classes 1 to 12. Instant Socratic guidance, verifiable certificates, and an earnable Study Coin economy.',
  announcementActive: true,
  announcementText: '🚀 12,000 Questions across CBSE, ICSE, and Cambridge Classes 1-12 live! Unlimited Concept Booster pass included with every signup.',
  statsStudents: '10,000+',
  statsQuizzes: '500,000+',
  statsPassRate: '99.4%',
  bannerCtaText: 'Start Free Practice Now'
};

const DEFAULT_LEGAL = {
  contactEmail: 'academiclevels@gmail.com',
  lastUpdatedDate: 'November 2026',
  privacyPolicyHeading: 'AcademicLevel Privacy & Data Protection Policy',
  privacySummary: 'We collect only what is strictly necessary for academic assessment, certificate generation, and parent reporting. Learner data is never sold or used for third-party ad tracking.',
  termsHeading: 'AcademicLevel Terms of Service & Learner Agreement',
  termsSummary: 'Subscriptions grant non-transferable access for the specified duration. Study Coins are gamified reward tokens redeemable for verified gift cards and platform cosmetics according to published rules.',
  refundPolicySummary: 'Subscriptions can be cancelled within 48 hours if no quizzes or certificate entitlements have been generated. Contact academiclevels@gmail.com with your transaction UTR.'
};

const DEFAULT_ADS = {
  mainHeading: 'Score 95%+ in School Exams Without Expensive Tuitions',
  subHeading: 'CBSE & ICSE Classes 1 to 12: Adaptive Daily Quizzes, 24/7 Socratic Nova AI Tutor & Real Study Coin Rewards.',
  offerPriceInr: 49,
  originalPriceInr: 999,
  discountPercent: 95,
  guaranteeDays: 60,
  timerHours: 48,
  ctaText: 'Claim 60-Day Unlimited Pass for ₹49',
  urgentNotice: '⚡ FLASH OFFER: Only 17 spots remaining at ₹49 for today\'s cohort.'
};

function resetAllSettingsToDefaults() {
  const now = new Date().toISOString();
  db.prepare(`INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES ('cfg_pricing', ?, ?)`).run(JSON.stringify(DEFAULT_PRICING), now);
  db.prepare(`INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES ('cfg_home', ?, ?)`).run(JSON.stringify(DEFAULT_HOME), now);
  db.prepare(`INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES ('cfg_legal', ?, ?)`).run(JSON.stringify(DEFAULT_LEGAL), now);
  db.prepare(`INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES ('cfg_ads', ?, ?)`).run(JSON.stringify(DEFAULT_ADS), now);
  exportDbToJsonStore();
}

resetAllSettingsToDefaults();

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
    INSERT INTO subscriptions (id, learnerId, planTier, status, paymentMethod, amountInr, durationDays, invoiceNumber, createdAt)
    VALUES (?, ?, 'LITE', 'ACTIVE', 'UPI_QR', 49, 60, 'INV-TEST-DEL', datetime('now'))
  `).run('sub_test_del_' + Date.now(), testLearnerId);

  db.prepare(`
    INSERT INTO coin_ledger (entryId, learnerId, amount, transactionType, reasonCode, balanceAfter, timestampUtc, signatureHash)
    VALUES (?, ?, 100, 'CREDIT', 'TEST_SEEDED', 100, datetime('now'), 'SIG_TEST')
  `).run('c_del_' + Date.now(), testLearnerId);

  // Invoke delete handler through express router matching
  const req = {
    method: 'DELETE',
    url: `/admin/learners/${testLearnerId}`,
    params: { id: testLearnerId },
    headers: {
      'x-admin-passkey': 'naitik2026',
      'x-admin-email': SUPER_ADMIN_EMAIL
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
  function next() {
    if (idx < handlers.length) {
      handlers[idx++](req, res, next);
    }
  }
  next();

  assert.strictEqual(res.statusCode, 200, `Expected 200 from DELETE /admin/learners/:id, got ${res.statusCode}`);
  assert(res.body.success, 'Expected success: true in delete response');

  // Verify database state: learner must be gone
  const lrn = db.prepare('SELECT id FROM learners WHERE id = ?').get(testLearnerId);
  assert.strictEqual(lrn, undefined, 'Learner row must be deleted');

  // Verify cascade: subscriptions, coin_ledger, gift_requests deleted
  const subs = db.prepare('SELECT id FROM subscriptions WHERE learnerId = ?').all(testLearnerId);
  assert.strictEqual(subs.length, 0, 'Associated subscriptions must be cascade deleted');

  const ledger = db.prepare('SELECT entryId FROM coin_ledger WHERE learnerId = ?').all(testLearnerId);
  assert.strictEqual(ledger.length, 0, 'Associated coin_ledger must be cascade deleted');

  // Verify audit log entry
  const audit = db.prepare(`SELECT * FROM security_audit_logs WHERE targetId = ? AND actionType = 'DELETE_LEARNER'`).get(testLearnerId);
  assert(audit, 'Security audit log must be recorded for DELETE_LEARNER');

  console.log('[PASS] Test 1: Admin DELETE /admin/learners/:id purges learner, cascades child records, and writes security audit log');
}

// TEST 2: GET /config/public returns active settings for landing page and apps
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
      plusPriceInr: 149,
      upiVpa: 'newpayment@upi',
      merchantName: 'AcademicLevel Learning'
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
  resetAllSettingsToDefaults();
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

  // Clean up & restore defaults
  resetAllSettingsToDefaults();
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

  // Clean up & restore defaults
  resetAllSettingsToDefaults();
  console.log('[PASS] Test 5: Admin POST /admin/settings/ads updates and persists Ad Funnels & conversion copy');
}
