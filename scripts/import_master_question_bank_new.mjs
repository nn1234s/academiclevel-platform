import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = 'C:/Users/NEWADMIN/.gemini/antigravity/brain/e3a0d571-f252-454c-bab1-205ded959290/AcademicLevel_Master_Question_Bank_NEW.txt';
const outputPath = path.resolve(__dirname, '../src/data/curatedQuestionBank.json');
const dbPath = path.resolve(__dirname, '../server/data/academiclevel_prod.db');

console.log('[Importer] Reading master question bank from:', inputPath);
const text = fs.readFileSync(inputPath, 'utf8');

const blocks = text.split(/(?=^ID:\s*)/m).filter(b => b.trim().startsWith('ID:'));
console.log(`[Importer] Found ${blocks.length} question blocks.`);

const parsed = [];
for (const b of blocks) {
  const getField = (f) => {
    const m = b.match(new RegExp('^' + f + ':\\s*([^\\r\\n]+)', 'm'));
    return m ? m[1].trim() : '';
  };

  const id = getField('ID');
  const grade = parseInt(getField('CLASS'), 10);
  const subject = getField('SUBJECT');
  const topic = getField('TOPIC');
  const difficulty = getField('DIFFICULTY');
  const question = getField('QUESTION');
  const answer = getField('ANSWER_TEXT');
  const explanation = getField('EXPLANATION');

  if (id && question && answer) {
    parsed.push({ id, grade, subject, topic, difficulty, question, answer, explanation });
  }
}

if (parsed.length !== 3600) {
  console.error(`[Importer] Error: Expected 3600 questions, got ${parsed.length}`);
  process.exit(1);
}

function toSubjectId(s) {
  const lower = s.toLowerCase();
  if (lower.includes('math')) return 'math';
  if (lower.includes('english')) return 'english';
  if (lower.includes('science / evs') || lower === 'science') return 'science';
  if (lower.includes('humanities')) return 'humanities';
  if (lower.includes('social')) return 'social';
  if (lower.includes('physic')) return 'physics';
  if (lower.includes('chem')) return 'chemistry';
  if (lower.includes('bio')) return 'biology';
  return 'general';
}

