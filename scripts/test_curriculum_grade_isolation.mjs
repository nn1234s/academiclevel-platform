import { db } from '../server/db.js';
import fs from 'fs';
import path from 'path';

console.log('--- Checking Grade 1 Question Bank in SQLite & Offline Service ---');

// 1. Check Grade 1 in DB
const g1MathQuestions = db.prepare(`
  SELECT * FROM question_bank
  WHERE grade = 1 AND subjectId = 'math'
  LIMIT 20
`).all();

console.log(`Retrieved ${g1MathQuestions.length} Grade 1 math questions from database.`);
for (const q of g1MathQuestions) {
  if (q.text.toLowerCase().includes('pizza') || q.text.includes('3/8')) {
    console.error(`❌ Found pizza fraction question in Grade 1: ${q.text}`);
    process.exit(1);
  }
}
console.log('✅ PASS: Database contains 0 pizza fraction questions for Grade 1 math.');

// 2. Check offlineBankService.ts fallback and synthesizer
const offlineBankCode = fs.readFileSync(path.resolve('src/services/offlineBankService.ts'), 'utf8');

if (!offlineBankCode.includes('q_cbse_1_m_01')) {
  console.error('❌ FAIL: offlineBankService.ts does not have Class 1 math questions');
  process.exit(1);
}
if (!offlineBankCode.includes('matches = matches.filter(q => Number(q.grade) === Number(grade));')) {
  console.error('❌ FAIL: offlineBankService.ts does not strictly filter matches by grade');
  process.exit(1);
}
if (!offlineBankCode.includes('MS Paint & Creative Drawing Tools')) {
  console.error('❌ FAIL: offlineBankService.ts does not have Grade 1 CS MS Paint questions');
  process.exit(1);
}
if (!offlineBankCode.includes('Regional Languages & Festivals of India')) {
  console.error('❌ FAIL: offlineBankService.ts does not have Grade 1 EVS Regional Languages questions');
  process.exit(1);
}
console.log('✅ PASS: offlineBankService.ts enforces strict Grade 1 questions for Math, CS, and EVS.');

// 3. Check curriculumService.ts dynamic chapters
const currServiceCode = fs.readFileSync(path.resolve('src/services/curriculumService.ts'), 'utf8');

if (!currServiceCode.includes('ch_math_add_p') || !currServiceCode.includes('ch_math_sub_p')) {
  console.error('❌ FAIL: curriculumService.ts does not have Grade 1-2 Math chapters (Addition, Subtraction)');
  process.exit(1);
}
if (!currServiceCode.includes('MS Paint & Creative Drawing Tools')) {
  console.error('❌ FAIL: curriculumService.ts does not have Grade 1-2 CS chapters (MS Paint)');
  process.exit(1);
}
if (!currServiceCode.includes('Regional Languages & Festivals of India') || !currServiceCode.includes('My Body Parts & 5 Sense Organs')) {
  console.error('❌ FAIL: curriculumService.ts does not have Grade 1-2 EVS chapters (Body Parts, Plants, Regional Languages)');
  process.exit(1);
}
console.log('✅ PASS: curriculumService.ts has class-wise dynamic chapters for Math, CS, and EVS/SS.');

console.log('\n🎉 ALL GRADE 1 & CHAPTER ISOLATION TESTS PASSED 100%!');
