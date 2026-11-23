# AcademicLevel — Ubiquitous Language & Domain Glossary

**Document ID:** AL-DATA-0001  
**Status:** VERIFIED — AUTHORITATIVE  
**Classification:** Canonical Public Domain Vocabulary  
**Owner:** Product & Architecture Guild  

---

## 1. Core Domain Entities & Concepts

### Learner (Scholar / Student)
The primary user persona in AcademicLevel. Each learner is identified by an ID (`lrn_...`), bound to an Indian educational board (`CBSE`, `ICSE`, `IGCSE`), a grade level (1 through 12), and maintains a streak counter, coin balance, and level progression records.

### Parent / Guardian
The legal guardian overseeing the learner. Protected by a 4-digit Parent PIN (`parentPin`) required for resetting streaks, changing class settings, or authorizing gift orders.

### Progression Node
The 4 pedagogical difficulty tiers in the AcademicLevel syllabus pathway:
1. **FOUNDATION**: Core textbook definitions, visual intuition, and formula recall (10 questions, ~15 mins).
2. **CONCEPT**: Real-world application, multi-step analytical problems, and misconception fixes (12 questions, ~20 mins).
3. **EXAM_READY**: Board examination pattern simulations, previous year questions (PYQs), and high-weightage marking schemes (15 questions, ~25 mins).
4. **OLYMPIAD**: Higher-Order Thinking Skills (HOTS) and non-routine competitive problem sets (15 questions, ~30 mins).

### Study Coins
The non-monetary gamified reward currency earned exclusively through genuine academic effort (e.g. +25 coins on passing a level with >= 70% accuracy, daily spin wheel rewards, and streak boosts). Redeemable in the Gift Store for digital avatars or physical educational merchandise (stationery kits, water bottles, mystery boxes).

### Coin Ledger
The auditable transaction history tracking all credit and debit operations on a learner's coin balance. Records `balanceBefore`, `balanceAfter`, `amount`, `transactionType` (e.g. `LEVEL_COMPLETION_BONUS`, `DAILY_SPIN_REWARD`, `MERCH_REDEMPTION`), and timestamps.

### Quota & Entitlements
The subscription gating system evaluated by `QuotaService`:
- **Free Account**: Limited to exactly 3 completed curriculum levels.
- **Lite Plan (Concept Booster)**: ₹49 for 60 days of unlimited assessments.
- **Plus Plan (Semester Pass)**: ₹129 for 180 days of unlimited assessments.
- **Gold VIP Plan (Annual Pass)**: ₹205 for 365 days of full unlimited access.

### Nova AI Tutor
The 24/7 interactive Socratic AI tutor. Calibrated to avoid giving direct homework answers; instead, provides multi-step analogies, hints, and conceptual breakdowns. Includes a verified zero-credit fallback bank when live Google Gemini AI is unavailable.

### Daily Spin Wheel
A gamified retention widget available once every 24 hours UTC. Features 4 slices: 2 Coins (Top/0°), 3 Coins (Right/90°), 5 Coins (Bottom/180°), and 40 Coins Jackpot (Left/270°, unlocked via qualifying referrals).

### Student Mailbox
An in-app messaging and diagnostic repository storing question-by-question post-assessment reports, accuracy scores, time dwells, and system notifications.

### A-Codes
Prepaid alphanumeric institutional access codes (e.g. `AL-CBSE10-XYZ`) distributed by schools or coaching institutes, granting students plan upgrades without direct UPI payment.

### UTR (Unique Transaction Reference)
A 12-digit numeric bank transaction reference code provided by students upon completing an Indian UPI QR code payment. Verified by the Super-Admin before subscription activation.

### StorageRLSLayer
The client-side Row-Level Security abstraction enforcing data isolation per student in browser `localStorage`, with automated bi-directional synchronization to the Express SQLite backend.

### Hybrid Quiz Service
The runtime orchestration layer that attempts dynamic live AI question generation via Google Gemini with a timeout race-guard, automatically falling back to the 3,600-question SQLite master syllabus bank on timeout or failure.
