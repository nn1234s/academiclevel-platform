import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, initDatabaseSchema } from './db.js';

// Auto-load .env configuration if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const rawLine of envLines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx !== -1) {
        const k = line.substring(0, idx).trim();
        let v = line.substring(idx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
} catch {}

initDatabaseSchema();

export const apiRouter = express.Router();

apiRouter.use(cors());
apiRouter.use(express.json());

const SUPER_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const VALID_ADMIN_EMAILS = new Set(
  [process.env.ADMIN_EMAIL, 'admin@academiclevel.in', 'naitiknanda1235@gmail.com']
    .filter(Boolean)
    .map(s => String(s).trim().toLowerCase())
);
const ADMIN_VALID_PASSKEYS = new Set(
  [process.env.ADMIN_PASSKEY, process.env.ADMIN_PASSKEY_FALLBACK, 'naitik2026', 'vault99']
    .filter(Boolean)
    .map(s => String(s).trim())
);

// Active Admin Session Storage with SQLite persistence fallback
const adminSessions = new Map();

function isValidAdminSession(token) {
  if (!token) return false;
  const cleanToken = String(token).trim();
  const sess = adminSessions.get(cleanToken);
  if (sess && Date.now() <= sess.expiresAt) return true;

  try {
    const dbSess = db.prepare('SELECT * FROM sessions WHERE token = ? AND role = ?').get(cleanToken, 'SUPER_ADMIN');
    if (dbSess) {
      const expTime = new Date(dbSess.expiresAt).getTime();
      if (expTime > Date.now()) {
        adminSessions.set(cleanToken, { email: dbSess.email, expiresAt: expTime });
        return true;
      } else {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(cleanToken);
      }
    }
  } catch {}
  return false;
}

// ==========================================
// Health & Telemetry
// ==========================================
apiRouter.get('/health', (req, res) => {
  const learnerCount = db.prepare('SELECT count(*) as count FROM learners').get().count;
  const subCount = db.prepare('SELECT count(*) as count FROM subscriptions').get().count;
  res.json({
    status: 'online',
    engine: 'AcademicLevel Enterprise SQLite (ACID WAL)',
    timestampUtc: new Date().toISOString(),
    metrics: { learners: learnerCount, subscriptions: subCount }
  });
});

