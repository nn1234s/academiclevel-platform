import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { db } from '../server/db.js';

console.log('Testing question_bank table creation & seed speed...');
db.exec(`
  CREATE TABLE IF NOT EXISTS question_bank (
    id TEXT PRIMARY KEY,
    board TEXT NOT NULL,
    grade INTEGER NOT NULL,
    subjectId TEXT NOT NULL,
    levelNode TEXT NOT NULL,
    text TEXT NOT NULL,
    optionsJson TEXT NOT NULL,
    correctIndex INTEGER NOT NULL,
    explanation TEXT,
    hint TEXT,
    difficulty TEXT,
    topicTag TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_qb_lookup ON question_bank(board, grade, subjectId, levelNode);
`);

const existing = db.prepare('SELECT COUNT(*) as c FROM question_bank').get().c;
console.log('Existing count in question_bank:', existing);

if (existing === 0) {
  const raw = fs.readFileSync('./src/data/curatedQuestionBank.json', 'utf8');
  const questions = JSON.parse(raw);
  console.log('Read', questions.length, 'questions from JSON.');

  const t0 = performance.now();
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO question_bank (
      id, board, grade, subjectId, levelNode, text,
      optionsJson, correctIndex, explanation, hint, difficulty, topicTag
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  for (const q of questions) {
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
  db.exec('COMMIT');
  const t1 = performance.now();
  console.log('Inserted', questions.length, 'questions into SQLite in', (t1 - t0).toFixed(2), 'ms!');
}

const count = db.prepare('SELECT COUNT(*) as c FROM question_bank').get().c;
console.log('Verified total count in question_bank table:', count);

// Test query speed: fetch 5 random questions for CBSE Class 10 Math FOUNDATION
const qStart = performance.now();
const sample = db.prepare(`
  SELECT * FROM question_bank
  WHERE board = ? AND grade = ? AND subjectId = ? AND levelNode = ?
  ORDER BY RANDOM() LIMIT 5
`).all('CBSE', 10, 'math', 'FOUNDATION');
const qEnd = performance.now();
console.log('Fetched 5 questions in', (qEnd - qStart).toFixed(2), 'ms:');
console.log(sample.map(s => ({ id: s.id, text: s.text.substring(0, 50) + '...' })));
