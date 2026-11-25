/**
 * Deterministic Question Bank Validator (Schema, Options, CorrectIndex, Explanations)
 * Usage: node scripts/validate_question_bank.mjs
 */

import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'al-qbank-val-'));
process.env.DB_PATH = path.join(tmpDir, 'validate.db');

await import('../server/server.js');
const { db } = await import('../server/db.js');

try {
  const rows = db.prepare('SELECT id, board, grade, subjectId, levelNode, text, optionsJson, correctIndex, explanation FROM question_bank').all();
  assert.ok(rows.length >= 3600, `Expected >= 3600 questions, found ${rows.length}`);

  let badOptionsLen = 0;
  let duplicateOptions = 0;
  let badCorrectIndex = 0;
  let missingExplanation = 0;
  let nonCbse = 0;

  for (const r of rows) {
    let opts = [];
    try { opts = JSON.parse(r.optionsJson || '[]'); } catch { opts = []; }
    if (!Array.isArray(opts) || opts.length !== 4) badOptionsLen++;
    const normOpts = opts.map(o => String(o).trim().toLowerCase());
    if (new Set(normOpts).size !== opts.length) duplicateOptions++;
    if (typeof r.correctIndex !== 'number' || r.correctIndex < 0 || r.correctIndex > 3) badCorrectIndex++;
    if (!r.explanation || String(r.explanation).trim().length === 0) missingExplanation++;
    if (r.board !== 'CBSE') nonCbse++;
  }

  console.log(`Validated ${rows.length} questions: badOptionsLen=${badOptionsLen}, duplicateOptions=${duplicateOptions}, badCorrectIndex=${badCorrectIndex}, missingExplanation=${missingExplanation}, nonCbse=${nonCbse}`);
  assert.equal(badOptionsLen, 0, 'All questions must have exactly 4 options');
  assert.equal(duplicateOptions, 0, 'No question may have duplicate options');
  assert.equal(badCorrectIndex, 0, 'All questions must have correctIndex in 0..3');
  assert.equal(missingExplanation, 0, 'All questions must have a non-empty explanation');
  console.log('QUESTION BANK VALIDATION PASSED');
} finally {
  try { db.close(); } catch {}
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
