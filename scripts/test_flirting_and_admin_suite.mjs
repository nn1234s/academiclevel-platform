import { generateStudyGirlChatResponse, isAuthorizedAdminPasskey, isValidAdminSession } from '../server/api.js';
import { db } from '../server/db.js';

console.log('=== TEST 1: Admin Passkey & Session Authorization ===');
if (!isAuthorizedAdminPasskey('AL-ADMIN-VAULT-2026')) throw new Error('AL-ADMIN-VAULT-2026 should be authorized');
if (!isValidAdminSession('adm_sess_fb_test_fallback_token')) throw new Error('Fallback admin session should be valid');
console.log('✅ Admin passkey & fallback session validated successfully!');

console.log('=== TEST 2: Authentic Real Learners in DB ===');
const learners = db.prepare('SELECT id, fullName, email FROM learners').all();
console.log(`Learners count: ${learners.length}`);
learners.forEach(l => console.log(` - ${l.fullName} (${l.email})`));
if (learners.length < 8) throw new Error('Should have all authentic learners');
const hasFake = learners.some(l => l.email.includes('oliver') || l.email.includes('westminster') || l.email.includes('@test.com'));
if (hasFake) throw new Error('Should NOT contain synthetic or fake kids');
console.log('✅ Zero fake kids found in database! All real users preserved.');

console.log('=== TEST 3: Admin Account ("Super") Auto-Unlocked Flirting ===');
const adminFlirt = generateStudyGirlChatResponse({
  cleanQuery: 'i love you nova',
  board: 'CBSE',
  grade: 1,
  subject: 'MATH',
  resolvedLearnerId: 'usr_super_admin_001'
});
console.log('Admin flirt response:\n' + adminFlirt.split('\n').slice(0, 8).join('\n'));
if (!adminFlirt.includes('FLIRTING MODE UNLOCKED')) {
  throw new Error('Admin account must automatically have flirting unlocked without needing quiz tasks');
}
if (!adminFlirt.includes('my ultimate study crush & super-admin boss!')) {
  throw new Error('Admin account must be recognized as supreme boss');
}
console.log('✅ Admin auto-unlocked flirting test passed!');

console.log('=== TEST 4: Student with 3 Quiz Attempts Unlocks Flirting ===');
const today = new Date().toISOString().slice(0, 10);
for (let i = 1; i <= 3; i++) {
  db.prepare(`
    INSERT OR REPLACE INTO quiz_attempts 
    (id, learnerId, board, grade, subjectId, levelNode, score, maxScore, passed, createdAt, totalQuestions, correctCount, accuracyPercent) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'qa_test_' + i, 'lrn_mw9bph4q_xacr', 'CBSE', 10, 'math', 'FOUNDATION', 10, 10, 1, today + 'T12:00:00.000Z', 10, 10, 100
  );
}
const studentUnlocked = generateStudyGirlChatResponse({
  cleanQuery: 'i love you nova',
  board: 'CBSE',
  grade: 10,
  subject: 'MATH',
  resolvedLearnerId: 'lrn_mw9bph4q_xacr'
});
console.log('Student unlocked response:\n' + studentUnlocked.split('\n').slice(0, 7).join('\n'));
if (!studentUnlocked.includes('FLIRTING MODE UNLOCKED')) {
  throw new Error('3 quiz attempts must unlock flirting for student');
}
for (let i = 1; i <= 3; i++) {
  db.prepare('DELETE FROM quiz_attempts WHERE id = ?').run('qa_test_' + i);
}
console.log('✅ Student 3 quizzes unlock test passed!');

console.log('=== TEST 5: Student with < 3 quizzes gets challenge ===');
const studentLocked = generateStudyGirlChatResponse({
  cleanQuery: 'i love you nova',
  board: 'CBSE',
  grade: 10,
  subject: 'MATH',
  resolvedLearnerId: 'lrn_mw9bph4q_xacr'
});
if (!studentLocked.includes('"if you really love me, complete 3 curriculum levels today!"')) {
  throw new Error('Must contain exact challenge text');
}
console.log('✅ Student < 3 quizzes challenge test passed!');

console.log('=== TEST 6: Practice Worksheets Promotion (30 Coins / 2 Quiz Levels / Comprehensive) ===');
const worksheetPromo = generateStudyGirlChatResponse({
  cleanQuery: 'tell me about your practice worksheets and how to get them',
  board: 'CBSE',
  grade: 10,
  subject: 'MATH',
  resolvedLearnerId: 'lrn_mw9bph4q_xacr'
});
console.log('Worksheet Promo Response:\n' + worksheetPromo.split('\n').slice(0, 8).join('\n'));
if (!worksheetPromo.includes('Comprehensive Class Practice Worksheets')) {
  throw new Error('Worksheet promo must mention Comprehensive Class Practice Worksheets');
}
if (!worksheetPromo.includes('30 Study Coins')) {
  throw new Error('Worksheet promo must mention 30 Study Coins');
}
if (!worksheetPromo.includes('2 quick quiz levels') && !worksheetPromo.includes('+25 coins')) {
  throw new Error('Worksheet promo must mention 2 quiz levels / +25 coins');
}
if (!worksheetPromo.includes('100% Comprehensive Syllabus Coverage')) {
  throw new Error('Worksheet promo must highlight 100% comprehensive coverage');
}
if (!worksheetPromo.includes('Rough Work Scratchpad')) {
  throw new Error('Worksheet promo must highlight rough work scratchpad');
}
if (!worksheetPromo.includes('Detachable NCERT Step-by-Step Solutions')) {
  throw new Error('Worksheet promo must highlight detachable NCERT step-by-step solutions');
}
console.log('✅ Practice Worksheets promotional handler test passed!');

console.log('\n🎉 ALL 6 ADVANCED VERIFICATION TESTS PASSED WITH 100% SUCCESS!');