const bySubGrade = {};
const bySub = {};
for (const p of parsed) {
  const subId = toSubjectId(p.subject);
  const sgKey = subId + '_' + p.grade;
  bySubGrade[sgKey] = bySubGrade[sgKey] || [];
  bySubGrade[sgKey].push(p);
  bySub[subId] = bySub[subId] || [];
  bySub[subId].push(p);
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const DOMAIN_MAP = {
  'an': ['a', 'the', 'some'],
  'a': ['an', 'the', 'any'],
  'the': ['a', 'an', 'this'],
  'she': ['he', 'they', 'it'],
  'he': ['she', 'they', 'it'],
  'they': ['we', 'he', 'she'],
  'it': ['this', 'that', 'they'],
  'nose': ['Ear', 'Eyes', 'Skin'],
  'eyes': ['Ears', 'Nose', 'Tongue'],
  'ears': ['Eyes', 'Nose', 'Skin'],
  'tongue': ['Nose', 'Teeth', 'Lips'],
  'skin': ['Hair', 'Nose', 'Eyes'],
  'leaves': ['roots', 'flowers', 'seeds'],
  'roots': ['stems', 'leaves', 'branches'],
  'stem': ['roots', 'leaves', 'fruit'],
  'chlorophyll': ['Hemoglobin', 'Melanin', 'Carotene'],
  'volt': ['ampere', 'ohm', 'watt'],
  'ampere': ['volt', 'ohm', 'coulomb'],
  'ohm': ['volt', 'ampere', 'farad'],
  'watt': ['joule', 'newton', 'pascal'],
  'joule': ['watt', 'newton', 'calorie'],
  'newton': ['joule', 'pascal', 'watt'],
  'pascal': ['newton', 'bar', 'joule'],
  'dna ligase': ['DNA polymerase', 'RNA primase', 'Helicase'],
  'dna polymerase': ['DNA ligase', 'RNA polymerase', 'Helicase'],
  'helicase': ['DNA ligase', 'Topoisomerase', 'Polymerase'],
  'tropic of cancer': ['Tropic of Capricorn', 'Equator', 'Prime Meridian'],
  'tropic of capricorn': ['Tropic of Cancer', 'Equator', 'Arctic Circle'],
  'equator': ['Prime Meridian', 'Tropic of Cancer', 'Tropic of Capricorn']
};

function generateDistractors(p) {
  const ans = p.answer.trim();
  const lowerAns = ans.toLowerCase().replace(/[.,!?;:]+$/, '');
  const seed = hashStr(p.id);

  if (DOMAIN_MAP[lowerAns]) {
    return DOMAIN_MAP[lowerAns].map(d => ans[0] === ans[0].toUpperCase() ? d.charAt(0).toUpperCase() + d.slice(1) : d).slice(0, 3);
  }

  const numMatch = ans.match(/^(-?\d+(\.\d+)?)\s*([a-zA-Z°%^/²³]+)?$/);
  if (numMatch) {
    const rawVal = parseFloat(numMatch[1]);
    const unit = numMatch[3] ? (' ' + numMatch[3].trim()) : '';
    const isInt = Number.isInteger(rawVal);
    const chosen = new Set();
    const offsets = [1, -1, 2, -2, 3, -3, 5, -5, 10, -10, 4, -4, 6, 7];
    let oIdx = (seed % offsets.length);
    while (chosen.size < 3) {
      const off = offsets[oIdx % offsets.length];
      oIdx++;
      let cand = isInt ? (rawVal + off) : (Math.round((rawVal + off * 0.5) * 10) / 10);
      if (rawVal >= 0 && cand < 0) cand = rawVal + Math.abs(off) + 2;
      const str = cand.toString() + unit;
      if (str !== ans && !chosen.has(str)) chosen.add(str);
    }
    return Array.from(chosen);
  }

  const subId = toSubjectId(p.subject);
  const sgKey = subId + '_' + p.grade;
  const pool = bySubGrade[sgKey] || bySub[subId] || [];
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetNorm = norm(ans);

  const candidates = pool
    .filter(x => norm(x.answer) !== targetNorm && x.answer.trim().length > 0)
    .map(x => ({ ans: x.answer.trim(), diff: Math.abs(x.answer.trim().length - ans.length) }))
    .sort((a, b) => a.diff - b.diff);

  const chosen = new Set();
  let step = (seed % 7) + 1;
  let start = (seed % (candidates.length || 1));
  for (let i = 0; i < candidates.length && chosen.size < 3; i++) {
    const cand = candidates[(start + i * step) % candidates.length].ans;
    if (cand !== ans && norm(cand) !== targetNorm && !chosen.has(cand)) chosen.add(cand);
  }
  if (chosen.size < 3) {
    const widePool = bySub[subId] || [];
    for (const w of widePool) {
      if (chosen.size >= 3) break;
      const wAns = w.answer.trim();
      if (wAns !== ans && norm(wAns) !== targetNorm && !chosen.has(wAns)) chosen.add(wAns);
    }
  }
  let fallbackCount = 1;
  while (chosen.size < 3) {
    chosen.add('Alternative option ' + fallbackCount++);
  }
  return Array.from(chosen).slice(0, 3);
}

function shuffleOptions(answer, distractors, id) {
  const all = [answer, ...distractors];
  const arr = [...all];
  let s = hashStr(id);
  for (let i = arr.length - 1; i > 0; i--) {
    s = ((Math.imul(s, 9301) + 49297) >>> 0) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  const correctIndex = arr.indexOf(answer);
  return { options: arr, correctIndex };
}

const LEVEL_NODES = ['FOUNDATION', 'CONCEPT', 'EXAM_READY', 'OLYMPIAD'];

const fullQuestions = parsed.map((p, idx) => {
  const distractors = generateDistractors(p);
  const { options, correctIndex } = shuffleOptions(p.answer, distractors, p.id);
  const subId = toSubjectId(p.subject);
  const levelNode = LEVEL_NODES[idx % LEVEL_NODES.length];

  let diff = 'MEDIUM';
  if (p.difficulty) {
    const dLower = p.difficulty.toLowerCase();
    if (dLower === 'easy') diff = 'EASY';
    else if (dLower === 'hard') diff = 'HARD';
  } else {
    diff = p.grade <= 4 ? 'EASY' : p.grade >= 10 ? 'HARD' : 'MEDIUM';
  }

  return {
    id: p.id,
    board: 'CBSE',
    grade: p.grade,
    subjectId: subId,
    levelNode,
    text: p.question,
    options,
    correctIndex,
    explanation: p.explanation || `The correct answer is ${p.answer}.`,
    hint: `Focus on the core principle of ${p.topic || p.subject}.`,
    difficulty: diff,
    topicTag: p.topic || p.subject,
    source: 'CURATED_OFFLINE'
  };
});

console.log(`[Importer] Generated ${fullQuestions.length} full question records.`);

// Verify fidelity
for (let i = 0; i < fullQuestions.length; i++) {
  const q = fullQuestions[i];
  const orig = parsed[i];
  if (q.text !== orig.question) {
    throw new Error(`Question text mismatch at ${q.id}`);
  }
  if (q.options[q.correctIndex] !== orig.answer) {
    throw new Error(`Answer mismatch at ${q.id}: expected '${orig.answer}', got '${q.options[q.correctIndex]}'`);
  }
  if (new Set(q.options).size !== 4) {
    throw new Error(`Duplicate options at ${q.id}: ${JSON.stringify(q.options)}`);
  }
}
console.log('[Importer] All 3600 questions passed 100% fidelity & uniqueness verification!');

// Write to JSON
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(fullQuestions, null, 2), 'utf8');
console.log(`[Importer] Saved JSON to ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);

// Reseed SQLite Database
console.log('[Importer] Reseeding SQLite database at:', dbPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);

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
    topicTag TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_qb_lookup ON question_bank(board, grade, subjectId, levelNode);
`);

db.exec('DELETE FROM question_bank');

const insertStmt = db.prepare(`
  INSERT INTO question_bank (
    id, board, grade, subjectId, levelNode, text,
    optionsJson, correctIndex, explanation, hint, difficulty, topicTag
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');
for (const q of fullQuestions) {
  insertStmt.run(
    q.id,
    q.board,
    q.grade,
    q.subjectId,
    q.levelNode,
    q.text,
    JSON.stringify(q.options),
    q.correctIndex,
    q.explanation,
    q.hint,
    q.difficulty,
    q.topicTag
  );
}
db.exec('COMMIT');

const finalCount = db.prepare('SELECT count(*) as c FROM question_bank').get().c;
console.log(`[Importer] Database seeded successfully. Final count in question_bank table: ${finalCount}`);

db.close();
console.log('[Importer] Master Question Bank Import Complete!');
