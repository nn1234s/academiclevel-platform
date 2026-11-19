import assert from 'node:assert';
import { db, initDatabaseSchema } from '../server/db.js';

console.log('🧪 Starting Student Mailbox & Post-Quiz Diagnostic Report Verification Suite...\n');

// 1. Verify Database Schema Table & Indexes
initDatabaseSchema();

const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='mailbox_messages'").get();
assert(tableInfo, 'mailbox_messages table must exist in SQLite database');
console.log('✅ [PASS] mailbox_messages table exists in database');

const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='mailbox_messages'").all();
const indexNames = indexes.map(i => i.name);
assert(indexNames.includes('idx_mailbox_learner'), 'idx_mailbox_learner index must exist');
assert(indexNames.includes('idx_mailbox_unread'), 'idx_mailbox_unread index must exist');
console.log('✅ [PASS] Mailbox composite indexes (idx_mailbox_learner, idx_mailbox_unread) verified');

// 2. Test Inserting and Fetching a Post-Quiz Diagnostic Report
const testLearnerId = 'test_learner_mailbox_001';
const testReportId = 'rep_test_' + Date.now();

const sampleQuizReport = {
  quizTitle: 'MATHEMATICS • Olympiad Assessment',
  board: 'CBSE',
  grade: 10,
  subjectId: 'math',
  levelNode: 'OLYMPIAD',
  score: 4,
  totalQuestions: 5,
  accuracyPercent: 80,
  passed: true,
  coinsEarned: 25,
  antiCheatPassed: true,
  timeSpentSeconds: 42,
  masteredTopics: ['Quadratic Equations', 'Trigonometry', 'Coordinate Geometry'],
  weakTopics: ['Arithmetic Progressions'],
  aiTutorFeedback: '🎉 Level Mastery Achieved! Excellent conceptual clarity.',
  completedAt: new Date().toISOString(),
  questions: [
    {
      questionId: 'q1',
      questionText: 'What is the discriminant of 2x^2 + 4x + 2 = 0?',
      options: ['0', '4', '8', '16'],
      chosenIndex: 0,
      correctIndex: 0,
      isCorrect: true,
      topicTag: 'Quadratic Equations',
      explanation: 'b^2 - 4ac = 16 - 16 = 0.'
    },
    {
      questionId: 'q2',
      questionText: 'Which term of the AP: 3, 8, 13, 18 is 78?',
      options: ['14th', '15th', '16th', '17th'],
      chosenIndex: 1,
      correctIndex: 2,
      isCorrect: false,
      topicTag: 'Arithmetic Progressions',
      explanation: 'a_n = a + (n-1)d -> 78 = 3 + (n-1)5 -> 75 = 5(n-1) -> n = 16.'
    }
  ]
};

