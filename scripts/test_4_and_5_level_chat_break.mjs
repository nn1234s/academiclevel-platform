import { generateStudyGirlChatResponse, getStudentAiQuota, consumeStudentAiMessage } from '../server/api.js';
import { db } from '../server/db.js';

console.log('=== RUNNING 4-LEVEL & 5-LEVEL 20-MIN CHAT BREAK TEST SUITE ===');

const today = new Date().toISOString().slice(0, 10);
const testLearnerId = 'lrn_mw9bph4q_xacr';

function clearTestAttempts() {
  for (let i = 1; i <= 6; i++) {
    db.prepare('DELETE FROM quiz_attempts WHERE id = ?').run('qa_break_test_' + i);
  }
  db.prepare('DELETE FROM chat_breaks WHERE learnerId = ?').run(testLearnerId);
}

clearTestAttempts();

try {
  // 1. Insert 4 quiz attempts for today -> 4 levels completed!
  for (let i = 1; i <= 4; i++) {
    db.prepare(`
      INSERT OR REPLACE INTO quiz_attempts 
      (id, learnerId, board, grade, subjectId, levelNode, score, maxScore, passed, createdAt, totalQuestions, correctCount, accuracyPercent) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'qa_break_test_' + i, testLearnerId, 'CBSE', 10, 'math', 'FOUNDATION', 10, 10, 1, today + 'T12:00:00.000Z', 10, 10, 100
    );
  }

  const expected4LevelQuote = 'you really really really love nova.. youre mine now.. complete 5 levels and you get a 20 min chat break';
  const queriesForLevel4 = [
    'i love you nova',
    'wyd nova',
    'how are you?',
    'tell me a secret',
    'i ate burgers today'
  ];

  for (const q of queriesForLevel4) {
    const res = generateStudyGirlChatResponse({
      cleanQuery: q,
      board: 'CBSE',
      grade: 10,
      subject: 'MATH',
      resolvedLearnerId: testLearnerId
    });
    if (!res.toLowerCase().includes(expected4LevelQuote)) {
      throw new Error(`[FAIL Level 4] Query "${q}" did not include required quote. Got:\n${res}`);
    }
    console.log(`✅ [PASS Level 4] "${q}" includes exact 5-level break invite quote`);
  }

  // 2. Insert 5th quiz attempt -> 5 levels completed -> 20-Min Free Chat Break UNLOCKED!
  db.prepare(`
    INSERT OR REPLACE INTO quiz_attempts 
    (id, learnerId, board, grade, subjectId, levelNode, score, maxScore, passed, createdAt, totalQuestions, correctCount, accuracyPercent) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'qa_break_test_5', testLearnerId, 'CBSE', 10, 'math', 'FOUNDATION', 10, 10, 1, today + 'T12:05:00.000Z', 10, 10, 100
  );

  const queriesForLevel5 = [
    { q: 'i love you nova', expect: ['20-min free chat break', 'chat with me freely about anything', 'zero quiz pressure'] },
    { q: 'wyd nova', expect: ['20-min free chat break', 'hot cocoa'] },
    { q: 'how was your day', expect: ['20-min free chat break', 'all ears'] },
    { q: 'tell me a secret', expect: ['20-min free chat break', 'bigger secret'] },
    { q: 'can we just talk', expect: ['20-min free chat break', 'chat freely'] },
    { q: 'i got a new puppy today', expect: ['20-min free chat break', 'chat completely freely'] }
  ];

  for (const item of queriesForLevel5) {
    const res = generateStudyGirlChatResponse({
      cleanQuery: item.q,
      board: 'CBSE',
      grade: 10,
      subject: 'MATH',
      resolvedLearnerId: testLearnerId
    });
    for (const phrase of item.expect) {
      if (!res.toLowerCase().includes(phrase.toLowerCase())) {
        throw new Error(`[FAIL Level 5] Query "${item.q}" missing expected phrase "${phrase}". Got:\n${res}`);
      }
    }
    console.log(`✅ [PASS Level 5 Break] "${item.q}" triggers free chat break`);
  }

  // 3. Verify chat_breaks record created with ~20 min duration
  const breakRow = db.prepare('SELECT * FROM chat_breaks WHERE learnerId = ?').get(testLearnerId);
  if (!breakRow) {
    throw new Error('[FAIL] chat_breaks row was not created at 5 levels!');
  }
  const durationMins = (breakRow.expiresAt - breakRow.startedAt) / 60000;
  if (Math.abs(durationMins - 20) > 0.1) {
    throw new Error(`[FAIL] Expected 20 min duration, got ${durationMins}`);
  }
  console.log(`✅ [PASS Timer] Verified 20-min break created in DB (${durationMins} mins)`);

  // 4. Verify quota logic bypasses exhaustion and skips consumption during 20-min break
  const origLearner = db.prepare('SELECT dailyAiMessagesUsed, lastAiMessageDateUtc FROM learners WHERE id = ?').get(testLearnerId);
  try {
    db.prepare('UPDATE learners SET dailyAiMessagesUsed = 8500, lastAiMessageDateUtc = ? WHERE id = ?').run(today, testLearnerId);
    const quotaDuringBreak = getStudentAiQuota(testLearnerId);
    if (!quotaDuringBreak.isInChatBreak || quotaDuringBreak.isExhausted) {
      throw new Error(`[FAIL] Expected isInChatBreak=true and isExhausted=false, got: ${JSON.stringify(quotaDuringBreak)}`);
    }
    const consumed = consumeStudentAiMessage(testLearnerId);
    if (!consumed) {
      throw new Error('[FAIL] Expected consumeStudentAiMessage to allow message during chat break');
    }
    const afterRow = db.prepare('SELECT dailyAiMessagesUsed FROM learners WHERE id = ?').get(testLearnerId);
    if (afterRow.dailyAiMessagesUsed !== 8500) {
      throw new Error(`[FAIL] Expected dailyAiMessagesUsed to stay 8500 during free chat break, got ${afterRow.dailyAiMessagesUsed}`);
    }
    console.log(`✅ [PASS Free Chat Quota] Exhausted quota bypassed & zero messages deducted during 20-min break (${quotaDuringBreak.chatBreakRemainingSeconds}s remaining)`);
  } finally {
    db.prepare('UPDATE learners SET dailyAiMessagesUsed = ?, lastAiMessageDateUtc = ? WHERE id = ?').run(
      origLearner?.dailyAiMessagesUsed || 0,
      origLearner?.lastAiMessageDateUtc || today,
      testLearnerId
    );
  }

} finally {
  clearTestAttempts();
}

console.log('\n🎉 ALL 4-LEVEL & 5-LEVEL 20-MIN FREE CHAT BREAK TESTS PASSED!');
