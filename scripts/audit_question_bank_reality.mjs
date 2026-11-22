import { db } from '../server/db.js';

console.log('================================================================');
console.log('REALITY AUDIT OF QUESTION BANK (DATABASE INSPECTION)');
console.log('================================================================');

const total = db.prepare('SELECT count(*) as count FROM question_bank').get().count;
console.log('Total database rows:', total);

const subjects = db.prepare('SELECT subjectId, count(*) as count FROM question_bank GROUP BY subjectId ORDER BY count DESC').all();
console.log('\nSubject Distribution:');
for (const s of subjects) {
  console.log(`  - ${s.subjectId}: ${s.count} rows`);
}

const grades = db.prepare('SELECT grade, count(*) as count FROM question_bank GROUP BY grade ORDER BY grade ASC').all();
console.log('\nGrade Distribution:');
for (const g of grades) {
  console.log(`  - Grade ${g.grade}: ${g.count} rows`);
}

const boards = db.prepare('SELECT board, count(*) as count FROM question_bank GROUP BY board').all();
console.log('\nBoard Distribution:');
for (const b of boards) {
  console.log(`  - ${b.board}: ${b.count} rows`);
}

const nodes = db.prepare('SELECT levelNode, count(*) as count FROM question_bank GROUP BY levelNode').all();
console.log('\nLevel Node Distribution:');
for (const n of nodes) {
  console.log(`  - ${n.levelNode}: ${n.count} rows`);
}

const emptyTexts = db.prepare("SELECT count(*) as count FROM question_bank WHERE text IS NULL OR length(trim(text)) = 0").get().count;
const invalidCorrect = db.prepare("SELECT count(*) as count FROM question_bank WHERE correctIndex NOT IN (0, 1, 2, 3)").get().count;
console.log('\nData Integrity:');
console.log(`  - Empty texts: ${emptyTexts}`);
console.log(`  - Invalid correctIndex: ${invalidCorrect}`);

// Check subject-by-grade matrix
console.log('\nSubject Coverage by Grade:');
for (let g = 1; g <= 12; g++) {
  const gSubs = db.prepare('SELECT subjectId, count(*) as count FROM question_bank WHERE grade = ? GROUP BY subjectId').all(g);
  console.log(`  - Class ${g.grade || g}: ${gSubs.map(s => `${s.subjectId} (${s.count})`).join(', ')}`);
}

// Check chapter distribution per subject
console.log('\nDistinct Chapters per Subject:');
for (const s of subjects) {
  const chapters = db.prepare('SELECT topicTag, count(*) as count FROM question_bank WHERE subjectId = ? GROUP BY topicTag ORDER BY count DESC').all(s.subjectId);
  console.log(`\n  Subject: ${s.subjectId} (${chapters.length} distinct chapters)`);
  for (const c of chapters.slice(0, 10)) {
    console.log(`    • "${c.topicTag}": ${c.count} questions`);
  }
  if (chapters.length > 10) {
    console.log(`    ... and ${chapters.length - 10} more chapters`);
  }
}
