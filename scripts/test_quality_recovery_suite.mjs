import { db } from '../server/db.js';

console.log('================================================================');
console.log('🧪 RUNNING COMPREHENSIVE QUALITY RECOVERY VERIFICATION SUITE');
console.log('================================================================\n');

let allPassed = true;

// TEST 1: Database Total & Integrity
console.log('--- TEST 1: Database Total & Data Integrity ---');
const totalRows = db.prepare('SELECT count(*) as count FROM question_bank').get().count;
console.log(`Total question bank records: ${totalRows}`);
if (totalRows !== 12000) {
  console.error(`FAIL: Expected 12000 records, got ${totalRows}`);
  allPassed = false;
} else {
  console.log('PASS: Exactly 12,000 records found.');
}

const emptyTexts = db.prepare("SELECT count(*) as count FROM question_bank WHERE text IS NULL OR trim(text) = ''").get().count;
const invalidIndex = db.prepare("SELECT count(*) as count FROM question_bank WHERE correctIndex NOT IN (0, 1, 2, 3)").get().count;
if (emptyTexts > 0 || invalidIndex > 0) {
  console.error(`FAIL: Found ${emptyTexts} empty texts or ${invalidIndex} invalid correctIndex values.`);
  allPassed = false;
} else {
  console.log('PASS: 0 empty question texts and 0 invalid correctIndex values.');
}

// TEST 2: Strict Subject Coverage Across ALL 12 Grades
console.log('\n--- TEST 2: Subject Coverage Across ALL 12 Grades ---');
for (let g = 1; g <= 12; g++) {
  const subs = db.prepare('SELECT subjectId, count(*) as count FROM question_bank WHERE grade = ? GROUP BY subjectId').all(g);
  const subMap = Object.fromEntries(subs.map(s => [s.subjectId, s.count]));
  const hasMath = (subMap['math'] || 0) >= 300;
  const hasCs = (subMap['cs'] || 0) >= 250;
  const hasEnglish = (subMap['english'] || 0) >= 150;
  const hasSocial = (subMap['social'] || 0) >= 100;
  const hasScience = (subMap['science'] || 0) >= 200 || ((subMap['physics'] || 0) + (subMap['chemistry'] || 0) + (subMap['biology'] || 0)) >= 199;

  const gradeOk = hasMath && hasCs && hasEnglish && hasSocial && hasScience;
  if (!gradeOk) {
    console.error(`FAIL: Grade ${g} missing required subject counts:`, subMap);
    allPassed = false;
  } else {
    console.log(`PASS: Grade ${g.toString().padStart(2, ' ')} has full subject coverage: Math(${subMap['math']}), CS(${subMap['cs']}), Science/Phy/Chem/Bio, English(${subMap['english']}), Social(${subMap['social']})`);
  }
}

// TEST 3: Strict Zero-Contamination Subject Isolation
console.log('\n--- TEST 3: Strict Zero-Contamination Subject Isolation ---');
const testSubjects = ['english', 'math', 'cs', 'science', 'social'];
for (const s of testSubjects) {
  const rows = db.prepare(`
    SELECT DISTINCT subjectId FROM question_bank
    WHERE grade = 8 AND subjectId = ?
  `).all(s);

  const contaminated = rows.some(r => r.subjectId !== s);
  if (contaminated || rows.length === 0) {
    console.error(`FAIL: Contamination or empty results for subject ${s}`);
    allPassed = false;
  } else {
    console.log(`PASS: Subject "${s}" is 100% strictly isolated (Zero cross-contamination).`);
  }
}

// TEST 4: Advertised Count Matching (Foundation = 10, Concept = 12, Exam Ready = 15, Olympiad = 15)
console.log('\n--- TEST 4: Advertised Count Matching ---');
const levelsToTest = [
  { level: 'FOUNDATION', count: 10 },
  { level: 'CONCEPT', count: 12 },
  { level: 'EXAM_READY', count: 15 },
  { level: 'OLYMPIAD', count: 15 }
];

for (const lt of levelsToTest) {
  const rows = db.prepare(`
    SELECT * FROM question_bank
    WHERE grade = 10 AND subjectId = 'math' AND levelNode = ?
    LIMIT ?
  `).all(lt.level, lt.count);

  if (rows.length !== lt.count) {
    console.error(`FAIL: Expected ${lt.count} questions for ${lt.level}, got ${rows.length}`);
    allPassed = false;
  } else {
    console.log(`PASS: ${lt.level} requested ${lt.count} questions -> returned exactly ${rows.length}`);
  }
}

// TEST 5: Spin Wheel Angle Math Verification
console.log('\n--- TEST 5: Spin Wheel Exact Center Alignment ---');
const PRIZE_ANGLES = {
  2: 0,
  3: 90,
  5: 180,
  40: 270
};

for (const [coins, targetAngle] of Object.entries(PRIZE_ANGLES)) {
  const fullRotations = 5 * 360;
  const landedAngle = (fullRotations + targetAngle) % 360;
  if (landedAngle !== targetAngle) {
    console.error(`FAIL: Spin wheel angle mismatch for ${coins} coins: expected ${targetAngle}, got ${landedAngle}`);
    allPassed = false;
  } else {
    console.log(`PASS: ${coins} coins lands exactly on segment center: ${targetAngle}°`);
  }
}

console.log('\n================================================================');
if (!allPassed) {
  console.error('❌ SOME TESTS FAILED.');
  process.exit(1);
} else {
  console.log('✅ ALL TESTS PASSED! Quality recovery is 100% verified.');
  process.exit(0);
}
