import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || (process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'academiclevel_prod.db') : path.resolve(__dirname, './data/academiclevel_prod.db'));
const DATA_STORE_JSON = path.resolve(__dirname, '../data-store.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabaseSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS learners (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      fullName TEXT NOT NULL,
      phone TEXT,
      parentName TEXT,
      parentEmail TEXT,
      parentPin TEXT,
      board TEXT NOT NULL,
      grade INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'STUDENT',
      isActive INTEGER NOT NULL DEFAULT 1,
      quizzesCompletedCount INTEGER NOT NULL DEFAULT 0,
      levelsCompletedCount INTEGER NOT NULL DEFAULT 0,
      classChangesUsedPremium INTEGER NOT NULL DEFAULT 0,
      classChangesUsedPostExpiry INTEGER NOT NULL DEFAULT 0,
      referralCode TEXT UNIQUE NOT NULL,
      referredBy TEXT,
      referralQualified INTEGER NOT NULL DEFAULT 0,
      currentStreakDays INTEGER NOT NULL DEFAULT 1,
      longestStreakDays INTEGER NOT NULL DEFAULT 1,
      lastStudyDate TEXT,
      streakFreezesAvailable INTEGER NOT NULL DEFAULT 1,
      coinBalance INTEGER NOT NULL DEFAULT 10,
      avatarFrame TEXT,
      lastSpinTimestampUtc TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      learnerId TEXT NOT NULL,
      planTier TEXT NOT NULL,
      status TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      utrReference TEXT,
      payerUpiId TEXT,
      amountInr REAL NOT NULL,
      durationDays INTEGER NOT NULL,
      startsAt TEXT,
      expiresAt TEXT,
      verifiedByAdmin TEXT,
      verifiedAt TEXT,
      invoiceNumber TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS coin_ledger (
      entryId TEXT PRIMARY KEY,
      learnerId TEXT NOT NULL,
      amount INTEGER NOT NULL,
      transactionType TEXT NOT NULL,
      reasonCode TEXT NOT NULL,
      balanceAfter INTEGER NOT NULL,
      metadataJson TEXT,
      timestampUtc TEXT NOT NULL,
      signatureHash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gift_requests (
      id TEXT PRIMARY KEY,
      learnerId TEXT NOT NULL,
      learnerName TEXT NOT NULL,
      itemTitle TEXT NOT NULL,
      coinsCost INTEGER NOT NULL,
      shippingAddress TEXT NOT NULL,
      contactPhone TEXT NOT NULL,
      status TEXT NOT NULL,
      voucherCode TEXT,
      requestedAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      learnerId TEXT NOT NULL,
      board TEXT NOT NULL,
      grade INTEGER NOT NULL,
      subjectId TEXT NOT NULL,
      levelNode TEXT NOT NULL,
      score INTEGER NOT NULL,
      maxScore INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS course_progress (
      id TEXT PRIMARY KEY,
      learnerId TEXT NOT NULL,
      board TEXT NOT NULL,
      grade INTEGER NOT NULL,
      subjectId TEXT NOT NULL,
      levelNode TEXT NOT NULL,
      accuracy REAL NOT NULL,
      passed INTEGER NOT NULL,
      completedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      learnerId TEXT NOT NULL,
      learnerName TEXT NOT NULL,
      certificateType TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      grade INTEGER NOT NULL,
      board TEXT NOT NULL,
      academicYear TEXT NOT NULL,
      issueDate TEXT NOT NULL,
      verificationToken TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS acodes (
      code TEXT PRIMARY KEY,
      planTier TEXT NOT NULL,
      durationDays INTEGER NOT NULL,
      isRedeemed INTEGER NOT NULL DEFAULT 0,
      redeemedBy TEXT,
      createdBy TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS security_audit_logs (
      id TEXT PRIMARY KEY,
      timestampUtc TEXT NOT NULL,
      actorEmail TEXT NOT NULL,
      actionType TEXT NOT NULL,
      targetId TEXT NOT NULL,
      severity TEXT NOT NULL,
      details TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      learnerId TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_learners_email ON learners(email);
    CREATE INDEX IF NOT EXISTS idx_subs_learner ON subscriptions(learnerId);
    CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_ledger_learner ON coin_ledger(learnerId);
    CREATE INDEX IF NOT EXISTS idx_gifts_learner ON gift_requests(learnerId);
  `);

  // Seed default ACodes if empty
  const countACodes = db.prepare('SELECT count(*) as cnt FROM acodes').get().cnt;
  if (countACodes === 0) {
    const insertAcode = db.prepare(`
      INSERT INTO acodes (code, planTier, durationDays, isRedeemed, createdBy, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertAcode.run('AL-SCHOLAR-2026', 'PLUS', 180, 0, 'naitiknanda1235@gmail.com', '2027-12-31T23:59:59.000Z', new Date().toISOString());
    insertAcode.run('AL-CBSE-TOPPER', 'LITE', 60, 0, 'naitiknanda1235@gmail.com', '2027-12-31T23:59:59.000Z', new Date().toISOString());
  }

  // Seed super-admin learner record if missing
  const superAdmin = db.prepare('SELECT * FROM learners WHERE email = ?').get('naitiknanda1235@gmail.com');
  if (!superAdmin) {
    db.prepare(`
      INSERT INTO learners (
        id, email, fullName, board, grade, role, isActive,
        referralCode, referralQualified, currentStreakDays, longestStreakDays,
        coinBalance, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr_super_admin_001',
      'naitiknanda1235@gmail.com',
      'Naitik Nanda (Super-Admin)',
      'CBSE',
      12,
      'SUPER_ADMIN',
      1,
      'AL-ADMIN-VAULT',
      1,
      99,
      99,
      9999,
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  // Migrate existing data from data-store.json if present
  migrateFromJsonStore();
}

function migrateFromJsonStore() {
  if (!fs.existsSync(DATA_STORE_JSON)) return;
  try {
    const raw = fs.readFileSync(DATA_STORE_JSON, 'utf8');
    const data = JSON.parse(raw || '{}');

    // 1. Migrate Learners
    const learners = data['al_prod_learners_v1'] || [];
    const insertLearner = db.prepare(`
      INSERT OR REPLACE INTO learners (
        id, email, fullName, phone, parentName, parentEmail, parentPin,
        board, grade, role, isActive, quizzesCompletedCount, levelsCompletedCount,
        classChangesUsedPremium, classChangesUsedPostExpiry, referralCode, referredBy,
        referralQualified, currentStreakDays, longestStreakDays, lastStudyDate,
        streakFreezesAvailable, coinBalance, avatarFrame, lastSpinTimestampUtc,
        createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `);

    learners.forEach(l => {
      insertLearner.run(
        l.id,
        l.email.toLowerCase(),
        l.fullName,
        l.phone || null,
        l.parentName || null,
        l.parentEmail || null,
        l.parentPin || '1234',
        l.board || 'CBSE',
        Number(l.grade || 10),
        l.role || 'STUDENT',
        l.isActive !== false ? 1 : 0,
        Number(l.quizzesCompletedCount || 0),
        Number(l.levelsCompletedCount || 0),
        Number(l.classChangesUsedPremium || 0),
        Number(l.classChangesUsedPostExpiry || 0),
        l.referralCode,
        l.referredBy || null,
        l.referralQualified ? 1 : 0,
        Number(l.currentStreakDays || 1),
        Number(l.longestStreakDays || 1),
        l.lastStudyDate || null,
        Number(l.streakFreezesAvailable || 1),
        Number(l.coinBalance || 10),
        l.avatarFrame || null,
        l.lastSpinTimestampUtc || null,
        l.createdAt || new Date().toISOString(),
        new Date().toISOString()
      );
    });

    // 2. Migrate Subscriptions
    const subscriptions = data['al_prod_subscriptions_v1'] || [];
    const insertSub = db.prepare(`
      INSERT OR REPLACE INTO subscriptions (
        id, learnerId, planTier, status, paymentMethod,
        utrReference, payerUpiId, amountInr, durationDays,
        startsAt, expiresAt, verifiedByAdmin, verifiedAt,
        invoiceNumber, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    subscriptions.forEach(s => {
      insertSub.run(
        s.id,
        s.learnerId,
        s.planTier,
        s.status,
        s.paymentMethod || 'UPI_QR',
        s.utrReference || null,
        s.payerUpiId || null,
        Number(s.amountInr || 0),
        Number(s.durationDays || 60),
        s.startsAt || null,
        s.expiresAt || null,
        s.verifiedByAdmin || null,
        s.verifiedAt || null,
        s.invoiceNumber || 'INV-000',
        s.createdAt || new Date().toISOString()
      );
    });

    // 3. Migrate Coin Ledger
    const coinEntries = data['al_prod_coin_ledger_v1'] || [];
    const insertLedger = db.prepare(`
      INSERT OR REPLACE INTO coin_ledger (
        entryId, learnerId, amount, transactionType, reasonCode,
        balanceAfter, metadataJson, timestampUtc, signatureHash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    coinEntries.forEach(tx => {
      insertLedger.run(
        tx.entryId,
        tx.learnerId,
        Number(tx.amount || 0),
        tx.transactionType || 'CREDIT',
        tx.reasonCode || 'MIGRATION',
        Number(tx.balanceAfter || 0),
        tx.metadata ? JSON.stringify(tx.metadata) : null,
        tx.timestampUtc || new Date().toISOString(),
        tx.signatureHash || 'SIG_MIGRATED'
      );
    });

    // 4. Migrate Gift Requests
    const giftRequests = data['al_prod_gift_requests_v1'] || [];
    const insertGift = db.prepare(`
      INSERT OR REPLACE INTO gift_requests (
        id, learnerId, learnerName, itemTitle, coinsCost,
        shippingAddress, contactPhone, status, voucherCode,
        requestedAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    giftRequests.forEach(g => {
      insertGift.run(
        g.id,
        g.learnerId,
        g.learnerName,
        g.itemTitle,
        Number(g.coinsCost || 0),
        g.shippingAddress,
        g.contactPhone || '',
        g.status || 'PENDING_APPROVAL',
        g.voucherCode || null,
        g.requestedAt || new Date().toISOString(),
        g.updatedAt || new Date().toISOString()
      );
    });

    // 5. Migrate Audit Logs
    const auditLogs = data['al_prod_security_audit_logs_v1'] || [];
    const insertAudit = db.prepare(`
      INSERT OR REPLACE INTO security_audit_logs (
        id, timestampUtc, actorEmail, actionType, targetId, severity, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    auditLogs.forEach(a => {
      insertAudit.run(
        a.id,
        a.timestampUtc || new Date().toISOString(),
        a.actorEmail,
        a.actionType,
        a.targetId || 'SYSTEM',
        a.severity || 'INFO',
        a.details || ''
      );
    });

    console.log(`[Database] Initialized and migrated data: ${learners.length} learners, ${subscriptions.length} subs, ${giftRequests.length} gifts.`);
  } catch (err) {
    console.error('[Database Migration Error]:', err);
  }
}
