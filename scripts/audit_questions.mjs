import { db } from '../server/db.js';

console.log('=== QUESTION BANK AUDIT (table: question_bank) ===');
const total = db.prepare('SELECT COUNT(*) as count FROM question_bank').get();
console.log('Total questions in DB:', total.count);

const byBoard = db.prepare('SELECT board, COUNT(*) as count FROM question_bank GROUP BY board ORDER BY board').all();
console.log('\nBy Board:');
console.log(byBoard);

const byGrade = db.prepare('SELECT grade, COUNT(*) as count FROM question_bank GROUP BY grade ORDER BY grade').all();
console.log('\nBy Grade:');
console.log(byGrade);

const byBoardAndGrade = db.prepare('SELECT board, grade, COUNT(*) as count FROM question_bank GROUP BY board, grade ORDER BY board, grade').all();
console.log('\nBy Board & Grade: Total groups:', byBoardAndGrade.length);
console.log('Summary of count per group: min =', Math.min(...byBoardAndGrade.map(g => g.count)), 'max =', Math.max(...byBoardAndGrade.map(g => g.count)));

const emptyQuestions = db.prepare("SELECT COUNT(*) as count FROM question_bank WHERE text IS NULL OR trim(text) = ''").get();
console.log('\nEmpty questions:', emptyQuestions.count);

const badCorrectIndex = db.prepare('SELECT COUNT(*) as count FROM question_bank WHERE correctIndex < 0 OR correctIndex > 3 OR correctIndex IS NULL').get();
console.log('Bad correctIndex count:', badCorrectIndex.count);

const sample = db.prepare('SELECT id, board, grade, subjectId, text, options, correctIndex FROM question_bank LIMIT 2').all();
console.log('\nSample question:');
console.log(sample[0]);
