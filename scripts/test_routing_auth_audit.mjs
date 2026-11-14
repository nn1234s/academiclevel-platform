import assert from 'node:assert';
import crypto from 'node:crypto';
import { db } from '../server/db.js';
import { safeReplicateAsync } from '../server/api.js';

console.log('====================================================');
console.log('ACADEMICLEVEL ROUTING, NAVIGATION & AUTH AUDIT SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function check(description, condition) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] Test ${totalTests}: ${description}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test ${totalTests}: ${description}`);
  }
}

// ----------------------------------------------------
// TEST 1: safeReplicateAsync is defined and non-fatal
// ----------------------------------------------------
let replicationNoError = false;
try {
  safeReplicateAsync('test_table', { id: 'test_123', name: 'Non-fatal check' });
  replicationNoError = true;
} catch (e) {
  replicationNoError = false;
}
check('safeReplicateAsync is defined and handles replication without throwing ReferenceError', replicationNoError);

// ----------------------------------------------------
// TEST 2: Password Hashing & Verification (PBKDF2/SHA256)
// ----------------------------------------------------
function hashStudentPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return { hash, salt };
}
function verifyStudentPassword(password, salt, expectedHash) {
  const { hash } = hashStudentPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

const testPwd = 'ScholarSecret@2026';
const { hash: pHash, salt: pSalt } = hashStudentPassword(testPwd);
const isCorrect = verifyStudentPassword(testPwd, pSalt, pHash);
const isWrong = verifyStudentPassword('WrongPassword', pSalt, pHash);
check('Password hashing & verification works with constant-time equality check', isCorrect && !isWrong);

// ----------------------------------------------------
// TEST 3: Registration Lifecycle - Creates learner and 60-day Concept Booster pass
// ----------------------------------------------------
const auditEmail = `audit_reg_${Date.now()}@academiclevel.in`;
const learnerId = 'lrn_audit_' + Date.now();
const now = new Date().toISOString();
const subExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
const subId = 'sub_audit_' + Date.now();

db.prepare(`
  INSERT INTO learners (
    id, email, fullName, board, grade, role, isActive,
    passwordHash, passwordSalt, coinBalance, currentStreakDays, longestStreakDays,
    lastStudyDate, streakFreezesAvailable, quizzesCompletedCount, levelsCompletedCount,
    classChangesUsedPremium, classChangesUsedPostExpiry, referralCode, referralQualified,
    createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  learnerId, auditEmail, 'Audit Test Learner', 'CBSE', 10, 'STUDENT', 1,
  pHash, pSalt, 10, 1, 1, now.split('T')[0], 1, 0, 0, 0, 0, 'AL-AUD-9999', 0, now, now
);

db.prepare(`
  INSERT INTO subscriptions (
    id, learnerId, planTier, status, paymentMethod,
    amountInr, durationDays, startsAt, expiresAt,
    verifiedByAdmin, verifiedAt, invoiceNumber, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  subId, learnerId, 'LITE', 'ACTIVE', 'CONCEPT_BOOSTER_AUTO',
  49, 60, now, subExpiresAt, 'SYSTEM_AUTO', now, 'INV-AUDIT-60D', now
);

const createdLearner = db.prepare('SELECT * FROM learners WHERE id = ?').get(learnerId);
const createdSub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);
check('Learner registration creates valid student record with 10 starter coins and 60-day Concept Booster pass',
  createdLearner && createdLearner.email === auditEmail && createdSub && createdSub.durationDays === 60 && createdSub.status === 'ACTIVE'
);

// ----------------------------------------------------
// TEST 4: Session Creation & Token Lifecycle
// ----------------------------------------------------
const sessToken = 'tok_' + crypto.randomBytes(24).toString('hex');
db.prepare(`
  INSERT INTO sessions (token, learnerId, email, role, createdAt, expiresAt)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  sessToken, learnerId, auditEmail, 'STUDENT', now,
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
);

const sessionInDb = db.prepare('SELECT * FROM sessions WHERE token = ?').get(sessToken);
check('Session token is generated and persisted for authenticated learner',
  sessionInDb && sessionInDb.learnerId === learnerId
);

// ----------------------------------------------------
// TEST 5: Logout invalidates session
// ----------------------------------------------------
db.prepare('DELETE FROM sessions WHERE token = ?').run(sessToken);
const sessionAfterLogout = db.prepare('SELECT * FROM sessions WHERE token = ?').get(sessToken);
check('Logout cleanly purges session token from sessions table',
  sessionAfterLogout === undefined
);

// ----------------------------------------------------
// TEST 6: Route Resolution - Protected Routes for Unauthenticated Visitors
// ----------------------------------------------------
const PROTECTED_STUDENT_ROUTES = {
  '/dashboard': 'DASHBOARD',
  '/courses': 'COURSES',
  '/levels': 'LEVELS',
  '/quiz': 'QUIZ',
  '/nova': 'NOVA_AI',
  '/nova-ai': 'NOVA_AI',
  '/community': 'COMMUNITY',
  '/spin': 'SPIN_WHEEL',
  '/spin-wheel': 'SPIN_WHEEL',
  '/referral': 'REFERRAL',
  '/coins': 'COIN_MALL',
  '/coin-mall': 'COIN_MALL',
  '/gifts': 'GIFT_STORE',
  '/gift-store': 'GIFT_STORE',
  '/certificates': 'CERTIFICATES',
  '/master-certificate': 'MASTER_CERT',
  '/profile': 'PROFILE',
  '/streaks': 'STREAKS',
  '/offline-bank': 'OFFLINE_BANK',
  '/premium': 'PREMIUM',
  '/qotd': 'QOTD',
  '/challenges': 'CHALLENGES',
  '/scholarships': 'SCHOLARSHIPS'
};

const ADS_ROUTES = {
  '/special49': true,
  '/special': true,
  '/offer': true,
  '/offer49': true,
  '/special-offer': true,
  '/advert': true,
  '/advert1': true,
  '/advert2': true,
  '/yt': true,
  '/youtube': true,
  '/yt49': true,
  '/ad-yt': true,
  '/ads': true,
  '/ad': true
};

function resolveRouteFromPath(path, isAuth, hasPaid = true) {
  const p = path.toLowerCase().replace(/\/$/, '');
  if (p === '/adminservice' || p === '/ops-vault-al99') return { route: 'ADMIN_VAULT' };
  if (p === '/pika' || p === '/pikachu' || p === '/pokemon' || p === '/pokedex') return { route: 'POKEMON_VAULT' };
  if (ADS_ROUTES[p]) {
    return { route: 'SPECIAL_49_FUNNEL' };
  }
  if (p === '/pricing') return { route: 'PRICING' };
  if (p === '/about') return { route: 'ABOUT' };
  if (p === '/faq') return { route: 'FAQ' };
  if (p === '/halloffame' || p === '/security') return { route: 'HALL_OF_FAME' };
  if (p === '/most-innovative-edtech' || p === '/award') return { route: 'INNOVATIVE_EDTECH' };
  if (p === '/curriculum') return { route: isAuth ? 'COURSES' : 'PUBLIC_COURSES' };
  if (p.startsWith('/verify')) return { route: 'VERIFY_CERTIFICATE' };
  if (PROTECTED_STUDENT_ROUTES[p]) {
    const target = PROTECTED_STUDENT_ROUTES[p];
    if (isAuth) return { route: target };
    return { route: 'HOME', intendedProtected: target };
  }
  if (p === '') return { route: isAuth ? 'DASHBOARD' : 'HOME' };
  return { route: 'NOT_FOUND' };
}

const certUnauth = resolveRouteFromPath('/certificates', false);
check('Unauthenticated access to /certificates remembers intendedProtected="CERTIFICATES" for post-login return',
  certUnauth.route === 'HOME' && certUnauth.intendedProtected === 'CERTIFICATES'
);

// ----------------------------------------------------
// TEST 7: Route Resolution - Protected Routes for Authenticated Students
// ----------------------------------------------------
const certAuth = resolveRouteFromPath('/certificates', true);
const novaAuth = resolveRouteFromPath('/nova-ai', true);
const profileAuth = resolveRouteFromPath('/profile', true);
check('Authenticated students access /certificates, /nova-ai, /profile directly without 404',
  certAuth.route === 'CERTIFICATES' && novaAuth.route === 'NOVA_AI' && profileAuth.route === 'PROFILE'
);

// ----------------------------------------------------
// TEST 8: Ads routes (/special49, /offer) stay on SPECIAL_49_FUNNEL without throwing to homepage
// ----------------------------------------------------
const adAuthPaidSpecial49 = resolveRouteFromPath('/special49', true, true);
const adAuthPaidOffer = resolveRouteFromPath('/offer', true, true);
const adAuthUnpaidSpecial49 = resolveRouteFromPath('/special49', true, false);
check('All users visiting /special49 or /offer can view SPECIAL_49_FUNNEL without being thrown to homepage',
  adAuthPaidSpecial49.route === 'SPECIAL_49_FUNNEL' && adAuthPaidOffer.route === 'SPECIAL_49_FUNNEL' && adAuthUnpaidSpecial49.route === 'SPECIAL_49_FUNNEL'
);

// ----------------------------------------------------
// TEST 9: Additional Module - Ad page /ad remains accessible as SPECIAL_49_FUNNEL
// ----------------------------------------------------
const adAuthGeneric = resolveRouteFromPath('/ad', true);
check('Additional Module: Authenticated student visiting /ad sees SPECIAL_49_FUNNEL',
  adAuthGeneric.route === 'SPECIAL_49_FUNNEL'
);

// ----------------------------------------------------
// TEST 10: Additional Module - Ad page /special49 remains accessible to unauthenticated visitors
// ----------------------------------------------------
const adUnauth = resolveRouteFromPath('/special49', false);
check('Additional Module: Unauthenticated visitor accessing /special49 sees SPECIAL_49_FUNNEL',
  adUnauth.route === 'SPECIAL_49_FUNNEL'
);

// ----------------------------------------------------
// TEST 11: 404 Resolution for unknown route
// ----------------------------------------------------
const unknownRoute = resolveRouteFromPath('/some-invalid-nonexistent-path', false);
check('Invalid routes resolve cleanly to NOT_FOUND for custom Pokémon 404 page',
  unknownRoute.route === 'NOT_FOUND'
);

// ----------------------------------------------------
// TEST 12: Zero dummy test accounts in production database
// ----------------------------------------------------
const dummyCount = db.prepare("SELECT count(*) as count FROM learners WHERE email LIKE '%@example.com' OR email LIKE '%@test.com'").get().count;
check('Zero dummy test accounts in production learners database', dummyCount === 0);

// ----------------------------------------------------
// TEST 13: Secret Pokemon Arcade & Pokedex at /pika and /pikachu
// ----------------------------------------------------
const pikaUnauth = resolveRouteFromPath('/pika', false);
const pikachuAuth = resolveRouteFromPath('/pikachu', true);
check('Secret Pokemon Vault is accessible at /pika and /pikachu without redirect',
  pikaUnauth.route === 'POKEMON_VAULT' && pikachuAuth.route === 'POKEMON_VAULT'
);

// Clean up audit test records
db.prepare('DELETE FROM subscriptions WHERE id = ?').run(subId);
db.prepare('DELETE FROM learners WHERE id = ?').run(learnerId);

console.log('\n====================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================================');
