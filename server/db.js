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
      passwordHash TEXT,
      passwordSalt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Automated schema evolution for password fields
  try {
    const learnerCols = db.prepare('PRAGMA table_info(learners)').all().map(c => c.name);
    if (!learnerCols.includes('passwordHash')) {
      db.exec('ALTER TABLE learners ADD COLUMN passwordHash TEXT;');
    }
    if (!learnerCols.includes('passwordSalt')) {
      db.exec('ALTER TABLE learners ADD COLUMN passwordSalt TEXT;');
    }
  } catch {}

  db.exec(`
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

    CREATE TABLE IF NOT EXISTS friendships (
      id TEXT PRIMARY KEY,
      requesterId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      requesterName TEXT NOT NULL,
      receiverName TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      senderName TEXT NOT NULL,
      content TEXT NOT NULL,
      flaggedForReview INTEGER DEFAULT 0,
      flagReason TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_learners_email ON learners(email);
    CREATE INDEX IF NOT EXISTS idx_subs_learner ON subscriptions(learnerId);
    CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_ledger_learner ON coin_ledger(learnerId);
    CREATE INDEX IF NOT EXISTS idx_gifts_learner ON gift_requests(learnerId);
    CREATE INDEX IF NOT EXISTS idx_progress_learner ON course_progress(learnerId);
    CREATE INDEX IF NOT EXISTS idx_attempts_learner ON quiz_attempts(learnerId);
    CREATE INDEX IF NOT EXISTS idx_certs_learner ON certificates(learnerId);
    CREATE INDEX IF NOT EXISTS idx_friendships_req ON friendships(requesterId);
    CREATE INDEX IF NOT EXISTS idx_friendships_rec ON friendships(receiverId);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON student_messages(senderId);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON student_messages(receiverId);

    CREATE TABLE IF NOT EXISTS scholarships (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      targetQuizCount INTEGER NOT NULL,
      rewardCoins INTEGER NOT NULL,
      durationDays INTEGER NOT NULL DEFAULT 7,
      targetGrade INTEGER,
      targetBoard TEXT,
      badgeTitle TEXT,
      maxRecipients INTEGER DEFAULT 0,
      claimedCount INTEGER NOT NULL DEFAULT 0,
      isActive INTEGER NOT NULL DEFAULT 1,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scholarship_claims (
      id TEXT PRIMARY KEY,
      scholarshipId TEXT NOT NULL,
      learnerId TEXT NOT NULL,
      coinsAwarded INTEGER NOT NULL,
      claimedAt TEXT NOT NULL,
      UNIQUE(scholarshipId, learnerId)
    );

    CREATE INDEX IF NOT EXISTS idx_scholarship_claims_learner ON scholarship_claims(learnerId);
    CREATE INDEX IF NOT EXISTS idx_scholarship_claims_sch ON scholarship_claims(scholarshipId);

    CREATE TABLE IF NOT EXISTS question_bank (
      id TEXT PRIMARY KEY,
      board TEXT NOT NULL,
      grade INTEGER NOT NULL,
      subjectId TEXT NOT NULL,
      levelNode TEXT NOT NULL,
      text TEXT NOT NULL,
      optionsJson TEXT NOT NULL,
      correctIndex INTEGER NOT NULL,
      explanation TEXT,
      hint TEXT,
      difficulty TEXT,
      topicTag TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_qb_lookup ON question_bank(board, grade, subjectId, levelNode);

    CREATE TABLE IF NOT EXISTS weekly_challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      durationMinutes INTEGER NOT NULL,
      rewardCoins INTEGER NOT NULL,
      description TEXT NOT NULL,
      targetBoard TEXT,
      targetGrade INTEGER,
      startsAt TEXT NOT NULL,
      endsAt TEXT NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS challenge_completions (
      id TEXT PRIMARY KEY,
      challengeId TEXT NOT NULL,
      learnerId TEXT NOT NULL,
      learnerName TEXT NOT NULL,
      scorePercent REAL NOT NULL,
      timeSpentSeconds INTEGER NOT NULL,
      coinsAwarded INTEGER NOT NULL,
      completedAt TEXT NOT NULL,
      UNIQUE(challengeId, learnerId)
    );

    CREATE INDEX IF NOT EXISTS idx_cc_challenge ON challenge_completions(challengeId);
    CREATE INDEX IF NOT EXISTS idx_cc_learner ON challenge_completions(learnerId);
  `);

  // Safe additive schema migrations for full synchronization
  const addColumnSafe = (table, colDef) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
    } catch {}
  };
  addColumnSafe('course_progress', 'bestScorePercent REAL');
  addColumnSafe('course_progress', 'isCompleted INTEGER DEFAULT 0');
  addColumnSafe('course_progress', 'coinRewardClaimed INTEGER DEFAULT 0');
  addColumnSafe('course_progress', 'calendarYear INTEGER');

  addColumnSafe('quiz_attempts', 'totalQuestions INTEGER');
  addColumnSafe('quiz_attempts', 'correctCount INTEGER');
  addColumnSafe('quiz_attempts', 'accuracyPercent REAL');
  addColumnSafe('quiz_attempts', 'totalDurationSeconds INTEGER');
  addColumnSafe('quiz_attempts', 'antiCheatPassed INTEGER DEFAULT 1');

  addColumnSafe('certificates', 'certificateId TEXT');
  addColumnSafe('certificates', 'subjectName TEXT');
  addColumnSafe('certificates', 'levelName TEXT');
  addColumnSafe('certificates', 'issuedAt TEXT');

  addColumnSafe('scholarships', 'acode TEXT');
  addColumnSafe('scholarships', 'awardsJson TEXT');
  addColumnSafe('scholarship_claims', 'accuracy REAL DEFAULT 0');
  addColumnSafe('scholarship_claims', 'awardedRank TEXT');
  addColumnSafe('scholarship_claims', 'acodeAwarded TEXT');

  // AI Message Quotas & Coin Recharge Fields
  addColumnSafe('learners', 'dailyAiMessagesUsed INTEGER DEFAULT 0');
  addColumnSafe('learners', 'lastAiMessageDateUtc TEXT');
  addColumnSafe('learners', 'bonusAiMessages INTEGER DEFAULT 0');

  // ACodes and scholarships are managed via admin portal and persisted in database.
  // Never re-seed deleted inaugural scholarships.
  const defaultAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

  // Seed default ACodes if empty
  const countACodes = db.prepare('SELECT count(*) as cnt FROM acodes').get().cnt;
  if (countACodes === 0) {
    const insertAcode = db.prepare(`
      INSERT INTO acodes (code, planTier, durationDays, isRedeemed, createdBy, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertAcode.run('AL-SCHOLAR-2026', 'PLUS', 180, 0, defaultAdminEmail, '2027-12-31T23:59:59.000Z', new Date().toISOString());
    insertAcode.run('AL-CBSE-TOPPER', 'LITE', 60, 0, defaultAdminEmail, '2027-12-31T23:59:59.000Z', new Date().toISOString());
  }

  // Seed super-admin learner record if missing
  const superAdmin = db.prepare("SELECT * FROM learners WHERE id = 'usr_super_admin_001' OR referralCode = 'AL-ADMIN-VAULT' OR (email = ? AND email != '')").get(defaultAdminEmail);
  if (!superAdmin && defaultAdminEmail) {
    db.prepare(`
      INSERT OR IGNORE INTO learners (
        id, email, fullName, board, grade, role, isActive,
        referralCode, referralQualified, currentStreakDays, longestStreakDays,
        coinBalance, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr_super_admin_001',
      defaultAdminEmail,
      'Administrator (Super-Admin)',
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

    // 6. Seed Question Bank in SQLite if empty (Preserving exactly 12,000 questions)
    try {
      const qbCount = db.prepare('SELECT count(*) as c FROM question_bank').get().c;
      if (qbCount === 0) {
        const qbPath = path.resolve(__dirname, '../src/data/curatedQuestionBank.json');
        if (fs.existsSync(qbPath)) {
          const rawQ = fs.readFileSync(qbPath, 'utf8');
          const questions = JSON.parse(rawQ);
          const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO question_bank (
              id, board, grade, subjectId, levelNode, text,
              optionsJson, correctIndex, explanation, hint, difficulty, topicTag
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          db.exec('BEGIN TRANSACTION');
          for (const q of questions) {
            insertStmt.run(
              q.id,
              q.board,
              q.grade,
              q.subjectId,
              q.levelNode,
              q.text,
              JSON.stringify(q.options),
              q.correctIndex,
              q.explanation || '',
              q.hint || '',
              q.difficulty || 'MEDIUM',
              q.topicTag || ''
            );
          }
          db.exec('COMMIT');
          console.log(`[Database] Seeded ${questions.length} curriculum questions into SQLite question_bank.`);
        }
      }
    } catch (qbErr) {
      console.error('[Database Question Bank Error]:', qbErr);
    }

    // 7. Seed Weekly Challenges in SQLite if empty
    try {
      const wcCount = db.prepare('SELECT count(*) as c FROM weekly_challenges').get().c;
      if (wcCount === 0) {
        const now = new Date();
        const nextWeek = new Date(Date.now() + 7 * 86400000);
        const insertWc = db.prepare(`
          INSERT OR REPLACE INTO weekly_challenges (
            id, title, subjectId, durationMinutes, rewardCoins, description,
            targetBoard, targetGrade, startsAt, endsAt, isActive
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertWc.run(
          'wc_math_sprint',
          'All-India Numerical Sprint Challenge',
          'math',
          20,
          35,
          'Solve 15 non-routine arithmetic and algebraic questions against the live clock.',
          'ALL',
          null,
          now.toISOString(),
          nextWeek.toISOString(),
          1
        );
        insertWc.run(
          'wc_science_olympiad',
          'National Science Diagnostic Cup',
          'science',
          25,
          50,
          'Experimental design, assertion-reasoning, and scientific inquiry scenarios.',
          'ALL',
          null,
          now.toISOString(),
          nextWeek.toISOString(),
          1
        );
        insertWc.run(
          'wc_logic_blitz',
          'Mental Aptitude & Spatial Logic Championship',
          'reasoning',
          15,
          30,
          'Pattern completion, syllogisms, and rapid algorithmic problem solving.',
          'ALL',
          null,
          now.toISOString(),
          nextWeek.toISOString(),
          1
        );
      }
    } catch (wcErr) {
      console.error('[Database Weekly Challenges Error]:', wcErr);
    }

    console.log(`[Database] Initialized and migrated data: ${learners.length} learners, ${subscriptions.length} subs, ${giftRequests.length} gifts.`);
  } catch (err) {
    console.error('[Database Migration Error]:', err);
  }
}

export function exportDbToJsonStore() {
  try {
    const learners = db.prepare(`
      SELECT * FROM learners
      WHERE email NOT LIKE '%@example.com'
        AND email NOT LIKE '%@test.com'
        AND email NOT LIKE '%@al.test'
        AND email NOT LIKE '%naitrik%'
        AND email NOT LIKE '%naitikfriend%'
    `).all();
    const validLearnerIds = new Set(learners.map(l => l.id));
    const subscriptions = db.prepare('SELECT * FROM subscriptions').all().filter(s => validLearnerIds.has(s.learnerId));
    const coin_ledger = db.prepare('SELECT * FROM coin_ledger').all().filter(c => validLearnerIds.has(c.learnerId));
    const acodes = db.prepare('SELECT * FROM acodes').all();
    const gift_requests = db.prepare('SELECT * FROM gift_requests').all();
    const security_audit_logs = db.prepare('SELECT * FROM security_audit_logs').all();

    const data = {
      al_prod_learners_v1: learners,
      al_prod_subscriptions_v1: subscriptions,
      al_prod_coin_ledger_v1: coin_ledger,
      al_prod_acodes_v1: acodes,
      al_prod_gift_requests_v1: gift_requests,
      al_prod_security_audit_logs_v1: security_audit_logs
    };

    fs.writeFileSync(DATA_STORE_JSON, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[Database] exportDbToJsonStore warning:', err.message);
    return false;
  }
}
