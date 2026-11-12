import { db } from '../server/db.js';
const rows = db.prepare('SELECT id, fullName, email, quizzesCompletedCount, levelsCompletedCount FROM learners').all();
console.table(rows);