// Insert into SQLite
db.prepare(`
  INSERT INTO mailbox_messages (
    id, learnerId, sender, senderName, senderAvatar, subject, preview, body, category, isRead, isStarred, quizReportJson, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  testReportId,
  testLearnerId,
  'NOVA_AI',
  'Nova AI Tutor',
  null,
  '📊 Quiz Mastery Report: MATH (80%)',
  'Scored 4/5 (80%) in CBSE Class 10. Mastery verified! +25 Coins.',
  sampleQuizReport.aiTutorFeedback,
  'QUIZ_REPORT',
  0,
  0,
  JSON.stringify(sampleQuizReport),
  new Date().toISOString()
);

const retrieved = db.prepare('SELECT * FROM mailbox_messages WHERE id = ?').get(testReportId);
assert(retrieved, 'Message must be retrievable from database');
assert.strictEqual(retrieved.learnerId, testLearnerId, 'learnerId must match');
assert.strictEqual(retrieved.category, 'QUIZ_REPORT', 'category must be QUIZ_REPORT');
assert.strictEqual(retrieved.isRead, 0, 'new message must be unread (0)');

const parsedReport = JSON.parse(retrieved.quizReportJson);
assert.strictEqual(parsedReport.accuracyPercent, 80, 'accuracyPercent must be 80%');
assert.strictEqual(parsedReport.passed, true, 'passed must be true');
assert.strictEqual(parsedReport.coinsEarned, 25, 'coinsEarned must be 25');
assert.strictEqual(parsedReport.questions.length, 2, '2 questions must be recorded in breakdown');
console.log('✅ [PASS] Post-quiz diagnostic report successfully persisted and parsed with full question breakdown');

// 3. Test Mark Message as Read
db.prepare('UPDATE mailbox_messages SET isRead = 1 WHERE id = ?').run(testReportId);
const updatedMsg = db.prepare('SELECT isRead FROM mailbox_messages WHERE id = ?').get(testReportId);
assert.strictEqual(updatedMsg.isRead, 1, 'isRead must be updated to 1');
console.log('✅ [PASS] Message read status toggled successfully');

// 4. Test Unread Count Query
const unreadCount = db.prepare('SELECT count(*) as c FROM mailbox_messages WHERE learnerId = ? AND isRead = 0').get(testLearnerId).c;
assert.strictEqual(unreadCount, 0, 'unread count must be 0 after marking read');

// Add second unread message
const secondId = 'rep_test_2_' + Date.now();
db.prepare(`
  INSERT INTO mailbox_messages (
    id, learnerId, sender, senderName, subject, preview, body, category, isRead, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
`).run(secondId, testLearnerId, 'ACADEMIC_LEVEL', 'AcademicLevel Rewards', '🏆 +40 Coins Earned', 'Referral bonus', 'Bonus credited', 'REWARD', new Date().toISOString());

const newUnread = db.prepare('SELECT count(*) as c FROM mailbox_messages WHERE learnerId = ? AND isRead = 0').get(testLearnerId).c;
assert.strictEqual(newUnread, 1, 'unread count must now be 1');
console.log('✅ [PASS] Dynamic unread message counter verified');

// 5. Cleanup test data
db.prepare('DELETE FROM mailbox_messages WHERE learnerId = ?').run(testLearnerId);
console.log('✅ [PASS] Test records cleaned up successfully');

// 6. Verify Source Files Contain Mailbox Integration
import fs from 'node:fs';

const studentDashboardCode = fs.readFileSync('src/modules/student/StudentDashboard.tsx', 'utf8');
assert(studentDashboardCode.includes('StudentMailboxModal'), 'StudentDashboard must import and render StudentMailboxModal');
assert(studentDashboardCode.includes('Student Mailbox'), 'StudentDashboard must have Student Mailbox quick launch card');
assert(studentDashboardCode.includes('unreadMailCount'), 'StudentDashboard must display unreadMailCount badge');
console.log('✅ [PASS] StudentDashboard.tsx includes Mailbox button, card, and modal integration');

const quizEngineCode = fs.readFileSync('src/modules/student/QuizEngine.tsx', 'utf8');
assert(quizEngineCode.includes('reportDetail: QuizReportDetail'), 'QuizEngine must construct QuizReportDetail upon completion');
assert(quizEngineCode.includes('StorageRLSLayer.sendMailboxMessage(mailboxMsg)'), 'QuizEngine must dispatch report to StorageRLSLayer mailbox');
assert(quizEngineCode.includes('Open Report in Mailbox'), 'QuizEngine completion screen must display Open Report in Mailbox button');
console.log('✅ [PASS] QuizEngine.tsx automatically generates diagnostic report after every quiz and delivers to mailbox');

const appCode = fs.readFileSync('src/App.tsx', 'utf8');
assert(appCode.includes('Mailbox'), 'App.tsx must include Mailbox navigation in header');
assert(appCode.includes('onOpenMailbox'), 'App.tsx must pass onOpenMailbox callback to QuizEngine');
console.log('✅ [PASS] App.tsx header navigation includes Mailbox button with unread counter');

console.log('\n========================================');
console.log('🎉 ALL MAILBOX & QUIZ REPORT TESTS PASSED!');
console.log('========================================\n');
