import { db } from '../server/db.js';

console.log('Testing scholarship creation with "ALL" values...');

const duration = 7;
const now = new Date();
const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
const schId = 'sch_test_all_' + Date.now().toString(36);
const adminEmail = 'admin@academiclevel.in';

const targetGrade = 'ALL';
const targetBoard = 'ALL';

// What happens if we do cleanGrade and cleanBoard:
const cleanGrade = (targetGrade && targetGrade !== 'ALL') ? Number(targetGrade) : null;
const cleanBoard = (targetBoard && targetBoard !== 'ALL') ? String(targetBoard).trim() : null;

console.log('cleanGrade:', cleanGrade); // should be null
console.log('cleanBoard:', cleanBoard); // should be null

db.prepare(`
  INSERT INTO scholarships (
    id, title, description, targetQuizCount, rewardCoins, durationDays,
    targetGrade, targetBoard, badgeTitle, maxRecipients, claimedCount,
    isActive, startDate, endDate, createdBy, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  schId,
  'Sprint for All Classes & Boards',
  'Complete 10 quizzes for 250 coins',
  10,
  250,
  duration,
  cleanGrade,
  cleanBoard,
  '🏆 Winner',
  0,
  0,
  1,
  now.toISOString(),
  endDate.toISOString(),
  adminEmail,
  now.toISOString(),
  now.toISOString()
);

const created = db.prepare('SELECT * FROM scholarships WHERE id = ?').get(schId);
console.log('Created scholarship record:', created);

// Query for student in Grade 5, CBSE:
const studentSchs = db.prepare(`
  SELECT * FROM scholarships 
  WHERE isActive = 1 
  AND (targetGrade IS NULL OR targetGrade = ?)
  AND (targetBoard IS NULL OR targetBoard = ?)
`).all(5, 'CBSE');

console.log('Student Grade 5 CBSE matches:', studentSchs.length);

db.prepare('DELETE FROM scholarships WHERE id = ?').run(schId);
console.log('Cleaned up test.');
