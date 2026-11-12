import { db } from '../server/db.js';

console.log('--- Migrating Learner Level Counts (5 quizzes = 1 level; 10 quizzes = 2 levels) ---');

const before = db.prepare('SELECT id, fullName, quizzesCompletedCount, levelsCompletedCount FROM learners').all();
console.log('Learners before migration:');
console.table(before);

db.prepare(`
  UPDATE learners
  SET levelsCompletedCount = CAST(quizzesCompletedCount / 5 AS INTEGER),
      updatedAt = datetime('now')
`).run();

const after = db.prepare('SELECT id, fullName, quizzesCompletedCount, levelsCompletedCount FROM learners').all();
console.log('Learners after migration:');
console.table(after);

// Also verify that 10 quizzes equals 2 levels:
const tenQuizzes = db.prepare('SELECT CAST(10 / 5 AS INTEGER) as levels').get().levels;
console.log(`Verification: 10 quizzes / 5 = ${tenQuizzes} levels`);

console.log('Migration complete.');
