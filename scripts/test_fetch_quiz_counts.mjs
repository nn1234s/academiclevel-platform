import { db } from '../server/db.js';

const testCases = [
  { grade: 10, subjectId: 'math', levelNode: 'FOUNDATION', count: 10 },
  { grade: 10, subjectId: 'math', levelNode: 'CONCEPT', count: 12 },
  { grade: 10, subjectId: 'math', levelNode: 'EXAM_READY', count: 15 },
  { grade: 10, subjectId: 'math', levelNode: 'OLYMPIAD', count: 15 },
  { grade: 10, subjectId: 'cs', levelNode: 'FOUNDATION', count: 10 },
  { grade: 10, subjectId: 'science', levelNode: 'FOUNDATION', count: 10 },
  { grade: 10, subjectId: 'english', levelNode: 'FOUNDATION', count: 10 },
  { grade: 10, subjectId: 'social', levelNode: 'FOUNDATION', count: 10 },
  { grade: 1, subjectId: 'math', chapter: 'Addition', count: 10 },
  { grade: 1, subjectId: 'english', levelNode: 'FOUNDATION', count: 10 },
  { grade: 6, subjectId: 'cs', chapter: 'App Inventor', count: 10 },
  { grade: 10, subjectId: 'math', chapter: 'Trigonometry', count: 10 }
];

console.log('Testing /api/quizzes/fetch-quiz query logic for exact count matching across all subjects:');

let allPassed = true;

for (const tc of testCases) {
  const { grade, subjectId, levelNode, count, chapter } = tc;
  const targetSub = subjectId;
  let candidatePool = [];

  const normalizeQText = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  if (chapter) {
    const cleanChapter = String(chapter).trim();
    const chapterPattern = `%${cleanChapter}%`;
    const chRows = db.prepare(`
      SELECT * FROM question_bank
      WHERE grade = ? AND (subjectId = ? OR subjectId LIKE ?) AND (topicTag LIKE ? OR ? LIKE '%' || topicTag || '%')
      ORDER BY RANDOM() LIMIT ?
    `).all(Number(grade), targetSub, `%${targetSub}%`, chapterPattern, cleanChapter, count * 4);
    candidatePool.push(...chRows);
  }

  if (candidatePool.length < count * 2 && levelNode) {
    const levelRows = db.prepare(`
      SELECT * FROM question_bank
      WHERE grade = ? AND (subjectId = ? OR subjectId LIKE ?) AND levelNode = ?
      ORDER BY RANDOM() LIMIT ?
    `).all(Number(grade), targetSub, `%${targetSub}%`, String(levelNode), count * 4);
    candidatePool.push(...levelRows);
  }

  if (candidatePool.length < count * 2) {
    const subRows = db.prepare(`
      SELECT * FROM question_bank
      WHERE grade = ? AND (subjectId = ? OR subjectId LIKE ?)
      ORDER BY RANDOM() LIMIT ?
    `).all(Number(grade), targetSub, `%${targetSub}%`, count * 4);
    candidatePool.push(...subRows);
  }

  const seenTexts = new Set();
  const uniqueRows = [];
  for (const row of candidatePool) {
    const norm = normalizeQText(row.text);
    if (!seenTexts.has(norm)) {
      seenTexts.add(norm);
      uniqueRows.push(row);
    }
    if (uniqueRows.length >= count) break;
  }

  const passed = uniqueRows.length === count;
  console.log(
    `[${passed ? 'PASS' : 'FAIL'}] Grade ${grade} ${subjectId} ${levelNode || chapter} (Requested ${count}): Got ${uniqueRows.length} questions, Unique: ${seenTexts.size}`
  );
  if (!passed) allPassed = false;
}

if (!allPassed) {
  console.error('Some count tests failed!');
  process.exit(1);
} else {
  console.log('\nAll query count tests PASSED flawlessly across all subjects and grades!');
}
