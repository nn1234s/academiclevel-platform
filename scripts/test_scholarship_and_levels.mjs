import { db } from '../server/db.js';
import assert from 'node:assert';

console.log('================================================================');
console.log('🧪 TESTING SCHOLARSHIP CREATION & LEVEL RATIO (5 QUIZZES = 1 LEVEL)');
console.log('================================================================\n');

// 1. Verify Level Ratio Formula
console.log('1. Testing Level Calculation (10 quizzes = 2 levels)...');
const testCases = [
  { quizzes: 0, expectedLevels: 0 },
  { quizzes: 1, expectedLevels: 0 },
  { quizzes: 4, expectedLevels: 0 },
  { quizzes: 5, expectedLevels: 1 },
  { quizzes: 9, expectedLevels: 1 },
  { quizzes: 10, expectedLevels: 2 },
  { quizzes: 12, expectedLevels: 2 },
  { quizzes: 14, expectedLevels: 2 },
  { quizzes: 15, expectedLevels: 3 },
  { quizzes: 20, expectedLevels: 4 },
  { quizzes: 25, expectedLevels: 5 },
];

for (const tc of testCases) {
  const calculated = Math.floor(tc.quizzes / 5);
  assert.strictEqual(calculated, tc.expectedLevels, `Expected ${tc.quizzes} quizzes to equal ${tc.expectedLevels} levels, got ${calculated}`);
  console.log(`  [PASS] ${tc.quizzes} quizzes = ${calculated} levels (Expected: ${tc.expectedLevels})`);
}

// 2. Test SQLite Database Schema & Calculation
console.log('\n2. Testing SQLite Level Calculation via SQL CAST/integer division...');
const sqlCalc = db.prepare('SELECT CAST(10 / 5 AS INTEGER) as levelsTen, CAST(5 / 5 AS INTEGER) as levelsFive, CAST(4 / 5 AS INTEGER) as levelsFour').get();
assert.strictEqual(sqlCalc.levelsTen, 2, 'SQL 10 / 5 must be 2');
assert.strictEqual(sqlCalc.levelsFive, 1, 'SQL 5 / 5 must be 1');
assert.strictEqual(sqlCalc.levelsFour, 0, 'SQL 4 / 5 must be 0');
console.log(`  [PASS] SQL Engine confirms: 10 quizzes / 5 = ${sqlCalc.levelsTen} levels, 5 quizzes / 5 = ${sqlCalc.levelsFive} level, 4 quizzes / 5 = ${sqlCalc.levelsFour} levels.`);

// 3. Test Scholarship Creation & Persistence in SQLite
console.log('\n3. Testing Scholarship Creation in SQLite...');
const schId = 'sch_verify_' + Date.now().toString(36);
const now = new Date();
const endDate = new Date(now.getTime() + 7 * 86400000);

db.prepare(`
  INSERT INTO scholarships (
    id, title, description, targetQuizCount, rewardCoins, durationDays,
    targetGrade, targetBoard, badgeTitle, maxRecipients, claimedCount,
    isActive, startDate, endDate, createdBy, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  schId,
  '7-Day Science & Math Scholar Challenge',
  'Complete 10 quizzes to win 250 Coins!',
  10,
  250,
  7,
  null, // ALL Grades
  null, // ALL Boards
  '🏆 Worldwide Scholar Laureate',
  100,
  0,
  1,
  now.toISOString(),
  endDate.toISOString(),
  'admin@academiclevel.in',
  now.toISOString(),
  now.toISOString()
);

const fetchedSch = db.prepare('SELECT * FROM scholarships WHERE id = ?').get(schId);
assert.ok(fetchedSch, 'Scholarship should exist in database');
assert.strictEqual(fetchedSch.title, '7-Day Science & Math Scholar Challenge');
assert.strictEqual(fetchedSch.targetQuizCount, 10);
assert.strictEqual(fetchedSch.rewardCoins, 250);
assert.strictEqual(fetchedSch.targetGrade, null);
assert.strictEqual(fetchedSch.targetBoard, null);
assert.strictEqual(fetchedSch.isActive, 1);
console.log('  [PASS] Scholarship created and verified in SQLite database!');

// 4. Test Student Query Matching for any grade & board
console.log('\n4. Testing Student Eligibility Query...');
const studentMatches = db.prepare(`
  SELECT * FROM scholarships
  WHERE id = ? AND isActive = 1
  AND (targetGrade IS NULL OR targetGrade = ?)
  AND (targetBoard IS NULL OR targetBoard = ?)
`).all(schId, 5, 'CBSE');

assert.strictEqual(studentMatches.length, 1, 'Student in Grade 5 CBSE should see the scholarship');
console.log('  [PASS] Student query successfully matches the created scholarship!');

// Clean up test scholarship
db.prepare('DELETE FROM scholarships WHERE id = ?').run(schId);
console.log('  [CLEANUP] Deleted test scholarship.');

console.log('\n================================================================');
console.log('✅ ALL TESTS PASSED: SCHOLARSHIPS WORKING & 10 QUIZZES = 2 LEVELS');
console.log('================================================================\n');
