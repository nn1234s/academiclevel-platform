import { db } from '../server/db.js';

console.log('=== VERIFYING SPECIAL49 ACCOUNT & MULTI-IDENTIFIER LOOKUP ===');

// 1. Verify 9861439460@special49.academiclevel.in exists and has active PLUS
const specLearner = db.prepare(`SELECT * FROM learners WHERE email = ?`).get('9861439460@special49.academiclevel.in');
console.log('Found Special49 Learner:', specLearner);
if (!specLearner) throw new Error('9861439460@special49.academiclevel.in not found in database!');

const specSub = db.prepare(`
  SELECT * FROM subscriptions 
  WHERE learnerId = ? AND status = 'ACTIVE' AND datetime(expiresAt) > datetime('now')
`).get(specLearner.id);
console.log('Found Special49 Active Subscription:', specSub);
if (!specSub) throw new Error('Active subscription not found for 9861439460@special49.academiclevel.in!');

// 2. Test Multi-Identifier Login Simulation (by email, by phone digits, by international phone)
const testQueries = ['9861439460@special49.academiclevel.in', '9861439460', '+919861439460'];

for (const input of testQueries) {
  const cleanEmail = String(input).trim().toLowerCase();
  const phoneDigits = cleanEmail.replace(/[^0-9]/g, '');
  const matched = db.prepare(`
    SELECT * FROM learners 
    WHERE email = ? 
       OR (phone IS NOT NULL AND phone = ?)
       OR (phone IS NOT NULL AND phone = ?)
       OR (phone IS NOT NULL AND phone = ?)
       OR email = ?
  `).get(
    cleanEmail,
    cleanEmail,
    phoneDigits,
    phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits,
    phoneDigits.length >= 10 ? `${phoneDigits.slice(-10)}@special49.academiclevel.in` : cleanEmail
  );

  if (!matched) {
    throw new Error(`Failed to match learner for login input: "${input}"`);
  }
  console.log(`✔ Query "${input}" successfully resolved to learner: ${matched.id} (${matched.email})`);
}

// 3. Test wewewe account (also linked to phone 9861439460)
const weweweLearner = db.prepare(`SELECT * FROM learners WHERE id = 'lrn_mw9bph4q_xacr'`).get();
const weweweSub = db.prepare(`
  SELECT * FROM subscriptions 
  WHERE learnerId = 'lrn_mw9bph4q_xacr' AND status = 'ACTIVE' AND datetime(expiresAt) > datetime('now')
`).get();
console.log('Wewewe Active Sub:', weweweSub);
if (!weweweSub) throw new Error('Wewewe active subscription missing!');

console.log('\nALL SPECIAL49 CHECKS PASSED WITH 100% SUCCESS!');
