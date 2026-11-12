import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../../server/db.js';
import { getPrimaryQuestion } from './primary.js';
import { getMiddleQuestion } from './middle.js';
import { getSecondaryQuestion } from './secondary.js';
import { getSeniorQuestion } from './senior.js';
import { seenTexts } from './common.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('🚀 ACADEMICLEVEL MASTER 12,000 100% UNIQUE CURRICULUM GENERATOR');
console.log('Target: 12,000 Genuinely Different Questions Across Classes 1-12');
console.log('================================================================\n');

const NODES = ['FOUNDATION', 'CONCEPT', 'EXAM_READY', 'OLYMPIAD'];

// Deterministic board sequence for each grade: 333 CBSE, 334 ICSE, 333 IGCSE = 1,000
function getBoardsForGrade() {
  const boards = [];
  let c = 0, ic = 0, ig = 0;
  while (boards.length < 1000) {
    if (c < 333) { boards.push('CBSE'); c++; }
    if (ic < 334) { boards.push('ICSE'); ic++; }
    if (ig < 333) { boards.push('IGCSE'); ig++; }
  }
  return boards;
}

const allQuestions = [];
const overallStartTime = Date.now();

for (let grade = 1; grade <= 12; grade++) {
  const gradeStart = Date.now();
  const boards = getBoardsForGrade();
  const gradeQuestions = [];
  let counter = 0;

  while (gradeQuestions.length < 1000) {
    const idx = gradeQuestions.length;
    const board = boards[idx];
    const node = NODES[idx % 4];
    const seqNum = String(idx + 1).padStart(4, '0');
    const qId = `q_${board.toLowerCase()}_c${grade}_${node.toLowerCase()}_${seqNum}`;

    let q = null;
    if (grade <= 5) {
      q = getPrimaryQuestion(grade, board, node, counter++, qId);
    } else if (grade <= 8) {
      q = getMiddleQuestion(grade, board, node, counter++, qId);
    } else if (grade <= 10) {
      q = getSecondaryQuestion(grade, board, node, counter++, qId);
    } else {
      q = getSeniorQuestion(grade, board, node, counter++, qId);
    }

    if (q) {
      gradeQuestions.push(q);
    }

    if (counter > 35000) {
      console.error(`FATAL: Stalled at grade ${grade}, length ${gradeQuestions.length}, counter ${counter}`);
      process.exit(1);
    }
  }

  allQuestions.push(...gradeQuestions);
  const gradeElapsed = ((Date.now() - gradeStart) / 1000).toFixed(2);
  console.log(`Grade ${grade.toString().padStart(2, ' ')} complete: 1,000 unique questions in ${gradeElapsed}s (Global unique texts: ${seenTexts.size})`);
}

console.log(`\nAll 12 grades generated in ${((Date.now() - overallStartTime) / 1000).toFixed(2)}s.`);
console.log(`Total questions in memory: ${allQuestions.length}`);
console.log(`Total unique question texts: ${seenTexts.size}`);

// Write to JSON file
const jsonPath = path.resolve(__dirname, '../../src/data/curatedQuestionBank.json');
console.log(`\nWriting 12,000 questions to ${jsonPath}...`);
fs.writeFileSync(jsonPath, JSON.stringify(allQuestions, null, 2), 'utf8');
console.log(`JSON write complete. File size: ${(fs.statSync(jsonPath).size / (1024 * 1024)).toFixed(2)} MB`);

// Update SQLite database
console.log('\nUpdating SQLite question_bank table in server/data/academiclevel_prod.db...');
db.exec('BEGIN TRANSACTION;');
db.exec('DELETE FROM question_bank;');

const insertStmt = db.prepare(`
  INSERT INTO question_bank (
    id, board, grade, subjectId, levelNode, text,
    optionsJson, correctIndex, explanation, hint, difficulty, topicTag
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const q of allQuestions) {
  insertStmt.run(
    q.id,
    q.board,
    q.grade,
    q.subjectId,
    q.levelNode,
    q.text,
    JSON.stringify(q.options),
    q.correctIndex,
    q.explanation || '',
    q.hint || '',
    q.difficulty || 'MEDIUM',
    q.topicTag || ''
  );
}

db.exec('COMMIT;');
console.log('SQLite question_bank successfully populated and committed.');

// Immediate internal database check
const dbCount = db.prepare('SELECT count(*) as c FROM question_bank').get().c;
const dbUnique = db.prepare('SELECT count(DISTINCT text) as u FROM question_bank').get().u;
console.log(`\nSQLite Verification: Total rows = ${dbCount}, Unique texts = ${dbUnique}`);
