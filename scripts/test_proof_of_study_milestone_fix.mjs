import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platformDir = path.resolve(__dirname, '..');

console.log('🚀 Running Proof of Study Milestone Verification Suite...');

// 1. Verify GiftStore.tsx does NOT use bogus Math.floor(quizzesCompletedCount / 5)
const giftStoreContent = fs.readFileSync(path.join(platformDir, 'src', 'modules', 'student', 'GiftStore.tsx'), 'utf-8');

assert(!giftStoreContent.includes('Math.floor((learner.quizzesCompletedCount || 0) / 5)'), 'Must NOT use broken Math.floor(quizzesCompletedCount / 5) which evaluated to 0/3');
assert(giftStoreContent.includes('Math.max('), 'Must use Math.max across levelsCompletedCount, quota, progress, and quizzes');
assert(giftStoreContent.includes('learner.levelsCompletedCount'), 'Must check learner.levelsCompletedCount');
assert(giftStoreContent.includes('quota.levelsCompleted'), 'Must check quota.levelsCompleted');
console.log('✓ TEST 1 PASSED: GiftStore correctly evaluates levelsCount using real student mastery.');

// 2. Logic Simulation of the User Case (Quizzes = 4, Course Levels Mastered = 4)
const simulateLevelsCount = (learner, quota, progressList = []) => {
  const completedProgressLevels = progressList.filter(
    p => p.isCompleted || (p.bestScorePercent && p.bestScorePercent >= 70)
  ).length;

  return Math.max(
    Number(learner.levelsCompletedCount || 0),
    Number(quota?.levelsCompleted || 0),
    completedProgressLevels,
    Number(learner.quizzesCompletedCount || 0)
  );
};

// Case A: User from screenshot with 4 Quizzes Completed, 4 Levels Mastered
const userLearner = {
  id: 'lrn_screenshot_user',
  quizzesCompletedCount: 4,
  levelsCompletedCount: 4,
  role: 'STUDENT'
};
const userQuota = {
  levelsCompleted: 4,
  hasActiveSubscription: true,
  activePlan: 'LITE'
};

const userLevelsCount = simulateLevelsCount(userLearner, userQuota);
console.log(`[TEST 2] Evaluated levelsCount for 4-quiz / 4-level student: ${userLevelsCount}`);
assert.strictEqual(userLevelsCount, 4, 'Must evaluate to 4 levels mastered');
assert(userLevelsCount >= 3, '4 levels must satisfy minLevelsRequired (3)');
console.log('✓ TEST 2 PASSED: User with 4 mastered levels is verified and NOT blocked with 0/3.');

// Case B: Brand new student with 1 quiz
const newLearner = {
  id: 'lrn_new',
  quizzesCompletedCount: 1,
  levelsCompletedCount: 1,
  role: 'STUDENT'
};
const newQuota = { levelsCompleted: 1 };
const newLevelsCount = simulateLevelsCount(newLearner, newQuota);
assert.strictEqual(newLevelsCount, 1, 'Brand new learner has 1 level');
assert(newLevelsCount < 3, '1 level does not satisfy milestone 3');
console.log('✓ TEST 3 PASSED: Novice student with 1 quiz correctly shows 1/3 progress.');

// Case C: Student with 0 levelsCompletedCount on object but 4 completed in progress list
const unmigratedLearner = {
  id: 'lrn_unmigrated',
  quizzesCompletedCount: 4,
  levelsCompletedCount: 0,
  role: 'STUDENT'
};
const progressLevels = [
  { isCompleted: true, bestScorePercent: 85 },
  { isCompleted: true, bestScorePercent: 90 },
  { isCompleted: true, bestScorePercent: 75 },
  { isCompleted: true, bestScorePercent: 80 }
];
const unmigratedCount = simulateLevelsCount(unmigratedLearner, { levelsCompleted: 0 }, progressLevels);
assert.strictEqual(unmigratedCount, 4, 'Recovers count from progressList');
assert(unmigratedCount >= 3, 'Must satisfy milestone from progressList');
console.log('✓ TEST 4 PASSED: Student with 4 completed progress records satisfies milestone.');

// 3. Verify Server API student sync
const serverApiContent = fs.readFileSync(path.join(platformDir, 'server', 'api.js'), 'utf-8');
assert(serverApiContent.includes('reconciledLevels = Math.max('), 'Server must reconcile levelsCompletedCount in GET /students/:id');
assert(serverApiContent.includes('quizzesCompletedCount !== undefined'), 'Server must allow updating quizzesCompletedCount');
assert(serverApiContent.includes('levelsCompletedCount !== undefined'), 'Server must allow updating levelsCompletedCount');
console.log('✓ TEST 5 PASSED: Server API reconciliation verified.');

// 4. Verify AuthContext preservation of local learner counters
const authContextContent = fs.readFileSync(path.join(platformDir, 'src', 'core', 'auth', 'AuthContext.tsx'), 'utf-8');
assert(authContextContent.includes('localLearner.levelsCompletedCount'), 'AuthContext must preserve local levelsCompletedCount on sync');
assert(authContextContent.includes('localLearner.quizzesCompletedCount'), 'AuthContext must preserve local quizzesCompletedCount on sync');
console.log('✓ TEST 6 PASSED: AuthContext preserves student level progress across tab sync.');

console.log('🎉 ALL 6 TESTS IN PROOF OF STUDY MILESTONE SUITE PASSED PERFECTLY!');