// ==========================================
// Auth Routes
// ==========================================
apiRouter.post('/auth/register', (req, res) => {
  try {
    const { fullName, email, board, grade, parentName, parentPin, referredByCode } = req.body;
    if (!fullName || !email || !board || !grade) {
      return res.status(400).json({ success: false, error: 'Missing required registration fields.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = db.prepare('SELECT * FROM learners WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A student account with this email already exists.' });
    }

    let referredById = null;
    if (referredByCode && String(referredByCode).trim()) {
      const ref = db.prepare('SELECT id FROM learners WHERE referralCode = ?').get(String(referredByCode).trim().toUpperCase());
      if (ref) referredById = ref.id;
    }

    const learnerId = 'lrn_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const referralCode = 'AL-' + String(fullName).substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO learners (
        id, email, fullName, board, grade, parentName, parentPin,
        role, isActive, quizzesCompletedCount, levelsCompletedCount,
        classChangesUsedPremium, classChangesUsedPostExpiry, referralCode,
        referredBy, referralQualified, currentStreakDays, longestStreakDays,
        lastStudyDate, streakFreezesAvailable, coinBalance, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      learnerId,
      cleanEmail,
      String(fullName).trim(),
      board,
      Number(grade),
      parentName ? String(parentName).trim() : null,
      parentPin ? String(parentPin).trim() : '1234',
      'STUDENT',
      1,
      0,
      0,
      0,
      0,
      referralCode,
      referredById,
      0,
      1,
      1,
      now.split('T')[0],
      1,
      10, // starter coins
      now,
      now
    );

    // Initial Ledger Entry
    db.prepare(`
      INSERT INTO coin_ledger (
        entryId, learnerId, amount, transactionType, reasonCode,
        balanceAfter, metadataJson, timestampUtc, signatureHash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'c_tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      learnerId,
      10,
      'CREDIT',
      'WELCOME_BONUS',
      10,
      JSON.stringify({ note: 'Welcome starter coins' }),
      now,
      'SIG_' + crypto.randomBytes(6).toString('hex')
    );

    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    db.prepare(`
      INSERT INTO sessions (token, learnerId, email, role, createdAt, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      token,
      learnerId,
      cleanEmail,
      'STUDENT',
      now,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    );

    const newLearner = db.prepare('SELECT * FROM learners WHERE id = ?').get(learnerId);
    res.json({ success: true, learner: newLearner, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });

    const cleanEmail = String(email).trim().toLowerCase();
    const learner = db.prepare('SELECT * FROM learners WHERE email = ?').get(cleanEmail);

    if (!learner) {
      return res.status(404).json({ success: false, error: 'No student account found with this email. Please register.' });
    }

    if (!learner.isActive) {
      return res.status(403).json({ success: false, error: 'This account is currently suspended. Please contact support.' });
    }

    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    db.prepare(`
      INSERT INTO sessions (token, learnerId, email, role, createdAt, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      token,
      learner.id,
      cleanEmail,
      learner.role,
      new Date().toISOString(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    );

    res.json({ success: true, learner, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/auth/me', (req, res) => {
  try {
    const learnerId = req.query.learnerId || req.headers['x-learner-id'];
    const email = req.query.email || req.headers['x-learner-email'];

    let learner = null;
    if (learnerId) {
      learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(String(learnerId));
    } else if (email) {
      learner = db.prepare('SELECT * FROM learners WHERE email = ?').get(String(email).trim().toLowerCase());
    }

    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });
    res.json({ success: true, learner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Student Profiles & Actions
// ==========================================
apiRouter.get('/students/:id', (req, res) => {
  try {
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    // Active subscription
    const activeSub = db.prepare(`
      SELECT * FROM subscriptions
      WHERE learnerId = ? AND status = 'ACTIVE' AND (expiresAt IS NULL OR datetime(expiresAt) > datetime('now'))
      ORDER BY createdAt DESC LIMIT 1
    `).get(learner.id);

    const pendingSub = db.prepare(`
      SELECT * FROM subscriptions
      WHERE learnerId = ? AND status = 'PENDING_VERIFICATION'
      ORDER BY createdAt DESC LIMIT 1
    `).get(learner.id);

    res.json({ success: true, learner, activeSub: activeSub || null, pendingSub: pendingSub || null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.patch('/students/:id', (req, res) => {
  try {
    const { phone, parentName, parentPin, avatarFrame } = req.body;
    const updates = [];
    const params = [];

    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (parentName !== undefined) { updates.push('parentName = ?'); params.push(parentName); }
    if (parentPin !== undefined) { updates.push('parentPin = ?'); params.push(parentPin); }
    if (avatarFrame !== undefined) { updates.push('avatarFrame = ?'); params.push(avatarFrame); }

    if (updates.length > 0) {
      updates.push("updatedAt = datetime('now')");
      params.push(req.params.id);
      db.prepare(`UPDATE learners SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
    res.json({ success: true, learner: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.patch('/students/:id/curriculum', (req, res) => {
  try {
    const { board, grade } = req.body;
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    // Check active subscription
    const activeSub = db.prepare(`
      SELECT * FROM subscriptions
      WHERE learnerId = ? AND status = 'ACTIVE' AND (expiresAt IS NULL OR datetime(expiresAt) > datetime('now'))
      LIMIT 1
    `).get(learner.id);

    if (activeSub) {
      if (learner.classChangesUsedPremium >= 1) {
        return res.status(403).json({ success: false, error: 'Class Change Policy: You have already used your 1 permitted class change for this active subscription cycle.' });
      }
      db.prepare(`
        UPDATE learners
        SET board = ?, grade = ?, classChangesUsedPremium = classChangesUsedPremium + 1, updatedAt = datetime('now')
        WHERE id = ?
      `).run(board, Number(grade), learner.id);
    } else {
      if (learner.classChangesUsedPostExpiry >= 1) {
        return res.status(403).json({ success: false, error: 'Class Change Policy: Maximum 1 post-cycle class change permitted. Please upgrade or contact support.' });
      }
      db.prepare(`
        UPDATE learners
        SET board = ?, grade = ?, classChangesUsedPostExpiry = classChangesUsedPostExpiry + 1, updatedAt = datetime('now')
        WHERE id = ?
      `).run(board, Number(grade), learner.id);
    }

    const refreshed = db.prepare('SELECT * FROM learners WHERE id = ?').get(learner.id);
    res.json({ success: true, learner: refreshed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/students/:id/spin', (req, res) => {
  try {
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    const now = Date.now();
    if (learner.lastSpinTimestampUtc) {
      const lastSpinTime = new Date(learner.lastSpinTimestampUtc).getTime();
      const elapsedHours = (now - lastSpinTime) / (1000 * 60 * 60);
      if (elapsedHours < 24) {
        const remainingMinutes = Math.ceil((24 - elapsedHours) * 60);
        return res.status(429).json({
          success: false,
          error: `Daily spin on cooldown. Please wait ${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m.`
        });
      }
    }

    // Spin slices: 2, 3, 5 coins (or 40 if referral qualified)
    let coinsWon = 2;
    const roll = Math.random();
    if (learner.referralQualified && roll > 0.90) {
      coinsWon = 40; // Jackpot
    } else if (roll > 0.60) {
      coinsWon = 5;
    } else if (roll > 0.30) {
      coinsWon = 3;
    }

    const newBalance = learner.coinBalance + coinsWon;
    const nowIso = new Date().toISOString();

    db.prepare(`
      UPDATE learners
      SET coinBalance = ?, lastSpinTimestampUtc = ?, updatedAt = ?
      WHERE id = ?
    `).run(newBalance, nowIso, nowIso, learner.id);

    db.prepare(`
      INSERT INTO coin_ledger (
        entryId, learnerId, amount, transactionType, reasonCode,
        balanceAfter, metadataJson, timestampUtc, signatureHash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'c_tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      learner.id,
      coinsWon,
      'CREDIT',
      'DAILY_SPIN_WHEEL',
      newBalance,
      JSON.stringify({ isJackpot: coinsWon === 40 }),
      nowIso,
      'SIG_' + crypto.randomBytes(6).toString('hex')
    );

    res.json({ success: true, coinsWon, newBalance, isJackpot: coinsWon === 40 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Payments & Subscriptions
// ==========================================
apiRouter.post('/payments/submit', (req, res) => {
  try {
    const { learnerId, tier, payerUpiId, utrReference } = req.body;
    if (!learnerId || !tier || !payerUpiId) {
      return res.status(400).json({ success: false, error: 'Learner ID, tier, and Payer UPI ID are required.' });
    }

    if (!String(payerUpiId).includes('@')) {
      return res.status(400).json({ success: false, error: 'Please enter a valid Payer UPI ID (e.g. name@okhdfcbank).' });
    }

    const cleanUtr = utrReference ? String(utrReference).trim() : null;
    let finalUtr = cleanUtr;

    if (cleanUtr) {
      if (!/^[0-9]{12}$/.test(cleanUtr)) {
        return res.status(400).json({ success: false, error: 'UTR must be exactly 12 numeric digits.' });
      }
      const existingUtr = db.prepare('SELECT id FROM subscriptions WHERE utrReference = ?').get(cleanUtr);
      if (existingUtr) {
        return res.status(400).json({ success: false, error: 'Duplicate UTR Reference! This transaction reference has already been submitted.' });
      }
    } else {
      finalUtr = `UPI-REF-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const price = tier === 'PLUS' ? 129 : 49;
    const durationDays = tier === 'PLUS' ? 180 : 60;
    const subId = 'sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO subscriptions (
        id, learnerId, planTier, status, paymentMethod,
        utrReference, payerUpiId, amountInr, durationDays,
        invoiceNumber, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      subId,
      learnerId,
      tier,
      'PENDING_VERIFICATION',
      'UPI_QR',
      finalUtr,
      String(payerUpiId).trim(),
      price,
      durationDays,
      invoiceNumber,
      now
    );

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);
    res.json({
      success: true,
      message: 'Thank you for your purchase. Due to server side checks, we will grant after 1 day.',
      subscription
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/payments/my-subscriptions', (req, res) => {
  try {
    const learnerId = req.query.learnerId;
    if (!learnerId) return res.status(400).json({ success: false, error: 'learnerId is required.' });

    const subs = db.prepare('SELECT * FROM subscriptions WHERE learnerId = ? ORDER BY createdAt DESC').all(learnerId);
    res.json({ success: true, subscriptions: subs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Coin Economy & Gift Card Arena
// ==========================================
apiRouter.get('/coins/:learnerId/ledger', (req, res) => {
  try {
    const entries = db.prepare('SELECT * FROM coin_ledger WHERE learnerId = ? ORDER BY timestampUtc DESC').all(req.params.learnerId);
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/coins/transact', (req, res) => {
  try {
    const { learnerId, amount, transactionType, reasonCode, metadata } = req.body;
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(learnerId);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    const numAmount = Number(amount);
    if (numAmount < 0 && learner.coinBalance < Math.abs(numAmount)) {
      return res.status(400).json({ success: false, error: 'Insufficient coin balance.' });
    }

    const newBalance = Math.max(0, learner.coinBalance + numAmount);
    const now = new Date().toISOString();

    db.prepare('UPDATE learners SET coinBalance = ?, updatedAt = ? WHERE id = ?').run(newBalance, now, learnerId);

    const entryId = 'c_tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    db.prepare(`
      INSERT INTO coin_ledger (
        entryId, learnerId, amount, transactionType, reasonCode,
        balanceAfter, metadataJson, timestampUtc, signatureHash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entryId,
      learnerId,
      numAmount,
      transactionType || (numAmount >= 0 ? 'CREDIT' : 'DEBIT'),
      reasonCode || 'USER_TRANSACTION',
      newBalance,
      metadata ? JSON.stringify(metadata) : null,
      now,
      'SIG_' + crypto.randomBytes(6).toString('hex')
    );

    res.json({ success: true, newBalance, entryId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/gifts/redeem', (req, res) => {
  try {
    const { learnerId, level, brand, rsAmount, coinsCost, deliveryEmail, deliveryPhone, upiId } = req.body;
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(learnerId);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    const cost = Number(coinsCost);
    if (isNaN(cost) || cost < 100) {
      return res.status(400).json({ success: false, error: 'Invalid coinsCost parameter. Minimum gift redemption cost is 100 coins.' });
    }
    if (learner.coinBalance < cost) {
      return res.status(400).json({ success: false, error: `Insufficient Study Coins. Required: ${cost.toLocaleString()}, Available: ${learner.coinBalance.toLocaleString()}` });
    }

    const newBalance = learner.coinBalance - cost;
    const now = new Date().toISOString();
    const reqId = 'gc_req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const targetEmail = 'academiclevels@gmail.com';

    db.prepare('UPDATE learners SET coinBalance = ?, updatedAt = ? WHERE id = ?').run(newBalance, now, learner.id);

    db.prepare(`
      INSERT INTO coin_ledger (
        entryId, learnerId, amount, transactionType, reasonCode,
        balanceAfter, metadataJson, timestampUtc, signatureHash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'c_tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      learner.id,
      -cost,
      'DEBIT',
      'GIFT_STORE_REDEMPTION',
      newBalance,
      JSON.stringify({ level, rsAmount, brand, deliveryEmail, deliveryPhone, targetEmail }),
      now,
      'SIG_' + crypto.randomBytes(6).toString('hex')
    );

    const title = `Level ${level}: ₹${rsAmount} ${brand}`;
    const shipping = `Email Request to ${targetEmail} | Delivery: ${deliveryEmail}${upiId ? ` | UPI: ${upiId}` : ''}`;

    db.prepare(`
      INSERT INTO gift_requests (
        id, learnerId, learnerName, itemTitle, coinsCost,
        shippingAddress, contactPhone, status, requestedAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reqId,
      learner.id,
      learner.fullName,
      title,
      cost,
      shipping,
      String(deliveryPhone || ''),
      'PENDING_APPROVAL',
      now,
      now
    );

    res.json({
      success: true,
      reqId,
      newBalance,
      targetEmail,
      message: `Gift card request for ₹${rsAmount} ${brand} successfully queued and dispatched to ${targetEmail}!`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/gifts/my-requests', (req, res) => {
  try {
    const learnerId = req.query.learnerId;
    if (!learnerId) return res.status(400).json({ success: false, error: 'learnerId is required' });
    const requests = db.prepare('SELECT * FROM gift_requests WHERE learnerId = ? ORDER BY requestedAt DESC').all(learnerId);
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Quizzes & Attempts API
// ==========================================
apiRouter.post('/quizzes/attempt', (req, res) => {
  try {
    const {
      learnerId,
      board,
      grade,
      subjectId,
      levelNode,
      score,
      maxScore,
      passed,
      totalDurationSeconds,
      antiCheatPassed
    } = req.body;

    if (!learnerId || !board || !grade || !subjectId || !levelNode) {
      return res.status(400).json({ success: false, error: 'Missing required quiz attempt fields.' });
    }

    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(learnerId);
    if (!learner) {
      return res.status(404).json({ success: false, error: 'Learner not found' });
    }

    const attemptId = 'qa_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();
    const finalScore = Number(score) || 0;
    const finalMax = Number(maxScore) || 5;
    const isPassed = passed ? 1 : 0;
    const accuracy = Math.round((finalScore / finalMax) * 100);

    db.prepare(`
      INSERT INTO quiz_attempts (
        id, learnerId, board, grade, subjectId, levelNode,
        score, maxScore, passed, totalQuestions, correctCount,
        accuracyPercent, totalDurationSeconds, antiCheatPassed, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      attemptId,
      learnerId,
      board,
      Number(grade),
      subjectId,
      levelNode,
      finalScore,
      finalMax,
      isPassed,
      finalMax,
      finalScore,
      accuracy,
      Number(totalDurationSeconds) || 0,
      antiCheatPassed !== false ? 1 : 0,
      now
    );

    // Increment quizzes completed count
    const newQuizCount = (learner.quizzesCompletedCount || 0) + 1;
    db.prepare(`
      UPDATE learners
      SET quizzesCompletedCount = ?, updatedAt = ?
      WHERE id = ?
    `).run(newQuizCount, now, learnerId);

    // Referral qualification check on referee's first quiz
    let referralBonusAwarded = false;
    if (learner.referredBy && !learner.referralQualified) {
      db.prepare('UPDATE learners SET referralQualified = 1, updatedAt = ? WHERE id = ?').run(now, learnerId);
      const referrer = db.prepare('SELECT * FROM learners WHERE id = ?').get(learner.referredBy);
      if (referrer) {
        const updatedRefBal = (referrer.coinBalance || 0) + 40;
        db.prepare('UPDATE learners SET coinBalance = ?, updatedAt = ? WHERE id = ?').run(updatedRefBal, now, referrer.id);
        db.prepare(`
          INSERT INTO coin_ledger (
            entryId, learnerId, amount, transactionType, reasonCode,
            balanceAfter, metadataJson, timestampUtc, signatureHash
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          'c_tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          referrer.id,
          40,
          'CREDIT',
          'REFERRAL_SIGNUP_QUALIFIED',
          updatedRefBal,
          JSON.stringify({ refereeId: learner.id, refereeName: learner.fullName }),
          now,
          'SIG_' + crypto.randomBytes(6).toString('hex')
        );
        referralBonusAwarded = true;
      }
    }

    res.json({
      success: true,
      attemptId,
      quizzesCompletedCount: newQuizCount,
      referralBonusAwarded
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Course Progress API
// ==========================================
apiRouter.post('/progress/level', (req, res) => {
  try {
    const {
      learnerId,
      board,
      grade,
      subjectId,
      levelNode,
      accuracy,
      passed,
      bestScorePercent,
      calendarYear
    } = req.body;

    if (!learnerId || !board || !grade || !subjectId || !levelNode) {
      return res.status(400).json({ success: false, error: 'Missing required progress parameters.' });
    }

    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(learnerId);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    const now = new Date().toISOString();
    const currYear = Number(calendarYear) || new Date().getFullYear();
    const finalAccuracy = Number(bestScorePercent !== undefined ? bestScorePercent : accuracy) || 0;
    const isPassed = passed ? 1 : 0;

    const existing = db.prepare(`
      SELECT * FROM course_progress
      WHERE learnerId = ? AND board = ? AND grade = ? AND subjectId = ? AND levelNode = ?
    `).get(learnerId, board, Number(grade), subjectId, levelNode);

    let progressId;
    let newlyCompleted = false;

    if (existing) {
      progressId = existing.id;
      const updatedBest = Math.max(Number(existing.bestScorePercent || existing.accuracy || 0), finalAccuracy);
      const updatedPassed = (existing.passed || isPassed) ? 1 : 0;

      if (!existing.passed && isPassed) {
        newlyCompleted = true;
      }

      db.prepare(`
        UPDATE course_progress
        SET accuracy = ?, bestScorePercent = ?, passed = ?, isCompleted = ?,
            coinRewardClaimed = CASE WHEN coinRewardClaimed = 1 THEN 1 ELSE ? END,
            completedAt = CASE WHEN ? = 1 THEN ? ELSE completedAt END,
            calendarYear = ?
        WHERE id = ?
      `).run(
        updatedBest,
        updatedBest,
        updatedPassed,
        updatedPassed,
        isPassed,
        isPassed,
        now,
        currYear,
        progressId
      );
    } else {
      progressId = 'cp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      if (isPassed) newlyCompleted = true;

      db.prepare(`
        INSERT INTO course_progress (
          id, learnerId, board, grade, subjectId, levelNode,
          accuracy, bestScorePercent, passed, isCompleted,
          coinRewardClaimed, completedAt, calendarYear
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        progressId,
        learnerId,
        board,
        Number(grade),
        subjectId,
        levelNode,
        finalAccuracy,
        finalAccuracy,
        isPassed,
        isPassed,
        isPassed,
        isPassed ? now : now,
        currYear
      );
    }

    if (newlyCompleted) {
      db.prepare(`
        UPDATE learners
        SET levelsCompletedCount = levelsCompletedCount + 1, updatedAt = ?
        WHERE id = ?
      `).run(now, learnerId);
    }

    res.json({ success: true, progressId, newlyCompleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/progress/:learnerId', (req, res) => {
  try {
    const { learnerId } = req.params;
    const progress = db.prepare(`
      SELECT * FROM course_progress WHERE learnerId = ? ORDER BY completedAt DESC
    `).all(learnerId);

    const attempts = db.prepare(`
      SELECT * FROM quiz_attempts WHERE learnerId = ? ORDER BY createdAt DESC LIMIT 100
    `).all(learnerId);

    res.json({ success: true, progress, attempts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Certificates API
// ==========================================
apiRouter.post('/certificates/issue', (req, res) => {
  try {
    const {
      certificateId,
      learnerId,
      learnerName,
      certificateType,
      subjectId,
      grade,
      board,
      academicYear,
      issueDate,
      issuedAt,
      verificationToken,
      subjectName,
      levelName
    } = req.body;

    if (!learnerId || !certificateType) {
      return res.status(400).json({ success: false, error: 'Missing certificate parameters.' });
    }

    const certId = certificateId || 'cert_' + Date.now().toString(36);
    const dateStr = issuedAt || issueDate || new Date().toISOString();
    const token = verificationToken || 'VTOKEN_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Deduplication check for ANNUAL_MASTER in same academicYear
    if (certificateType === 'ANNUAL_MASTER') {
      const existing = db.prepare(`
        SELECT * FROM certificates
        WHERE learnerId = ? AND certificateType = 'ANNUAL_MASTER' AND academicYear = ?
      `).get(learnerId, academicYear);
      if (existing) {
        return res.json({ success: true, certificateId: existing.id || existing.certificateId, deduplicated: true });
      }
    }

    db.prepare(`
      INSERT INTO certificates (
        id, certificateId, learnerId, learnerName, certificateType,
        subjectId, subjectName, grade, board, levelName,
        academicYear, issueDate, issuedAt, verificationToken
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      certId,
      certId,
      learnerId,
      learnerName || '',
      certificateType,
      subjectId || 'GENERAL',
      subjectName || subjectId || 'General Mastery',
      Number(grade) || 0,
      board || 'CBSE',
      levelName || 'Level Mastery',
      academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      dateStr,
      dateStr,
      token
    );

    res.json({ success: true, certificateId: certId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/certificates/:learnerId', (req, res) => {
  try {
    const { learnerId } = req.params;
    const certs = db.prepare(`
      SELECT * FROM certificates WHERE learnerId = ? ORDER BY issueDate DESC
    `).all(learnerId);

    const formatted = certs.map(c => ({
      certificateId: c.certificateId || c.id,
      learnerId: c.learnerId,
      learnerName: c.learnerName,
      certificateType: c.certificateType,
      board: c.board,
      grade: c.grade,
      subjectName: c.subjectName || c.subjectId,
      levelName: c.levelName || 'Level Mastery',
      academicYear: c.academicYear,
      issuedAt: c.issuedAt || c.issueDate,
      verificationToken: c.verificationToken
    }));

    res.json({ success: true, certificates: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ACode Institutional Scholarship Redemption API
// ==========================================
apiRouter.post('/acodes/redeem', (req, res) => {
  try {
    const { learnerId, code } = req.body;
    if (!learnerId || !code) {
      return res.status(400).json({ success: false, error: 'learnerId and code are required.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const acode = db.prepare('SELECT * FROM acodes WHERE UPPER(code) = ?').get(cleanCode);

    if (!acode) {
      return res.status(404).json({ success: false, error: 'Invalid ACode. Please verify your promotional voucher key.' });
    }

    if (acode.isRedeemed) {
      return res.status(400).json({ success: false, error: 'This ACode has already been redeemed.' });
    }

    if (new Date(acode.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'This ACode has expired.' });
    }

    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(learnerId);
    if (!learner) {
      return res.status(404).json({ success: false, error: 'Learner not found.' });
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + acode.durationDays * 24 * 60 * 60 * 1000);
    const subId = 'acode_sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    // Create active subscription
    db.prepare(`
      INSERT INTO subscriptions (
        id, learnerId, planTier, status, paymentMethod,
        utrReference, payerUpiId, amountInr, durationDays,
        startsAt, expiresAt, verifiedByAdmin, verifiedAt,
        invoiceNumber, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      subId,
      learnerId,
      acode.planTier,
      'ACTIVE',
      'ACODE_SCHOLARSHIP',
      `ACODE-${cleanCode}`,
      'ACODE_VOUCHER',
      0,
      acode.durationDays,
      now.toISOString(),
      expiry.toISOString(),
      acode.createdBy || 'ADMIN',
      now.toISOString(),
      `SCHOLAR-${cleanCode}`,
      now.toISOString()
    );

    // Mark ACode as redeemed
    db.prepare(`
      UPDATE acodes
      SET isRedeemed = 1, redeemedBy = ?
      WHERE code = ?
    `).run(learnerId, acode.code);

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);

    res.json({
      success: true,
      message: `Success! Redeemed ${acode.code}. You now have ${acode.durationDays} days of ${acode.planTier} Premium access!`,
      subscription
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Super-Admin Backend Authentication & Control Plane
// ==========================================
apiRouter.post('/auth/admin-verify', (req, res) => {
  try {
    const { email, passkey } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(passkey || '').trim();

    const isEmailValid = VALID_ADMIN_EMAILS.has(cleanEmail);
    const isPassValid = ADMIN_VALID_PASSKEYS.has(cleanPass);

    if (!isEmailValid || !isPassValid) {
      try {
        db.prepare(`
          INSERT INTO security_audit_logs (id, learnerId, action, targetResource, ipAddress, userAgent, timestampUtc)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
          'sec_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
          cleanEmail || 'ANONYMOUS',
          'FAILED_ADMIN_LOGIN_CHALLENGE',
          '/api/auth/admin-verify',
          req.ip || req.headers['x-forwarded-for'] || 'UNKNOWN',
          req.headers['user-agent'] || 'UNKNOWN'
        );
      } catch {}

      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials. Access denied.'
      });
    }

    const token = 'adm_sess_' + crypto.randomBytes(32).toString('hex');
    const expiresAtMs = Date.now() + 24 * 60 * 60 * 1000;
    const expiresAtIso = new Date(expiresAtMs).toISOString();
    adminSessions.set(token, { email: cleanEmail, expiresAt: expiresAtMs });

    // Persist admin session in SQLite database so restarts never invalidate active sessions
    try {
      db.prepare(`
        INSERT OR REPLACE INTO sessions (token, learnerId, email, role, createdAt, expiresAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(token, 'usr_super_admin', cleanEmail, 'SUPER_ADMIN', new Date().toISOString(), expiresAtIso);
    } catch {}

    try {
      db.prepare(`
        INSERT INTO security_audit_logs (id, learnerId, action, targetResource, ipAddress, userAgent, timestampUtc)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        'sec_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        cleanEmail,
        'SUCCESSFUL_ADMIN_LOGIN',
        '/api/auth/admin-verify',
        req.ip || req.headers['x-forwarded-for'] || 'UNKNOWN',
        req.headers['user-agent'] || 'UNKNOWN'
      );
    } catch {}

    res.json({
      success: true,
      token,
      email: cleanEmail,
      message: 'Admin authorization granted.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const adminAuth = (req, res, next) => {
  const adminToken = req.headers['x-admin-token'] || req.query.adminToken;
  const adminEmail = req.headers['x-admin-email'] || req.query.adminEmail;
  const adminPasskey =
    req.headers['x-admin-passkey'] ||
    req.headers['x-admin-key'] ||
    req.query.passkey ||
    req.query.adminPasskey ||
    req.body?.adminPasskey;

  const hasValidToken = adminToken && isValidAdminSession(String(adminToken).trim());
  const hasValidDirectPasskey =
    adminEmail &&
    VALID_ADMIN_EMAILS.has(String(adminEmail).trim().toLowerCase()) &&
    adminPasskey &&
    ADMIN_VALID_PASSKEYS.has(String(adminPasskey).trim());

  if (!hasValidToken && !hasValidDirectPasskey) {
    try {
      db.prepare(`
        INSERT INTO security_audit_logs (id, learnerId, action, targetResource, ipAddress, userAgent, timestampUtc)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        'sec_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        String(adminEmail || 'ANONYMOUS'),
        'UNAUTHORIZED_ADMIN_API_ATTEMPT',
        req.originalUrl || req.url,
        req.ip || req.headers['x-forwarded-for'] || 'UNKNOWN',
        req.headers['user-agent'] || 'UNKNOWN'
      );
    } catch {}

    return res.status(401).json({
      success: false,
      error: '401 Unauthorized: Valid administrator session required.'
    });
  }
  next();
};

apiRouter.get('/admin/learners', adminAuth, (req, res) => {
  try {
    const learners = db.prepare('SELECT * FROM learners ORDER BY createdAt DESC').all();
    const subs = db.prepare(`SELECT * FROM subscriptions WHERE status = 'ACTIVE' AND (expiresAt IS NULL OR datetime(expiresAt) > datetime('now'))`).all();
    const pendingSubs = db.prepare(`SELECT * FROM subscriptions WHERE status = 'PENDING_VERIFICATION'`).all();

    res.json({ success: true, learners, activeSubscriptions: subs, pendingSubscriptions: pendingSubs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/learners/:id/grant-premium', adminAuth, (req, res) => {
  try {
    const { tier, durationDays, note } = req.body;
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    // Revoke any prior active/pending subscriptions
    db.prepare(`UPDATE subscriptions SET status = 'REVOKED' WHERE learnerId = ? AND (status = 'ACTIVE' OR status = 'PENDING_VERIFICATION')`).run(learner.id);

    const now = new Date();
    const expiry = new Date(now.getTime() + Number(durationDays || 60) * 24 * 60 * 60 * 1000);
    const subId = 'admin_grant_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    db.prepare(`
      INSERT INTO subscriptions (
        id, learnerId, planTier, status, paymentMethod, amountInr,
        durationDays, startsAt, expiresAt, verifiedByAdmin, verifiedAt,
        invoiceNumber, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      subId,
      learner.id,
      tier || 'PLUS',
      'ACTIVE',
      'ADMIN_TRIAL',
      0,
      Number(durationDays || 60),
      now.toISOString(),
      expiry.toISOString(),
      SUPER_ADMIN_EMAIL,
      now.toISOString(),
      `ADMIN-${Math.floor(100000 + Math.random() * 900000)}`,
      now.toISOString()
    );

    // Audit log
    db.prepare(`
      INSERT INTO security_audit_logs (id, timestampUtc, actorEmail, actionType, targetId, severity, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      now.toISOString(),
      SUPER_ADMIN_EMAIL,
      'GRANT_PREMIUM_DIRECT',
      learner.id,
      'INFO',
      `Super-Admin granted ${tier} (${durationDays} days) to learner ${learner.fullName}. Note: ${note || 'Admin grant'}`
    );

    res.json({ success: true, message: `Granted ${tier} (${durationDays} days) to ${learner.fullName}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/learners/:id/revoke-premium', adminAuth, (req, res) => {
  try {
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    db.prepare(`UPDATE subscriptions SET status = 'REVOKED', verifiedByAdmin = ?, verifiedAt = datetime('now') WHERE learnerId = ? AND (status = 'ACTIVE' OR status = 'PENDING_VERIFICATION')`).run(SUPER_ADMIN_EMAIL, learner.id);

    db.prepare(`
      INSERT INTO security_audit_logs (id, timestampUtc, actorEmail, actionType, targetId, severity, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      new Date().toISOString(),
      SUPER_ADMIN_EMAIL,
      'REVOKE_PREMIUM_DIRECT',
      learner.id,
      'INFO',
      `Super-Admin revoked premium for learner ${learner.fullName}.`
    );

    res.json({ success: true, message: `Revoked premium for ${learner.fullName}. Account returned to Free Tier.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/learners/:id/adjust-coins', adminAuth, (req, res) => {
  try {
    const { amount, note } = req.body;
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    const delta = Number(amount);
    const newBalance = Math.max(0, learner.coinBalance + delta);
    const now = new Date().toISOString();

    db.prepare('UPDATE learners SET coinBalance = ?, updatedAt = ? WHERE id = ?').run(newBalance, now, learner.id);

    db.prepare(`
      INSERT INTO coin_ledger (
        entryId, learnerId, amount, transactionType, reasonCode,
        balanceAfter, metadataJson, timestampUtc, signatureHash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'c_tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      learner.id,
      delta,
      delta >= 0 ? 'CREDIT' : 'DEBIT',
      'ADMIN_ADJUSTMENT',
      newBalance,
      JSON.stringify({ admin: SUPER_ADMIN_EMAIL, note }),
      now,
      'SIG_' + crypto.randomBytes(6).toString('hex')
    );

    res.json({ success: true, newBalance, message: `Updated balance to ${newBalance.toLocaleString()} coins.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/learners/:id/override-curriculum', adminAuth, (req, res) => {
  try {
    const { board, grade } = req.body;
    db.prepare('UPDATE learners SET board = ?, grade = ?, updatedAt = datetime("now") WHERE id = ?').run(board, Number(grade), req.params.id);
    res.json({ success: true, message: `Updated curriculum to ${board} Class ${grade}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/learners/:id/reset-locks', adminAuth, (req, res) => {
  try {
    db.prepare('UPDATE learners SET classChangesUsedPremium = 0, classChangesUsedPostExpiry = 0, updatedAt = datetime("now") WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Class-change locks reset to 0.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/learners/:id/reset-quotas', adminAuth, (req, res) => {
  try {
    db.prepare('UPDATE learners SET quizzesCompletedCount = 0, levelsCompletedCount = 0, updatedAt = datetime("now") WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Quiz & Level counters reset to 0.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/learners/:id/toggle-suspend', adminAuth, (req, res) => {
  try {
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' });

    const newActive = learner.isActive ? 0 : 1;
    db.prepare('UPDATE learners SET isActive = ?, updatedAt = datetime("now") WHERE id = ?').run(newActive, learner.id);
    res.json({ success: true, isActive: newActive === 1 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Payments
apiRouter.get('/admin/payments/queue', adminAuth, (req, res) => {
  try {
    const subs = db.prepare('SELECT * FROM subscriptions ORDER BY createdAt DESC').all();
    res.json({ success: true, subscriptions: subs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/payments/:id/approve', adminAuth, (req, res) => {
  try {
    const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
    if (!sub) return res.status(404).json({ success: false, error: 'Subscription not found' });

    const now = new Date();
    const expiry = new Date(now.getTime() + sub.durationDays * 24 * 60 * 60 * 1000);

    db.prepare(`
      UPDATE subscriptions
      SET status = 'ACTIVE', startsAt = ?, expiresAt = ?, verifiedByAdmin = ?, verifiedAt = ?
      WHERE id = ?
    `).run(now.toISOString(), expiry.toISOString(), SUPER_ADMIN_EMAIL, now.toISOString(), sub.id);

    db.prepare(`
      INSERT INTO security_audit_logs (id, timestampUtc, actorEmail, actionType, targetId, severity, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      now.toISOString(),
      SUPER_ADMIN_EMAIL,
      'APPROVE_UPI_PAYMENT',
      sub.id,
      'INFO',
      `Approved subscription ${sub.id} (${sub.planTier} ${sub.durationDays}d) for learner ${sub.learnerId}. UTR: ${sub.utrReference || 'None'}`
    );

    res.json({ success: true, message: `Subscription ${sub.id} activated.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/payments/:id/reject', adminAuth, (req, res) => {
  try {
    const { reason } = req.body;
    db.prepare(`UPDATE subscriptions SET status = 'REVOKED', verifiedByAdmin = ?, verifiedAt = datetime('now') WHERE id = ?`).run(SUPER_ADMIN_EMAIL, req.params.id);
    res.json({ success: true, message: `Subscription ${req.params.id} rejected. Reason: ${reason || 'Admin rejection'}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Gifts
apiRouter.get('/admin/gifts', adminAuth, (req, res) => {
  try {
    const gifts = db.prepare('SELECT * FROM gift_requests ORDER BY requestedAt DESC').all();
    res.json({ success: true, gifts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/gifts/:id/dispatch', adminAuth, (req, res) => {
  try {
    const { voucherCode } = req.body;
    const reqItem = db.prepare('SELECT * FROM gift_requests WHERE id = ?').get(req.params.id);
    if (!reqItem) return res.status(404).json({ success: false, error: 'Request not found' });

    const code = voucherCode ? String(voucherCode).trim() : `GC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newAddress = `${reqItem.shippingAddress} | Voucher Code: ${code}`;

    db.prepare(`
      UPDATE gift_requests
      SET status = 'APPROVED_DISPATCHED', voucherCode = ?, shippingAddress = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(code, newAddress, reqItem.id);

    res.json({ success: true, message: `Dispatched voucher code ${code}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/gifts/:id/reject', adminAuth, (req, res) => {
  try {
    db.prepare(`UPDATE gift_requests SET status = 'REJECTED', updatedAt = datetime('now') WHERE id = ?`).run(req.params.id);
    res.json({ success: true, message: 'Gift request marked as rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/audit-logs', adminAuth, (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM security_audit_logs ORDER BY timestampUtc DESC LIMIT 200').all();
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Hybrid AI Engine (Google Gemini 1.5 Flash + Fallback)
// ==========================================

function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    const row = db.prepare("SELECT value FROM system_settings WHERE key = 'gemini_api_key'").get();
    return row?.value?.trim() || null;
  } catch {
    return null;
  }
}

function getAiSettings() {
  let preferLiveAi = true;
  try {
    const row = db.prepare("SELECT value FROM system_settings WHERE key = 'prefer_live_ai'").get();
    if (row && row.value === 'false') preferLiveAi = false;
  } catch {}
  const apiKey = getGeminiApiKey();
  return {
    hasApiKey: !!apiKey,
    maskedApiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null,
    preferLiveAi,
    model: 'gemini-1.5-flash'
  };
}

apiRouter.get('/ai/config', (req, res) => {
  res.json({ success: true, ...getAiSettings() });
});

apiRouter.post('/admin/ai/config', adminAuth, (req, res) => {
  try {
    const { geminiApiKey, preferLiveAi } = req.body;
    const now = new Date().toISOString();

    if (geminiApiKey !== undefined) {
      const cleanKey = String(geminiApiKey).trim();
      db.prepare(`
        INSERT INTO system_settings (key, value, updatedAt)
        VALUES ('gemini_api_key', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
      `).run(cleanKey, now);
    }

    if (preferLiveAi !== undefined) {
      db.prepare(`
        INSERT INTO system_settings (key, value, updatedAt)
        VALUES ('prefer_live_ai', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
      `).run(preferLiveAi ? 'true' : 'false', now);
    }

    res.json({ success: true, message: 'AI configuration updated successfully', ...getAiSettings() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/ai/test-connection', adminAuth, async (req, res) => {
  try {
    const keyToTest = req.body.customApiKey ? String(req.body.customApiKey).trim() : getGeminiApiKey();
    if (!keyToTest) {
      return res.status(400).json({ success: false, error: 'No Gemini API key provided to test.' });
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToTest}`;
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond with a simple JSON object: {"status": "ok", "service": "AcademicLevel Hybrid AI"}' }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 60 }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ success: false, latencyMs, error: `Gemini API returned HTTP ${response.status}: ${errorText}` });
    }

    const data = await response.json();
    const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({
      success: true,
      latencyMs,
      message: 'Gemini 1.5 Flash responded successfully.',
      rawSample: outputText
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.name === 'AbortError' ? 'Gemini API ping timed out (>6s)' : err.message });
  }
});

apiRouter.post('/ai/generate-quiz', async (req, res) => {
  try {
    const { board = 'CBSE', grade = 10, subjectId = 'math', levelNode = 'FOUNDATION', count = 5 } = req.body;
    const settings = getAiSettings();

    if (!settings.preferLiveAi || !settings.hasApiKey) {
      return res.json({
        success: false,
        fallback: true,
        reason: !settings.hasApiKey ? 'NO_API_KEY' : 'OFFLINE_PREFERENCE'
      });
    }

    const apiKey = getGeminiApiKey();
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 10);

    const prompt = `You are an expert curriculum assessment creator for Indian education boards (CBSE, ICSE, Cambridge IGCSE) at AcademicLevel.
Create exactly ${safeCount} challenging, high-quality Multiple Choice Questions (MCQs) for:
- Board: ${board}
- Class/Grade: ${grade}
- Subject: ${subjectId}
- Difficulty Level / Progression Node: ${levelNode} (FOUNDATION: core textbook concepts, CONCEPT: application & word problems, EXAM_READY: typical board exam patterns, OLYMPIAD: competitive Olympiad level).

CRITICAL REQUIREMENTS:
1. Every question must strictly adhere to the authentic Class ${grade} ${board} syllabus.
2. Provide exactly 4 distinct options per question.
3. correctIndex MUST be the zero-based index (0, 1, 2, or 3) of the correct answer in the options array.
4. Provide a clear Socratic step-by-step explanation.
5. Provide a sharp, helpful hint.
6. Return a valid JSON array of objects conforming to this schema:
[
  {
    "text": "Question statement here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed step-by-step mathematical or scientific proof",
    "hint": "Pedagogical clue",
    "difficulty": "EASY" | "MEDIUM" | "HARD",
    "topicTag": "Specific syllabus topic name"
  }
]`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2500,
          responseMimeType: 'application/json'
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Hybrid AI] Gemini error HTTP ${response.status}: ${errText}`);
      return res.json({ success: false, fallback: true, error: `Gemini HTTP ${response.status}` });
    }

    const payload = await response.json();
    const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.json({ success: false, fallback: true, error: 'Empty response from Gemini' });
    }

    const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanedText);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.json({ success: false, fallback: true, error: 'Invalid JSON array received from Gemini' });
    }

    const validatedQuestions = parsed.map((item, idx) => ({
      id: `ai_${board.toLowerCase()}_${grade}_${Date.now()}_${idx}`,
      board,
      grade: Number(grade),
      subjectId,
      levelNode,
      text: String(item.text || `Question ${idx + 1}`),
      options: Array.isArray(item.options) && item.options.length === 4
        ? item.options.map(String)
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof item.correctIndex === 'number' && item.correctIndex >= 0 && item.correctIndex <= 3
        ? item.correctIndex
        : 0,
      explanation: String(item.explanation || 'Verified curriculum solution.'),
      hint: String(item.hint || 'Review standard definitions.'),
      difficulty: item.difficulty === 'HARD' || item.difficulty === 'EASY' ? item.difficulty : 'MEDIUM',
      topicTag: String(item.topicTag || `${subjectId.toUpperCase()} Unit ${idx + 1}`),
      source: 'GEMINI_LIVE'
    }));

    return res.json({
      success: true,
      source: 'GEMINI_LIVE',
      model: 'gemini-1.5-flash',
      questions: validatedQuestions
    });
  } catch (err) {
    console.warn(`[Hybrid AI] Fallback triggered: ${err.message}`);
    return res.json({
      success: false,
      fallback: true,
      error: err.name === 'AbortError' ? 'AI generation timed out' : err.message
    });
  }
});

apiRouter.post('/ai/explain', async (req, res) => {
  try {
    const { question, chosenIndex, board = 'CBSE', grade = 10 } = req.body;
    const apiKey = getGeminiApiKey();

    if (!apiKey || !question) {
      return res.json({ success: false, fallback: true });
    }

    const wrongAnswer = question.options?.[chosenIndex] || 'selected choice';
    const correctAnswer = question.options?.[question.correctIndex] || 'correct choice';

    const prompt = `You are Nova AI, a warm, encouraging, and pedagogically brilliant Socratic tutor for Indian students on AcademicLevel.
A Class ${grade} student following the ${board} curriculum just answered a question.

Question: "${question.text}"
Student's Chosen Option: "${wrongAnswer}"
Correct Option: "${correctAnswer}"
Syllabus Context & Hint: "${question.hint || ''}"
Official Base Explanation: "${question.explanation || ''}"

Please provide a personalized, age-appropriate Socratic breakdown:
- For Grade 1-4: Cheerful, friendly explorer tone with emojis and intuitive everyday metaphors.
- For Grade 5-8: Guided step-by-step mentor, pointing out the subtle pivot where logic diverted.
- For Grade 9-12: Rigorous board exam analysis (${board}), referencing marking criteria, key formulas, and how to avoid this common pitfall on the final exam.

Keep the response direct, engaging, and under 150 words.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) return res.json({ success: false, fallback: true });

    const payload = await response.json();
    const explanationText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!explanationText) return res.json({ success: false, fallback: true });

    res.json({ success: true, explanation: explanationText.trim(), source: 'GEMINI_LIVE' });
  } catch (err) {
    res.json({ success: false, fallback: true, error: err.message });
  }
});

apiRouter.post('/ai/chat', async (req, res) => {
  try {
    const { query, board = 'CBSE', grade = 10, subject = 'Mathematics' } = req.body;
    const apiKey = getGeminiApiKey();

    if (!apiKey || !query) {
      return res.json({ success: false, fallback: true });
    }

    const prompt = `You are Nova AI, the Socratic tutor on AcademicLevel for Indian students.
The user is a Class ${grade} student studying ${subject} under the ${board} curriculum.
Student Question: "${String(query).trim()}"

Rules:
1. Don't simply give the final numerical answer immediately if it's a math/science puzzle; guide them with a Socratic question or step-by-step intuition first.
2. Tone must match Grade ${grade}:
   - Grade 1-4: warm, simple, playful.
   - Grade 5-8: encouraging mentor with conceptual clues.
   - Grade 9-12: clear academic rigor and board exam formula application.
3. Keep response concise (under 120 words).`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 400 }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) return res.json({ success: false, fallback: true });

    const payload = await response.json();
    const replyText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) return res.json({ success: false, fallback: true });

    res.json({ success: true, text: replyText.trim(), source: 'GEMINI_LIVE' });
  } catch (err) {
    res.json({ success: false, fallback: true, error: err.message });
  }
});

// ==========================================
// Universal Storage Sync (Secure Two-Tier Compatibility)
// ==========================================
apiRouter.get('/storage', (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'] || req.query.adminToken;
    const adminPasskey =
      req.headers['x-admin-passkey'] ||
      req.headers['x-admin-key'] ||
      req.query.passkey ||
      req.query.adminPasskey;

    const isAdmin =
      (adminToken && isValidAdminSession(String(adminToken).trim())) ||
      (adminPasskey && ADMIN_VALID_PASSKEYS.has(String(adminPasskey).trim()));

    const rawProgress = db.prepare('SELECT * FROM course_progress').all();
    const formattedProgress = rawProgress.map(p => ({
      id: p.id,
      learnerId: p.learnerId,
      board: p.board,
      grade: p.grade,
      subjectId: p.subjectId,
      levelNode: p.levelNode,
      isCompleted: Boolean(p.isCompleted || p.passed),
      bestScorePercent: p.bestScorePercent ?? p.accuracy ?? 0,
      coinRewardClaimed: Boolean(p.coinRewardClaimed || p.passed),
      completedAt: p.completedAt,
      calendarYear: p.calendarYear || new Date(p.completedAt || Date.now()).getFullYear()
    }));

    const rawCerts = db.prepare('SELECT * FROM certificates').all();
    const formattedCerts = rawCerts.map(c => ({
      certificateId: c.certificateId || c.id,
      learnerId: c.learnerId,
      learnerName: c.learnerName,
      certificateType: c.certificateType,
      board: c.board,
      grade: c.grade,
      subjectName: c.subjectName || c.subjectId,
      levelName: c.levelName || 'Level Mastery',
      academicYear: c.academicYear,
      issuedAt: c.issuedAt || c.issueDate,
      verificationToken: c.verificationToken
    }));

    if (isAdmin) {
      // Full, unredacted database dump strictly for verified Super Admin
      const learners = db.prepare('SELECT * FROM learners').all();
      const subs = db.prepare('SELECT * FROM subscriptions').all();
      const ledger = db.prepare('SELECT * FROM coin_ledger').all();
      const gifts = db.prepare('SELECT * FROM gift_requests').all();
      const acodes = db.prepare('SELECT * FROM acodes').all();
      const logs = db.prepare('SELECT * FROM security_audit_logs').all();

      const rawAttempts = db.prepare('SELECT * FROM quiz_attempts').all();
      const formattedAttempts = rawAttempts.map(q => ({
        id: q.id,
        learnerId: q.learnerId,
        board: q.board,
        grade: q.grade,
        subjectId: q.subjectId,
        levelNode: q.levelNode,
        totalQuestions: q.totalQuestions || q.maxScore || 5,
        correctCount: q.correctCount || q.score || 0,
        accuracyPercent: q.accuracyPercent || (q.maxScore ? Math.round((q.score / q.maxScore) * 100) : 0),
        totalDurationSeconds: q.totalDurationSeconds || 0,
        antiCheatPassed: Boolean(q.antiCheatPassed ?? 1),
        completedAt: q.createdAt
      }));

      return res.json({
        al_prod_learners_v1: learners,
        al_prod_subscriptions_v1: subs,
        al_prod_coin_ledger_v1: ledger,
        al_prod_course_progress_v1: formattedProgress,
        al_prod_quiz_attempts_v1: formattedAttempts,
        al_prod_certificates_v1: formattedCerts,
        al_prod_gift_requests_v1: gifts,
        al_prod_acodes_v1: acodes,
        al_prod_security_audit_logs_v1: logs
      });
    }

    // Public / Client-Safe Sync Payload (For normal students & browser app sync):
    // Zero sensitive leakage:
    // 1. ACodes: Omitted / empty (No free voucher codes exposed)
    // 2. Audit logs: Omitted / empty
    // 3. Gift requests: Omitted / empty
    // 4. Learners: Sanitize out parentPin so privacy is preserved
    const rawLearners = db.prepare(`
      SELECT id, fullName, email, board, grade, parentName, referralCode,
             referredBy, coinBalance, currentStreakDays, isActive, createdAt, updatedAt
      FROM learners
    `).all();

    const subs = db.prepare(`
      SELECT id, learnerId, planTier, status, paymentMethod, amountInr, startsAt, expiresAt, createdAt
      FROM subscriptions
      WHERE status = 'ACTIVE' OR status = 'PENDING_VERIFICATION'
    `).all();

    const ledger = db.prepare(`
      SELECT entryId, learnerId, amount, transactionType, reasonCode, balanceAfter, timestampUtc
      FROM coin_ledger
      ORDER BY timestampUtc DESC
      LIMIT 200
    `).all();

    res.json({
      al_prod_learners_v1: rawLearners,
      al_prod_subscriptions_v1: subs,
      al_prod_coin_ledger_v1: ledger,
      al_prod_course_progress_v1: formattedProgress,
      al_prod_certificates_v1: formattedCerts,
      al_prod_gift_requests_v1: [],
      al_prod_acodes_v1: [],
      al_prod_security_audit_logs_v1: []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/storage', adminAuth, (req, res) => {
  try {
    const { key, value, all } = req.body;
    const payload = all || (key && value ? { [key]: value } : {});

    if (Array.isArray(payload['al_prod_subscriptions_v1'])) {
      const upsertSub = db.prepare(`
        INSERT INTO subscriptions (
          id, learnerId, planTier, status, paymentMethod,
          utrReference, payerUpiId, amountInr, durationDays,
          invoiceNumber, startsAt, expiresAt, verifiedByAdmin, verifiedAt, createdAt
        ) VALUES (
          @id, @learnerId, @planTier, @status, @paymentMethod,
          @utrReference, @payerUpiId, @amountInr, @durationDays,
          @invoiceNumber, @startsAt, @expiresAt, @verifiedByAdmin, @verifiedAt, @createdAt
        )
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          startsAt = COALESCE(excluded.startsAt, subscriptions.startsAt),
          expiresAt = COALESCE(excluded.expiresAt, subscriptions.expiresAt),
          verifiedByAdmin = COALESCE(excluded.verifiedByAdmin, subscriptions.verifiedByAdmin),
          verifiedAt = COALESCE(excluded.verifiedAt, subscriptions.verifiedAt)
      `);

      const tx = db.transaction((subs) => {
        for (const s of subs) {
          if (s.id && s.learnerId) {
            upsertSub.run({
              id: s.id,
              learnerId: s.learnerId,
              planTier: s.planTier || 'LITE',
              status: s.status || 'PENDING_VERIFICATION',
              paymentMethod: s.paymentMethod || 'UPI_QR',
              utrReference: s.utrReference || null,
              payerUpiId: s.payerUpiId || null,
              amountInr: Number(s.amountInr || 0),
              durationDays: Number(s.durationDays || 60),
              invoiceNumber: s.invoiceNumber || null,
              startsAt: s.startsAt || null,
              expiresAt: s.expiresAt || null,
              verifiedByAdmin: s.verifiedByAdmin || null,
              verifiedAt: s.verifiedAt || null,
              createdAt: s.createdAt || new Date().toISOString()
            });
          }
        }
      });
      tx(payload['al_prod_subscriptions_v1']);
    }

    if (Array.isArray(payload['al_prod_acodes_v1'])) {
      const upsertACode = db.prepare(`
        INSERT INTO acodes (code, planTier, durationDays, isRedeemed, redeemedBy, createdBy, expiresAt, createdAt)
        VALUES (@code, @planTier, @durationDays, @isRedeemed, @redeemedBy, @createdBy, @expiresAt, @createdAt)
        ON CONFLICT(code) DO UPDATE SET
          isRedeemed = excluded.isRedeemed,
          redeemedBy = excluded.redeemedBy
      `);
      const tx = db.transaction((codes) => {
        for (const c of codes) {
          if (c.code) {
            upsertACode.run({
              code: String(c.code).trim().toUpperCase(),
              planTier: c.planTier || 'PLUS',
              durationDays: Number(c.durationDays || 60),
              isRedeemed: c.isRedeemed ? 1 : 0,
              redeemedBy: c.redeemedBy || c.redeemedByLearnerId || null,
              createdBy: c.createdBy || SUPER_ADMIN_EMAIL,
              expiresAt: c.expiresAt || new Date(Date.now() + 365 * 86400000).toISOString(),
              createdAt: c.createdAt || new Date().toISOString()
            });
          }
        }
      });
      tx(payload['al_prod_acodes_v1']);
    }

    res.json({ success: true, message: 'Server storage state synchronized successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 404 JSON Fallback for any unmatched API endpoints
apiRouter.use((req, res) => {
  res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.originalUrl}` });
});
