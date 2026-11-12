import { initDatabaseSchema, db } from '../server/db.js';

console.log('Initializing schema and checking learners table columns...');
initDatabaseSchema();

const cols = db.prepare('PRAGMA table_info(learners)').all();
console.log('Learners columns:', cols.map(c => c.name));

const hasDaily = cols.some(c => c.name === 'dailyAiMessagesUsed');
const hasDate = cols.some(c => c.name === 'lastAiMessageDateUtc');
const hasBonus = cols.some(c => c.name === 'bonusAiMessages');

console.log(`Schema check: dailyAiMessagesUsed=${hasDaily}, lastAiMessageDateUtc=${hasDate}, bonusAiMessages=${hasBonus}`);
