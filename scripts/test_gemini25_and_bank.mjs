import fs from 'fs';
import path from 'path';

console.log('=== TEST SUITE: QUESTION BANK & GEMINI 2.5 FLASH VERIFICATION ===');

// 1. Verify Curated Question Bank
const bankPath = path.resolve('src/data/curatedQuestionBank.json');
if (!fs.existsSync(bankPath)) {
  console.error('FAIL: curatedQuestionBank.json not found!');
  process.exit(1);
}

const raw = fs.readFileSync(bankPath, 'utf8');
const questions = JSON.parse(raw);

console.log(`[PASS] Total Questions Loaded: ${questions.length}`);
if (questions.length < 1200) {
  console.error(`FAIL: Expected over 1200 questions, got ${questions.length}`);
  process.exit(1);
}

// 2. Class-wise and Board-wise distribution checks
const boards = new Set();
const grades = new Set();
const correctIdxDist = { 0: 0, 1: 0, 2: 0, 3: 0 };

for (const q of questions) {
  boards.add(q.board);
  grades.add(Number(q.grade));
  correctIdxDist[q.correctIndex] = (correctIdxDist[q.correctIndex] || 0) + 1;
}

console.log('[PASS] Boards covered:', Array.from(boards).sort());
console.log('[PASS] Grades covered:', Array.from(grades).sort((a,b)=>a-b));
console.log('[PASS] Correct Index Distribution:', correctIdxDist);

// Check that Option A is not overwhelmingly dominant
const optACount = correctIdxDist[0];
const total = questions.length;
const optAPercent = (optACount / total) * 100;
console.log(`[PASS] Option A proportion: ${optAPercent.toFixed(1)}% (Target: ~25%, balanced)`);
if (optAPercent > 40) {
  console.error('FAIL: Option A is still heavily biased (>40%)');
  process.exit(1);
}

// Verify all 12 classes exist
for (let g = 1; g <= 12; g++) {
  if (!grades.has(g)) {
    console.error(`FAIL: Missing Grade ${g} in question bank!`);
    process.exit(1);
  }
}
console.log('[PASS] All Grades 1 through 12 present!');

// 3. Inspect Gemini 2.5 Flash configuration in codebase
const apiJs = fs.readFileSync('server/api.js', 'utf8');
if (!apiJs.includes('gemini-2.5-flash')) {
  console.error('FAIL: server/api.js does not specify gemini-2.5-flash!');
  process.exit(1);
}
console.log('[PASS] server/api.js configured with gemini-2.5-flash');

const hybridQuiz = fs.readFileSync('src/services/hybridQuizService.ts', 'utf8');
if (!hybridQuiz.includes('gemini-2.5-flash')) {
  console.error('FAIL: src/services/hybridQuizService.ts does not specify gemini-2.5-flash!');
  process.exit(1);
}
console.log('[PASS] src/services/hybridQuizService.ts configured with gemini-2.5-flash');

const novaAi = fs.readFileSync('src/services/novaAiService.ts', 'utf8');
if (!novaAi.includes('gemini-2.5-flash')) {
  console.error('FAIL: src/services/novaAiService.ts does not specify gemini-2.5-flash!');
  process.exit(1);
}
console.log('[PASS] src/services/novaAiService.ts configured with gemini-2.5-flash');

const questionBankMgr = fs.readFileSync('src/admin-vault/modules/QuestionBankManager.tsx', 'utf8');
if (!questionBankMgr.includes('gemini-2.5-flash')) {
  console.error('FAIL: src/admin-vault/modules/QuestionBankManager.tsx does not specify gemini-2.5-flash!');
  process.exit(1);
}
console.log('[PASS] src/admin-vault/modules/QuestionBankManager.tsx configured with gemini-2.5-flash');

console.log('=== ALL QUESTION BANK & GEMINI 2.5 TESTS PASSED SUCCESSFULLY! ===');
