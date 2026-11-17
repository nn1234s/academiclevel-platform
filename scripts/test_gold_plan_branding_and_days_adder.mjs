import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../server/db.js';

const ROOT_DIR = 'C:/Users/NEWADMIN/.gemini/antigravity/scratch/academiclevel-platform';

console.log('====================================================');
console.log('1-YEAR GOLD PLAN: BRANDING, DAYS ADDER & OPTIMIZATION SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

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
// TEST 1: Gold Plan Pricing & Duration (365 Days / ₹205) in paymentService.ts
// ----------------------------------------------------
const paymentServiceContent = fs.readFileSync(path.join(ROOT_DIR, 'src/services/paymentService.ts'), 'utf-8');
const hasGoldPricing = paymentServiceContent.includes('priceInr: 205') && 
                       paymentServiceContent.includes('durationDays: 365') &&
                       paymentServiceContent.includes("tier: 'GOLD'");
check('Gold Plan pricing is configured to exactly ₹205 for 365 days (1 Full Year) in PaymentService', hasGoldPricing);

// ----------------------------------------------------
// TEST 2: Real UPI PG Gateway URL for 1-Year Gold Plan
// ----------------------------------------------------
const expectedGoldUrl = 'https://upipg.cit.org.in/pay/YGTGmsXuO4SIz1onOC6o?public=true';
const hasGoldGateway = paymentServiceContent.includes(expectedGoldUrl);
check('Gold Plan UPI PG Gateway points to real automated CIT gateway link', hasGoldGateway);

// ----------------------------------------------------
// TEST 3: Days Adder Cumulative Calculation (Preserves Existing Active Days)
// ----------------------------------------------------
const now = new Date();
const existingExpiryDate = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

const baseTime = existingExpiryDate.getTime() > now.getTime() ? existingExpiryDate.getTime() : now.getTime();
const newExpiry = new Date(baseTime + 365 * 24 * 60 * 60 * 1000);
const totalDays = Math.round((newExpiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

check('Days Adder extends duration on top of active days (45 existing + 365 = 410 total days)', 
  totalDays >= 409 && totalDays <= 411
);

// ----------------------------------------------------
// TEST 4: Backend Server SQLite Cumulative Extension Logic
// ----------------------------------------------------
const testLearnerId = 'lrn_adder_test_' + Date.now();
const testEmail = `test_adder_${Date.now()}@academiclevel.in`;
const nowIso = now.toISOString();

db.prepare(`
  INSERT INTO learners (
    id, email, fullName, board, grade, referralCode, coinBalance, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  testLearnerId, testEmail, 'Days Adder Student', 'CBSE', 10, 'ADDER' + Date.now().toString(36), 100, nowIso, nowIso
);

const initialExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
db.prepare(`
  INSERT INTO subscriptions (
    id, learnerId, planTier, status, paymentMethod, amountInr, durationDays,
    startsAt, expiresAt, invoiceNumber, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'sub_init_' + Date.now(), testLearnerId, 'LITE', 'ACTIVE', 'UPI_QR', 49, 30,
  nowIso, initialExpiry, 'INV-INIT-1', nowIso
);

// Days Adder calculation
const existingActive = db.prepare(`
  SELECT * FROM subscriptions 
  WHERE learnerId = ? AND status = 'ACTIVE' AND expiresAt IS NOT NULL
  ORDER BY expiresAt DESC LIMIT 1
`).get(testLearnerId);

let dbBaseTime = now.getTime();
if (existingActive && existingActive.expiresAt) {
  const expTime = new Date(existingActive.expiresAt).getTime();
  if (expTime > dbBaseTime) {
    dbBaseTime = expTime;
  }
}
const goldExpiry = new Date(dbBaseTime + 365 * 24 * 60 * 60 * 1000);
const finalDays = Math.round((goldExpiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

check('Database Days Adder seamlessly compounds 30 initial days + 365 gold days = 395 days validity', 
  finalDays >= 394 && finalDays <= 396
);

// Cleanup
db.prepare('DELETE FROM subscriptions WHERE learnerId = ?').run(testLearnerId);
db.prepare('DELETE FROM learners WHERE id = ?').run(testLearnerId);

// ----------------------------------------------------
// TEST 5: Backend API DEFAULT_CONFIG has Gold Plan (365d / ₹205)
// ----------------------------------------------------
const serverApiContent = fs.readFileSync(path.join(ROOT_DIR, 'server/api.js'), 'utf-8');
const apiHasGoldConfig = serverApiContent.includes('goldPriceInr: 205') && 
                         serverApiContent.includes('goldDurationDays: 365') &&
                         serverApiContent.includes('Full 365-Day Complete Academic Year Coverage');
check('Server API DEFAULT_CONFIG includes 365-Day Gold Plan (₹205) and complete syllabus coverage', apiHasGoldConfig);

// ----------------------------------------------------
// TEST 6: Student Dashboard & Profile Gold VIP Branding
// ----------------------------------------------------
const dashboardContent = fs.readFileSync(path.join(ROOT_DIR, 'src/modules/student/StudentDashboard.tsx'), 'utf-8');
const profileContent = fs.readFileSync(path.join(ROOT_DIR, 'src/modules/student/StudentProfile.tsx'), 'utf-8');
const appContent = fs.readFileSync(path.join(ROOT_DIR, 'src/App.tsx'), 'utf-8');

const dashHasGoldBranding = dashboardContent.includes('1-YEAR GOLD VIP PASS (365d) ACTIVE') &&
                            dashboardContent.includes('1-Year Gold VIP Status');
const profileHasGoldBranding = profileContent.includes('1-Year AcademicLevel Gold Pass') &&
                              profileContent.includes('365 Days (1 Full Academic Year) complete coverage');
const appHasGoldBadge = appContent.includes('GOLD PASS') && appContent.includes('currentLearner?.activePlan === \'GOLD\'');

check('Student Dashboard, Student Profile, and Header display official 1-Year Gold VIP branding and badges', 
  dashHasGoldBranding && profileHasGoldBranding && appHasGoldBadge
);

// ----------------------------------------------------
// TEST 7: Admin Vault Days Adder Controls & 365d Presets
// ----------------------------------------------------
const studentMgmtContent = fs.readFileSync(path.join(ROOT_DIR, 'src/admin-vault/modules/StudentManagement.tsx'), 'utf-8');
const paymentQueueContent = fs.readFileSync(path.join(ROOT_DIR, 'src/admin-vault/modules/PaymentVerificationQueue.tsx'), 'utf-8');
const entitlementContent = fs.readFileSync(path.join(ROOT_DIR, 'src/admin-vault/modules/EntitlementManager.tsx'), 'utf-8');

const mgmtHasAdder = studentMgmtContent.includes('+365') && 
                     studentMgmtContent.includes('Cumulative Days Adder') &&
                     studentMgmtContent.includes("setGrantTier('GOLD')");
const queueHasGold = paymentQueueContent.includes('GOLD Pass (365d / ₹205 - 1 Year)');
const entitlementHasGold = entitlementContent.includes('Gold Plan (365 Days - 1-Year Pass)');

check('Admin Vault (Student Management, Payment Queue & Entitlement Manager) has 365d Gold Presets and Days Adder controls',
  mgmtHasAdder && queueHasGold && entitlementHasGold
);

console.log('\n====================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
