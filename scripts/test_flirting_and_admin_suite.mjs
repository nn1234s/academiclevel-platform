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

console.log('=== TEST 3: Flirting Checker (< 3 levels completed) ===');
const flirtLocked = generateStudyGirlChatResponse({
  cleanQuery: 'i... love you.',
  board: 'CBSE',
  grade: 10,
  subject: 'MATH',
  resolvedLearnerId: 'lrn_mw9bph4q_xacr'
});
console.log('Flirt locked response preview:');
console.log(flirtLocked.split('\n').slice(0, 8).join('\n'));
if (!flirtLocked.includes('"if you really love me, complete 3 curriculum levels today!"')) {
  throw new Error('Must contain exact prompt quote');
}
if (!flirtLocked.includes('0/3')) {
  throw new Error('Must show 0/3 progress');
}
console.log('✅ Flirting locked test passed!');

console.log('=== TEST 4: Flirting Checker (>= 3 levels completed) ===');
const today = new Date().toISOString().slice(0, 10);
for (let i = 1; i <= 3; i++) {
  db.prepare(`
    INSERT OR REPLACE INTO course_progress 
    (id, learnerId, board, grade, subjectId, levelNode, accuracy, passed, isCompleted, completedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cp_test_' + i, 'lrn_mw9bph4q_xacr', 'CBSE', 10, 'MATH', 'node_' + i, 100, 1, 1, today + 'T11:00:00.000Z'
  );
}
const flirtUnlocked = generateStudyGirlChatResponse({
  cleanQuery: 'i love you so much nova',
  board: 'CBSE',
  grade: 10,
  subject: 'MATH',
  resolvedLearnerId: 'lrn_mw9bph4q_xacr'
});
console.log('Flirt unlocked response preview:');
console.log(flirtUnlocked.split('\n').slice(0, 8).join('\n'));
if (!flirtUnlocked.includes('FLIRTING MODE UNLOCKED')) {
  throw new Error('Must unlock flirting mode');
}
for (let i = 1; i <= 3; i++) {
  db.prepare('DELETE FROM course_progress WHERE id = ?').run('cp_test_' + i);
}
console.log('✅ Flirting unlocked test passed!');

console.log('=== TEST 5: Casual Small Talk & Greetings ===');
const casualGreeting = generateStudyGirlChatResponse({
  cleanQuery: 'hiiii',
  board: 'CBSE',
  grade: 10,
  subject: 'MATH'
});
if (!casualGreeting.includes('psst... heyyy cutie!')) {
  throw new Error('Casual greeting must give cute study bestie vibe');
}
if (casualGreeting.includes('here is your breakdown for')) {
  throw new Error('Must not give breakdown for casual hi');
}
console.log('✅ Casual small talk test passed!');

console.log('\n🎉 ALL 5 INTEGRATION SUITE TESTS PASSED WITH 100% SUCCESS!');
