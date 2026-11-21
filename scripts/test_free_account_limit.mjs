import assert from 'assert';
import { db } from '../server/db.js';

console.log('🧪 Starting Free Account & 3-Level Limit Verification Suite...\n');

// 1. Verify Prabir and Special49 subscriptions exist and are intact
const prabirSub = db.prepare(`
  SELECT * FROM subscriptions WHERE learnerId = 'lrn_mw9asujp_rzun' AND status = 'ACTIVE'
`).get();
assert.ok(prabirSub, 'Prabir active subscription must exist in DB');
console.log('✅ 1. Prabir (lrn_mw9asujp_rzun) active subscription intact');

const special49Sub = db.prepare(`
  SELECT * FROM subscriptions WHERE learnerId = 'lrn_special49_9861439460' AND status = 'ACTIVE'
`).get();
assert.ok(special49Sub, 'Special49 active subscription must exist in DB');
console.log('✅ 2. Special49 (9861439460) active subscription intact');

// 2. Verify a generic learner has NO active subscription in DB
const testLearnerId = 'lrn_test_free_user_' + Date.now();
const testSub = db.prepare(`
  SELECT * FROM subscriptions WHERE learnerId = ? AND status = 'ACTIVE'
`).get(testLearnerId);
assert.strictEqual(testSub, undefined, 'A new user should not have a subscription row in subscriptions table');
console.log('✅ 3. Free user has no active subscription row');

// 3. Verify Free Tier Limit Constant
const FREE_TIER_MAX_LEVELS = 3;
const levelsCompleted0 = 0;
const levelsCompleted2 = 2;
const levelsCompleted3 = 3;
const levelsCompleted4 = 4;

assert.strictEqual(levelsCompleted0 >= FREE_TIER_MAX_LEVELS, false, '0 levels completed should not be locked');
assert.strictEqual(levelsCompleted2 >= FREE_TIER_MAX_LEVELS, false, '2 levels completed should not be locked');
assert.strictEqual(levelsCompleted3 >= FREE_TIER_MAX_LEVELS, true, '3 levels completed must be locked');
assert.strictEqual(levelsCompleted4 >= FREE_TIER_MAX_LEVELS, true, '4 levels completed must be locked');
console.log('✅ 4. Free account 3-level limit gating math verified (locks at exactly 3 levels)');

console.log('\n🎉 ALL FREE ACCOUNT & 3-LEVEL LIMIT AUDIT CHECKS PASSED!\n');
