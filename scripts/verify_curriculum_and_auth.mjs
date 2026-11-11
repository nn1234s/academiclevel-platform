import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Verify 12,000 Question Bank (1,000 per class)
const bankPath = path.join(__dirname, '../src/data/curatedQuestionBank.json');
assert.ok(fs.existsSync(bankPath), 'curatedQuestionBank.json must exist');

const bankRaw = fs.readFileSync(bankPath, 'utf8');
const questions = JSON.parse(bankRaw);

console.log(`[PASS] Total question bank items: ${questions.length}`);
assert.strictEqual(questions.length, 12000, 'Bank must contain exactly 12,000 questions');

// Grade distribution
const gradeCounts = {};
for (let g = 1; g <= 12; g++) gradeCounts[g] = 0;
for (const q of questions) {
  assert.ok(q.id, 'Question must have id');
  assert.ok(q.text, 'Question must have text');
  assert.strictEqual(q.options.length, 4, 'Question must have 4 options');
  assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3, 'Correct index must be 0-3');
  assert.ok(q.explanation, 'Question must have explanation');
  gradeCounts[q.grade] = (gradeCounts[q.grade] || 0) + 1;
}

for (let g = 1; g <= 12; g++) {
  console.log(`[PASS] Class ${g}: ${gradeCounts[g]} questions`);
  assert.strictEqual(gradeCounts[g], 1000, `Class ${g} must have exactly 1,000 questions`);
}

// Option balance
const optCounts = [0, 0, 0, 0];
for (const q of questions) {
  optCounts[q.correctIndex]++;
}
console.log(`[PASS] Option distribution: A=${optCounts[0]}, B=${optCounts[1]}, C=${optCounts[2]}, D=${optCounts[3]}`);
for (let i = 0; i < 4; i++) {
  const pct = (optCounts[i] / questions.length) * 100;
  assert.ok(pct >= 23 && pct <= 27, `Option ${i} must be balanced ~25% (got ${pct.toFixed(2)}%)`);
}

console.log('\n=== ALL 12,000 CURRICULUM QUESTIONS VERIFIED 100%! ===\n');
