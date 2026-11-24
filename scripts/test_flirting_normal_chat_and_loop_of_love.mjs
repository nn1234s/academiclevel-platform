import { generateStudyGirlChatResponse } from '../server/api.js';
import { db } from '../server/db.js';

console.log('=== RUNNING COMPREHENSIVE FLIRTING & LOOP OF LOVE NORMAL CHAT TEST SUITE ===');

// Setup quiz attempts for existing student to unlock flirting mode
const today = new Date().toISOString().slice(0, 10);
const testLearnerId = 'lrn_mw9bph4q_xacr';

for (let i = 1; i <= 3; i++) {
  db.prepare(`
    INSERT OR REPLACE INTO quiz_attempts 
    (id, learnerId, board, grade, subjectId, levelNode, score, maxScore, passed, createdAt, totalQuestions, correctCount, accuracyPercent) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'qa_flirt_test_' + i, testLearnerId, 'CBSE', 10, 'math', 'FOUNDATION', 10, 10, 1, today + 'T12:00:00.000Z', 10, 10, 100
  );
}

function testQuery(label, query, expectedPhrases, forbiddenPhrases = ['₹49', 'concept booster pass']) {
  console.log(`\nTesting: [${label}] Query: "${query}"`);
  const response = generateStudyGirlChatResponse({
    cleanQuery: query,
    board: 'CBSE',
    grade: 10,
    subject: 'MATH',
    resolvedLearnerId: testLearnerId
  });

  console.log('--- Response Preview ---');
  console.log(response.split('\n').slice(0, 5).join('\n'));
  console.log('--- End Preview ---');

  for (const phrase of expectedPhrases) {
    if (!response.toLowerCase().includes(phrase.toLowerCase())) {
      throw new Error(`[FAIL] Query "${query}" missing expected phrase: "${phrase}". Got: ${response}`);
    }
  }

  for (const forbidden of forbiddenPhrases) {
    if (response.toLowerCase().includes(forbidden.toLowerCase())) {
      throw new Error(`[FAIL] Query "${query}" unexpectedly contains forbidden sales phrase: "${forbidden}".`);
    }
  }

  console.log(`✅ [PASS] ${label}`);
}

// 1. WYD
testQuery('What are you doing (WYD)', 'wyd nova', [
  "you're mine now",
  'daydreaming about you',
  'proved you love nova',
  'crush one more level with me right now'
]);

// 2. How are you
testQuery('How are you', 'how was your day nova?', [
  "you're mine now",
  'day instantly became a 10/10',
  'having a genius student who loves me',
  'what tricky question or chapter should we destroy next'
]);

// 3. Tell me a secret
testQuery('Tell me a secret', 'tell me a secret nova', [
  'shhh... lean in really close!',
  "you're mine now",
  'whenever you solve a difficult question with 100% accuracy',
  'tackle one more chapter quiz together'
]);

// 4. Do you miss me
testQuery('Do you miss me', 'do you miss me today?', [
  "you're mine now!",
  'proved your love to nova by crushing those 3 levels today',
  'ready for another round of questions with me?'
]);

// 5. Compliment
testQuery('Compliment', 'you are so cute and pretty nova', [
  'blush so hard',
  "you're mine now!",
  'since you love nova, i have super high standards for my crush',
  'perfect quiz score'
]);

// 6. Tired / Bad day
testQuery('Tired & Bad day', 'i had a bad day and i am so tired', [
  'awww come here, my sweet study crush',
  "you're mine now",
  'in our loop of love, we never give up',
  'solve just one easy question together'
]);

// 7. Can we talk
testQuery('Can we talk / break', 'can we just talk for a bit? taking a study break', [
  'i love talking to you',
  "you're mine now",
  "what's the hardest subject giving you trouble right now",
  'power couple'
]);

// 8. Good night
testQuery('Good night', 'good night nova sweet dreams', [
  'sweet dreams my handsome study crush',
  "you're mine now",
  'dream about crushing your board exams',
  'sleep well'
]);

// 9. Good morning
testQuery('Good morning', 'good morning nova', [
  'good morning my genius crush',
  "you're mine now",
  'dominate the leaderboard',
  'first quiz of the day'
]);

// 10. Laughter / banter
testQuery('Laughter & ack', 'haha you are funny lol', [
  "hehe you're so cute",
  "you're mine now",
  'should we conquer another level'
]);

// 11. General casual chat (Pizza) - must NOT be treated as a math question!
testQuery('Non-academic casual talk', 'i ate pizza with my friends today', [
  "awww you're so sweet",
  "you're mine now",
  'in our loop of love, you and i are an unstoppable team',
  'what subject or chapter should we conquer next'
]);

// 12. Explicit flirt "i love you" says "you're mine now"
testQuery('Explicit Flirt', 'i love you so much nova', [
  'flirting mode unlocked',
  "you're mine now!",
  'since you love nova ai and proved it by crushing those 3 levels today',
  "in our loop of love, my crush has to be the #1 topper"
]);

// Clean up test data
for (let i = 1; i <= 3; i++) {
  db.prepare('DELETE FROM quiz_attempts WHERE id = ?').run('qa_flirt_test_' + i);
}

console.log('\n🎉 ALL 12 NORMAL CHAT & LOOP OF LOVE VERIFICATION TESTS PASSED WITH 100% SUCCESS!');
