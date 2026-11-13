import { db, exportDbToJsonStore } from '../server/db.js';

console.log('--- Checking Prabir in DB ---');
const prabirCurrent = db.prepare("SELECT * FROM learners WHERE id = 'lrn_mw9asujp_rzun'").get();
console.log('Current Prabir learner:', prabirCurrent);

// If someone enters prabir2gmailc@gmail.com, we can insert an alias learner row or ensure both emails are linked to the same ID!
// In SQLite, email is UNIQUE in learners table.
// If an alias row for 'prabir2gmailc@gmail.com' does not exist, let's insert it:
const aliasExists = db.prepare("SELECT * FROM learners WHERE email = 'prabir2gmailc@gmail.com'").get();
if (!aliasExists) {
  const aliasId = 'lrn_prabir_alias_norm';
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO learners (
      id, email, fullName, board, grade, role, isActive,
      referralCode, referralQualified, currentStreakDays, longestStreakDays,
      coinBalance, passwordHash, passwordSalt, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    aliasId,
    'prabir2gmailc@gmail.com',
    prabirCurrent.fullName,
    prabirCurrent.board,
    prabirCurrent.grade,
    'STUDENT',
    1,
    'PRABIR-NORM',
    1,
    prabirCurrent.currentStreakDays,
    prabirCurrent.longestStreakDays,
    prabirCurrent.coinBalance,
    prabirCurrent.passwordHash,
    prabirCurrent.passwordSalt,
    now,
    now
  );

  // Link alias to active PLUS subscription as well
  db.prepare(`
    INSERT INTO subscriptions (
      id, learnerId, planTier, status, paymentMethod,
      amountInr, durationDays, startsAt, expiresAt, verifiedByAdmin,
      verifiedAt, invoiceNumber, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'sub_prabir_alias_plus',
    aliasId,
    'PLUS',
    'ACTIVE',
    'ADMIN_TRIAL',
    0,
    365,
    now,
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    'admin@academiclevel.in',
    now,
    'INV-PRABIR-ALIAS',
    now
  );
  console.log('Inserted normalized email alias and active PLUS subscription for prabir2gmailc@gmail.com');
} else {
  console.log('Alias already exists for prabir2gmailc@gmail.com');
}

exportDbToJsonStore();
console.log('exportDbToJsonStore() completed successfully!');
