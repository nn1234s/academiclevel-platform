import { db } from '../server/db.js';

console.log('Verifying all 12,000 questions in question_bank...');
const allQ = db.prepare('SELECT id, board, grade, optionsJson, correctIndex, text FROM question_bank').all();

let invalidOptionsCount = 0;
let invalidIndexCount = 0;
let emptyTextCount = 0;

for (const q of allQ) {
  if (!q.text || q.text.trim().length === 0) emptyTextCount++;
  if (q.correctIndex < 0 || q.correctIndex > 3 || q.correctIndex === null) invalidIndexCount++;
  try {
    const opts = JSON.parse(q.optionsJson);
    if (!Array.isArray(opts) || opts.length !== 4) {
      invalidOptionsCount++;
    }
  } catch {
    invalidOptionsCount++;
  }
}

console.log(`Total questions analyzed: ${allQ.length}`);
console.log(`Empty texts: ${emptyTextCount}`);
console.log(`Invalid options: ${invalidOptionsCount}`);
console.log(`Invalid correctIndex: ${invalidIndexCount}`);
console.log('All checks passed?', emptyTextCount === 0 && invalidOptionsCount === 0 && invalidIndexCount === 0);
