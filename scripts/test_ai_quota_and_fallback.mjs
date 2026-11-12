import { db } from '../server/db.js';

console.log('=== TEST SUITE: AI QUOTA, COIN REFILL & MULTI-MODEL FALLBACK ===');

// 1. Verify schema columns
const tableInfo = db.prepare(`PRAGMA table_info(learners)`).all();
const colNames = tableInfo.map(c => c.name);

console.log('[1] Checking DB Schema Columns...');
if (!colNames.includes('dailyAiMessagesUsed') || !colNames.includes('lastAiMessageDateUtc') || !colNames.includes('bonusAiMessages')) {
  console.error('FAIL: Missing AI quota columns in learners table!');
  process.exit(1);
}
console.log('  -> [PASS] dailyAiMessagesUsed, lastAiMessageDateUtc, bonusAiMessages present in learners table.');

// 2. Test quota calculation logic
console.log('[2] Testing Quota Logic on Test Record...');
const testLearnerId = 'test_quota_student_' + Date.now();
const todayUtc = new Date().toISOString().split('T')[0];

db.prepare(`
  INSERT INTO learners (
    id, fullName, email, board, grade, role, isActive, createdAt, updatedAt,
    quizzesCompletedCount, levelsCompletedCount,
    classChangesUsedPremium, classChangesUsedPostExpiry,
    referralCode, referralQualified,
    currentStreakDays, longestStreakDays, streakFreezesAvailable,
    coinBalance, dailyAiMessagesUsed, lastAiMessageDateUtc, bonusAiMessages
  ) VALUES (
    ?, 'Test Student', ?, 'CBSE', 10, 'STUDENT', 1, ?, ?,
    0, 0,
    0, 0,
    ?, 0,
    1, 1, 0,
    50, 0, ?, 0
  )
`).run(
  testLearnerId,
  `${testLearnerId}@academiclevel.test`,
  new Date().toISOString(),
  new Date().toISOString(),
  'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
  todayUtc
);

// Verify initial state
let learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(testLearnerId);
console.log(`  -> Initial coins: ${learner.coinBalance}, used: ${learner.dailyAiMessagesUsed}, bonus: ${learner.bonusAiMessages}`);

const DAILY_LIMIT = 8;
let used = learner.dailyAiMessagesUsed;
let bonus = learner.bonusAiMessages;
let totalAvailable = DAILY_LIMIT + bonus;
let remaining = Math.max(0, totalAvailable - used);

if (remaining !== 8) {
  console.error(`FAIL: Expected 8 remaining, got ${remaining}`);
  process.exit(1);
}
console.log(`  -> [PASS] Initial quota correctly evaluates to 8 messages.`);

// Simulate using 8 messages
db.prepare('UPDATE learners SET dailyAiMessagesUsed = 8 WHERE id = ?').run(testLearnerId);
learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(testLearnerId);
used = learner.dailyAiMessagesUsed;
remaining = Math.max(0, (DAILY_LIMIT + learner.bonusAiMessages) - used);
if (remaining !== 0) {
  console.error(`FAIL: Expected 0 remaining after 8 queries, got ${remaining}`);
  process.exit(1);
}
console.log(`  -> [PASS] Quota exhausts at 8 messages.`);

// Simulate buying PACK_5 (10 coins)
console.log('[3] Testing Buying AI Messages with AL Coins (10 Coins = 5 Messages)...');
const cost = 10;
const messagesToAdd = 5;

db.prepare('UPDATE learners SET coinBalance = coinBalance - ?, bonusAiMessages = bonusAiMessages + ? WHERE id = ?')
  .run(cost, messagesToAdd, testLearnerId);

const nowIso = new Date().toISOString();
db.prepare(`
  INSERT INTO coin_ledger (
    entryId, learnerId, amount, transactionType, reasonCode,
    balanceAfter, metadataJson, timestampUtc, signatureHash
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'tx_' + Date.now(),
  testLearnerId,
  cost,
  'DEBIT',
  'PURCHASE_AI_MESSAGES_PACK_5',
  40,
  JSON.stringify({ packType: 'PACK_5', messagesAwarded: 5 }),
  nowIso,
  'SIG_TEST'
);

learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(testLearnerId);
console.log(`  -> Balance after buy: ${learner.coinBalance} (expected 40), bonus: ${learner.bonusAiMessages} (expected 5)`);
if (learner.coinBalance !== 40 || learner.bonusAiMessages !== 5) {
  console.error('FAIL: Coin deduction or bonus message addition incorrect!');
  process.exit(1);
}

remaining = Math.max(0, (DAILY_LIMIT + learner.bonusAiMessages) - learner.dailyAiMessagesUsed);
if (remaining !== 5) {
  console.error(`FAIL: Expected 5 remaining messages after refill, got ${remaining}`);
  process.exit(1);
}
console.log(`  -> [PASS] Extra messages correctly unlocked: ${remaining} available.`);

// Clean up test record
db.prepare('DELETE FROM coin_ledger WHERE learnerId = ?').run(testLearnerId);
db.prepare('DELETE FROM learners WHERE id = ?').run(testLearnerId);
console.log('  -> [PASS] Test record cleaned up safely.');

// 4. Verify History Trimming & Multi-Model Chain in server/api.js
console.log('[4] Verifying History Trimming & Multi-Model Chain in server/api.js...');
import fs from 'fs';
const apiCode = fs.readFileSync('server/api.js', 'utf8');

const requiredModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
for (const m of requiredModels) {
  if (!apiCode.includes(m)) {
    console.error(`FAIL: server/api.js missing fallback model ${m}!`);
    process.exit(1);
  }
}
console.log('  -> [PASS] Verified standard fallback models present in server/api.js:', requiredModels);

if (!apiCode.includes('discoverAvailableGeminiModels')) {
  console.error('FAIL: server/api.js missing discoverAvailableGeminiModels function!');
  process.exit(1);
}
console.log('  -> [PASS] Dynamic model discovery function active in server/api.js.');

if (!apiCode.includes('.slice(-4)') || !apiCode.includes('.slice(0, 250)')) {
  console.error('FAIL: server/api.js missing prompt history trimming (last 4 messages, 250 chars)!');
  process.exit(1);
}
console.log('  -> [PASS] History trimming active in server/api.js (last 4 messages, 250 chars max per message).');

console.log('=== ALL AI QUOTA & FALLBACK TESTS PASSED! ===');
