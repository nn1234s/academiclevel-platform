import { UTRValidator } from './core/security/utrValidator.ts';
import { PIIFirewall } from './core/security/piiFirewall.ts';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from './core/storage/StorageRLSLayer.ts';
import { PaymentService } from './services/paymentService.ts';
import { CoinLedgerService } from './services/coinLedgerService.ts';
import { QuotaService } from './services/quotaService.ts';
import { CertificateService } from './services/certificateService.ts';
import { Learner, Grade } from './core/types/index.ts';

/**
 * AcademicLevel Automated Enterprise E2E Verification Suite (v2.15.1s)
 * Validates all security kernels, invariants, quotas, and business rules.
 */
async function runVerificationSuite() {
  console.log('================================================================');
  console.log('🚀 RUNNING ACADEMICLEVEL ENTERPRISE VERIFICATION AUDIT');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}: ${detail || 'Assertion failed'}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: UTR 12-Digit Numeric Constraint & Deduplication Check
  // -------------------------------------------------------------
  console.log('\n--- 1. UTR VALIDATION & REPLAY FRAUD PREVENTION ---');
  const validUtr = '987654321098';
  const invalidShort = '12345';
  const invalidAlpha = '98765432109A';

  assert(UTRValidator.validateFormat(validUtr).isValid === true, '12-digit numeric UTR accepted');
  assert(UTRValidator.validateFormat(invalidShort).isValid === false, 'Short UTR (< 12 digits) rejected');
  assert(UTRValidator.validateFormat(invalidAlpha).isValid === false, 'Non-numeric UTR rejected');

  // -------------------------------------------------------------
  // TEST 2: Student Registration & Tenant Isolation
  // -------------------------------------------------------------
  console.log('\n--- 2. TENANT ISOLATION & CLEAN SLATE CREATION ---');
  const studentA: Learner = {
    id: 'lrn_test_aarav_01',
    email: 'aarav.sharma@test.edu',
    fullName: 'Aarav Sharma',
    board: 'CBSE',
    grade: 10,
    role: 'STUDENT',
    isActive: true,
    createdAt: new Date().toISOString(),
    quizzesCompletedCount: 0,
    levelsCompletedCount: 0,
    classChangesUsedPremium: 0,
    classChangesUsedPostExpiry: 0,
    referralCode: 'AL-AARAV101',
    referralQualified: false,
    currentStreakDays: 1,
    longestStreakDays: 1,
    streakFreezesAvailable: 0,
    coinBalance: 0
  };

  const studentB: Learner = {
    id: 'lrn_test_diya_02',
    email: 'diya.sen@test.edu',
    fullName: 'Diya Sen',
    board: 'ICSE',
    grade: 10,
    role: 'STUDENT',
    isActive: true,
    createdAt: new Date().toISOString(),
    quizzesCompletedCount: 0,
    levelsCompletedCount: 0,
    classChangesUsedPremium: 0,
    classChangesUsedPostExpiry: 0,
    referralCode: 'AL-DIYA202',
    referredBy: studentA.id, // Referred by Aarav
    referralQualified: false,
    currentStreakDays: 1,
    longestStreakDays: 1,
    streakFreezesAvailable: 0,
    coinBalance: 0
  };

  StorageRLSLayer.saveLearner(studentA, studentA.id);
  StorageRLSLayer.saveLearner(studentB, studentB.id);

  assert(StorageRLSLayer.getLearnerById(studentA.id, studentA.id)?.fullName === 'Aarav Sharma', 'Student A accesses own profile');
  assert(StorageRLSLayer.getLearnerById(studentB.id, studentA.id) === null, 'Tenant Isolation: Student A blocked from reading Student B data');

  // -------------------------------------------------------------
  // TEST 3: Super-Admin Lock & Route Clearance
  // -------------------------------------------------------------
  console.log('\n--- 3. SUPER-ADMIN LOCK & PERMISSION SHIELD ---');
  let adminBreachCaught = false;
  try {
    StorageRLSLayer.getAllLearnersAdmin('hacker@random.com');
  } catch {
    adminBreachCaught = true;
  }
  assert(adminBreachCaught, 'Super-Admin access blocked for non-superadmin email (403)');

  let adminSucceeded = false;
  try {
    const list = StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL);
    adminSucceeded = Array.isArray(list);
  } catch {
    adminSucceeded = false;
  }
  assert(adminSucceeded, `Super-Admin access granted strictly to ${SUPER_ADMIN_EMAIL}`);

  // -------------------------------------------------------------
  // TEST 4: Audited UPI Payment Submission & Duplicate Replay Block
  // -------------------------------------------------------------
  console.log('\n--- 4. AUDITED UPI PAYMENT & DUPLICATE REPLAY BLOCK ---');
  const payRes1 = await PaymentService.submitUpiPayment(studentA.id, 'PLUS', 'aarav@okhdfc', validUtr);
  assert(payRes1.success === true, 'Valid UPI payment submitted with PENDING_VERIFICATION status');
  assert(payRes1.subscription?.status === 'PENDING_VERIFICATION', 'Status initialized to PENDING_VERIFICATION (never auto-activated)');

  // Replay attempt with same UTR
  const payRes2 = await PaymentService.submitUpiPayment(studentB.id, 'LITE', 'diya@icici', validUtr);
  assert(payRes2.success === false, 'Duplicate UTR replay blocked by global uniqueness constraint');

  // Super-Admin One-Tick Approval
  if (payRes1.subscription) {
    const approveRes = await PaymentService.approvePaymentAdmin(SUPER_ADMIN_EMAIL, payRes1.subscription.id);
    assert(approveRes.success === true, 'Super-Admin successfully approved payment');
    const updatedSub = StorageRLSLayer.getSubscriptionsForLearner(studentA.id, studentA.id)[0];
    assert(updatedSub.status === 'ACTIVE', 'Subscription status atomically transitioned to ACTIVE');
  }

  // -------------------------------------------------------------
  // TEST 5: Concept Booster 60-Day Unlimited Quotas
  // -------------------------------------------------------------
  console.log('\n--- 5. 60-DAY CONCEPT BOOSTER PASS & UNLIMITED QUOTAS ---');
  // Student B receives 60 days unlimited quizzes on registration
  studentB.createdAt = new Date().toISOString();
  studentB.quizzesCompletedCount = 25;
  let qCheck = QuotaService.evaluateQuota(studentB);
  assert(qCheck.isLocked === false, 'Quota unlocked with 60-day Concept Booster pass');
  assert(qCheck.hasActiveSubscription === true, 'Concept Booster active subscription recognized');
  assert(qCheck.activePlan === 'LITE', 'Plan tier is LITE');
  assert(qCheck.daysRemaining !== undefined && qCheck.daysRemaining > 0, 'Positive days remaining');

  // Student A has active subscription -> quota unlocked
  const quotaA = QuotaService.evaluateQuota(studentA);
  assert(quotaA.hasActiveSubscription === true, 'Active Plus Plan subscription recognized');
  assert(quotaA.isLocked === false, 'Active subscription lifts all quiz quotas');

  // -------------------------------------------------------------
  // TEST 6: Append-Only Coin Ledger & Anti-Cheat
  // -------------------------------------------------------------
  console.log('\n--- 6. STUDY COIN ECONOMY & ANTI-CHEAT ---');
  // Anti-cheat fail (dwell time < 3s)
  const antiCheatFail = CoinLedgerService.awardLevelCompletionReward(
    studentA.id,
    'CBSE',
    10,
    'math',
    'FOUNDATION',
    85,
    false // anti-cheat violated
  );
  assert(antiCheatFail.awarded === false, 'Level reward rejected when anti-cheat check fails');

  // Low accuracy fail (< 70%)
  const lowAccFail = CoinLedgerService.awardLevelCompletionReward(
    studentA.id,
    'CBSE',
    10,
    'math',
    'FOUNDATION',
    65, // < 70%
    true
  );
  assert(lowAccFail.awarded === false, 'Level reward rejected when accuracy is < 70%');

  // Valid level mastery: +25 coins
  const validLevel = CoinLedgerService.awardLevelCompletionReward(
    studentA.id,
    'CBSE',
    10,
    'math',
    'FOUNDATION',
    90,
    true
  );
  assert(validLevel.awarded === true, 'Valid level mastery awarded +25 Study Coins');

  // Duplicate level mastery claim blocked
  const duplicateLevel = CoinLedgerService.awardLevelCompletionReward(
    studentA.id,
    'CBSE',
    10,
    'math',
    'FOUNDATION',
    95,
    true
  );
  assert(duplicateLevel.awarded === false, 'Duplicate level mastery reward blocked for same node');

  // -------------------------------------------------------------
  // TEST 7: Referral Qualification (+40 Coins on 1st Quiz)
  // -------------------------------------------------------------
  console.log('\n--- 7. REFERRAL QUALIFICATION (+40 COINS) ---');
  const aaravCoinsBefore = StorageRLSLayer.getLearnerById(studentA.id, studentA.id)?.coinBalance || 0;
  // Student B completes 1st quiz
  CoinLedgerService.qualifyReferralOnFirstQuiz(studentB.id);
  const aaravCoinsAfter = StorageRLSLayer.getLearnerById(studentA.id, studentA.id)?.coinBalance || 0;
  assert(aaravCoinsAfter === aaravCoinsBefore + 40, 'Referrer received +40 Coins upon referee 1st quiz completion');

  // Duplicate qualification blocked
  CoinLedgerService.qualifyReferralOnFirstQuiz(studentB.id);
  const aaravCoinsAfter2 = StorageRLSLayer.getLearnerById(studentA.id, studentA.id)?.coinBalance || 0;
  assert(aaravCoinsAfter2 === aaravCoinsAfter, 'Referral qualification does not double-credit');

  // -------------------------------------------------------------
  // TEST 8: Daily Spin Wheel & Referral-Unlocked Jackpot
  // -------------------------------------------------------------
  console.log('\n--- 8. DAILY SPIN WHEEL & 40-COIN JACKPOT ---');
  const spinCheck1 = CoinLedgerService.canSpinWheel(studentA);
  assert(spinCheck1.allowed === true, 'Initial daily spin is allowed');

  const spinRes = CoinLedgerService.executeSpin(studentA.id);
  assert(spinRes.coinsAwarded >= 2, `Daily spin completed, awarded ${spinRes.coinsAwarded} coins`);

  const studentAUpdated = StorageRLSLayer.getLearnerById(studentA.id, studentA.id)!;
  const spinCheck2 = CoinLedgerService.canSpinWheel(studentAUpdated);
  assert(spinCheck2.allowed === false, 'Subsequent spin blocked within 24h UTC cooldown window');

  // -------------------------------------------------------------
  // TEST 9: Annual Master Certificate & Deduplication
  // -------------------------------------------------------------
  console.log('\n--- 9. ANNUAL MASTER CERTIFICATE DEDUPLICATION ---');
  // Needs 3 distinct levels
  const currentYear = new Date().getFullYear();
  StorageRLSLayer.saveProgress({
    learnerId: studentA.id,
    board: 'CBSE',
    grade: 10,
    subjectId: 'science',
    levelNode: 'FOUNDATION',
    isCompleted: true,
    bestScorePercent: 90,
    coinRewardClaimed: true,
    calendarYear: currentYear
  });
  StorageRLSLayer.saveProgress({
    learnerId: studentA.id,
    board: 'CBSE',
    grade: 10,
    subjectId: 'physics',
    levelNode: 'CONCEPT',
    isCompleted: true,
    bestScorePercent: 88,
    coinRewardClaimed: true,
    calendarYear: currentYear
  });

  const masterCertRes1 = CertificateService.checkAndAwardAnnualMasterCertificate(
    studentA.id,
    studentA.fullName,
    studentA.board,
    studentA.grade
  );
  assert(masterCertRes1.awarded === true, 'Annual Master Certificate awarded upon completing 3 distinct levels in year');

  const masterCertRes2 = CertificateService.checkAndAwardAnnualMasterCertificate(
    studentA.id,
    studentA.fullName,
    studentA.board,
    studentA.grade
  );
  assert(masterCertRes2.awarded === false, 'Duplicate Annual Master Certificate blocked for same academic year');

  // -------------------------------------------------------------
  // TEST 10: StudentPacks PII & Profanity Firewall
  // -------------------------------------------------------------
  console.log('\n--- 10. STUDENTPACKS CHILD SAFETY PII FIREWALL ---');
  const safeMsg = 'Hi! What formula do we use for finding quadratic roots?';
  const phoneMsg = 'Call me at 9876543210 for homework answers!';
  const emailMsg = 'Send the answers to cheat@gmail.com please.';
  const linkMsg = 'Join my Telegram group at https://t.me/hackers for leaks.';

  assert(PIIFirewall.scan(safeMsg).isSafe === true, 'Educational academic message is accepted as safe');
  assert(PIIFirewall.scan(phoneMsg).isSafe === false, 'Phone number detected and blocked by firewall');
  assert(PIIFirewall.scan(emailMsg).isSafe === false, 'Email address detected and blocked by firewall');
  assert(PIIFirewall.scan(linkMsg).isSafe === false, 'External invite link detected and blocked by firewall');

  console.log('\n================================================================');
  console.log(`🎯 VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('🌟 ALL SECURITY POLICIES, INVARIANTS, AND WORKFLOWS VERIFIED (100% SUCCESS)');
  }
}

runVerificationSuite();
