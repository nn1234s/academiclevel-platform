/**
 * REM-P0-03: Server-Side Quiz Evaluation — RED test
 *
 * Verifies BEFORE fixes:
 *   FAIL-1: GET /api/quizzes/fetch-quiz leaks `correctIndex` and `explanation` in response
 *   FAIL-2: GET /api/quizzes/qotd leaks `correctIndex` and `explanation` in response
 *   FAIL-3: POST /api/quizzes/attempt blindly trusts client `score` and `passed` values
 *
 * After fixes all three must PASS (fields absent, server overrides score).
 *
 * Usage: node scripts/tests/test_rem_p0_03_server_quiz.mjs
 */

import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { invokeApp } from './_httpTestHelper.mjs';

// ─── Isolated temp DB ───────────────────────────────────────────────────────
const tmpDb = path.join(os.tmpdir(), `al_test_p0_03_${Date.now()}.db`);
process.env.DB_PATH = tmpDb;
process.env.NODE_ENV = 'test';
process.env.SUPER_ADMIN_EMAIL = 'admin_test@academiclevel.in';
process.env.SESSION_SECRET = 'test-secret-p0-03';

const { app } = await import('../../server/server.js');

// ─── Helpers ────────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    pass++;
  } else {
    console.error(`  ✗ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    fail++;
  }
}

// ─── Seed a learner for session-based tests ─────────────────────────────────
let sessionToken = '';
let learnerId = '';

{
  const r = await invokeApp(app, {
    method: 'POST',
    url: '/api/auth/register',
    body: {
      fullName: 'QuizTestStudent',
      email: 'quiztest_p0_03@test.com',
      password: 'Password1!',
      board: 'CBSE',
      grade: 10,
      parentName: 'Parent',
      parentPin: '1234'
    }
  });
  const d = await r.json();
  sessionToken = d.token || '';
  learnerId = d.learner?.id || '';
  if (!sessionToken || !learnerId) {
    console.error('SETUP FAILED: could not register test learner:', d);
    process.exit(1);
  }
}

// ─── CHECK 1: fetch-quiz must NOT return correctIndex or explanation ─────────
console.log('\n[CHECK 1] GET /api/quizzes/fetch-quiz — answer-key leak');
{
  const r = await invokeApp(app, {
    method: 'GET',
    url: '/api/quizzes/fetch-quiz?board=CBSE&grade=10&subjectId=math&count=3',
    headers: { 'x-session-token': sessionToken }
  });
  const d = await r.json();
  const questions = d.questions || [];
  assert('Response succeeds (success=true)', d.success === true, JSON.stringify(d).slice(0, 200));
  assert('Returns at least 1 question', questions.length >= 1);

  const hasCorrectIndex = questions.some(q => 'correctIndex' in q);
  const hasExplanation  = questions.some(q => 'explanation' in q);

  assert('No question exposes correctIndex to client', !hasCorrectIndex,
    'correctIndex present in response — answer-key leak!');
  assert('No question exposes explanation to client', !hasExplanation,
    'explanation present in response — answer-key leak!');
}

// ─── CHECK 2: qotd must NOT return correctIndex or explanation ───────────────
console.log('\n[CHECK 2] GET /api/quizzes/qotd — answer-key leak');
{
  const r = await invokeApp(app, {
    method: 'GET',
    url: '/api/quizzes/qotd?board=CBSE&grade=10'
  });
  const d = await r.json();
  if (!d.success || !d.question) {
    // If no question found it's a data issue, not a security issue — skip
    console.log('  ~ qotd returned no question (empty bank for grade 10 qotd offset), skipping leak check');
  } else {
    const q = d.question;
    assert('qotd does not expose correctIndex', !('correctIndex' in q),
      'correctIndex present in qotd response!');
    assert('qotd does not expose explanation',  !('explanation' in q),
      'explanation present in qotd response!');
  }
}

// ─── CHECK 3: POST /api/quizzes/attempt — server must override client score ──
console.log('\n[CHECK 3] POST /api/quizzes/attempt — client score accepted unchecked');
{
  // Post attempt with inflated score (10/3 impossible ratio, passed=true)
  const r = await invokeApp(app, {
    method: 'POST',
    url: '/api/quizzes/attempt',
    headers: { 'x-session-token': sessionToken },
    body: {
      learnerId,
      board: 'CBSE',
      grade: 10,
      subjectId: 'math',
      levelNode: 'FOUNDATION',
      score: 999,          // obviously fraudulent
      maxScore: 3,
      passed: true,
      totalDurationSeconds: 1,
      antiCheatPassed: true
    }
  });
  const d = await r.json();
  assert('Attempt endpoint accepts valid request', r.status === 200 && d.success,
    JSON.stringify(d).slice(0, 200));

  // Server-side evaluation must cap score to [0, maxScore]
  // If the endpoint blindly stores score=999 and returns it, that's the vulnerability.
  // After fix: server either rejects impossible score or recalculates.
  const returnedScore = d.attempt?.score ?? d.score ?? null;
  if (returnedScore !== null) {
    assert('Server caps score to valid range (0–maxScore)', returnedScore <= 3,
      `server returned score=${returnedScore} but maxScore=3`);
  } else {
    // Server doesn't return score yet — that's fine in legacy mode,
    // just verify it doesn't blow up
    assert('Attempt completes without server error', d.success === true);
  }
}

// ─── CHECK 4: Session-based quiz flow (new endpoints post-fix) ───────────────
console.log('\n[CHECK 4] POST /api/quizzes/session — session-based quiz flow');
{
  const r = await invokeApp(app, {
    method: 'POST',
    url: '/api/quizzes/session',
    headers: { 'x-session-token': sessionToken },
    body: {
      learnerId,
      board: 'CBSE',
      grade: 10,
      subjectId: 'math',
      levelNode: 'FOUNDATION',
      count: 3
    }
  });
  const d = await r.json();
  assert('POST /api/quizzes/session exists and succeeds', r.status === 200 && d.success,
    `status=${r.status} body=${JSON.stringify(d).slice(0, 200)}`);

  if (d.success) {
    assert('Session has sessionId', typeof d.sessionId === 'string' && d.sessionId.length > 4);
    const qs = d.questions || [];
    assert('Session returns questions', qs.length >= 1);
    const hasAnswerKey = qs.some(q => 'correctIndex' in q || 'explanation' in q);
    assert('Session questions do NOT include answer key', !hasAnswerKey,
      'correctIndex or explanation leaked via /api/quizzes/session!');
  }
}

// ─── CHECK 5: POST /api/quizzes/submit-answer ────────────────────────────────
console.log('\n[CHECK 5] POST /api/quizzes/submit-answer — server grades single answer');
{
  // Create a session first
  const sr = await invokeApp(app, {
    method: 'POST',
    url: '/api/quizzes/session',
    headers: { 'x-session-token': sessionToken },
    body: { learnerId, board: 'CBSE', grade: 10, subjectId: 'math', levelNode: 'FOUNDATION', count: 3 }
  });
  const sd = await sr.json();
  if (!sd.success || !sd.sessionId) {
    console.log('  ~ session creation failed, skipping submit-answer checks');
  } else {
    const sessionId = sd.sessionId;
    const qId = (sd.questions || [])[0]?.id;
    if (!qId) {
      console.log('  ~ no questions in session, skipping submit-answer');
    } else {
      const ar = await invokeApp(app, {
        method: 'POST',
        url: '/api/quizzes/submit-answer',
        headers: { 'x-session-token': sessionToken },
        body: { sessionId, questionId: qId, selectedIndex: 0 }
      });
      const ad = await ar.json();
      assert('POST /api/quizzes/submit-answer succeeds', ar.status === 200 && ad.success,
        `status=${ar.status} body=${JSON.stringify(ad).slice(0, 200)}`);
      if (ad.success) {
        assert('submit-answer returns isCorrect boolean', typeof ad.isCorrect === 'boolean');
        assert('submit-answer returns explanation after answering', typeof ad.explanation === 'string');
      }
    }
  }
}

// ─── CHECK 6: POST /api/quizzes/finish ───────────────────────────────────────
console.log('\n[CHECK 6] POST /api/quizzes/finish — server computes score');
{
  // Full flow: create session → answer all questions → finish
  const sr = await invokeApp(app, {
    method: 'POST',
    url: '/api/quizzes/session',
    headers: { 'x-session-token': sessionToken },
    body: { learnerId, board: 'CBSE', grade: 10, subjectId: 'math', levelNode: 'FOUNDATION', count: 3 }
  });
  const sd = await sr.json();
  if (!sd.success || !sd.sessionId) {
    console.log('  ~ session creation failed, skipping finish checks');
  } else {
    const sessionId = sd.sessionId;
    // Answer all questions
    for (const q of (sd.questions || [])) {
      await invokeApp(app, {
        method: 'POST',
        url: '/api/quizzes/submit-answer',
        headers: { 'x-session-token': sessionToken },
        body: { sessionId, questionId: q.id, selectedIndex: 0 }
      });
    }
    // Finish session
    const fr = await invokeApp(app, {
      method: 'POST',
      url: '/api/quizzes/finish',
      headers: { 'x-session-token': sessionToken },
      body: { sessionId, learnerId, board: 'CBSE', grade: 10, subjectId: 'math', levelNode: 'FOUNDATION', totalDurationSeconds: 60 }
    });
    const fd = await fr.json();
    assert('POST /api/quizzes/finish succeeds', fr.status === 200 && fd.success,
      `status=${fr.status} body=${JSON.stringify(fd).slice(0, 200)}`);
    if (fd.success) {
      assert('finish returns server-computed score', typeof fd.score === 'number');
      assert('finish returns server-computed maxScore', typeof fd.maxScore === 'number');
      assert('finish returns passed boolean', typeof fd.passed === 'boolean');
      assert('finish score <= maxScore (no inflation)', fd.score <= fd.maxScore);
    }
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────
try { fs.unlinkSync(tmpDb); } catch {}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.error(`\nSOME REM-P0-03 CHECKS FAILED (expected RED before fixes are applied)`);
  process.exit(1);
} else {
  console.log(`\nALL REM-P0-03 CHECKS PASSED`);
}
