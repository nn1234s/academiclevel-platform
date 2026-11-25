# AcademicLevel — Engineering Remediation & Architecture Reference

**Document ID:** AL-REF-0001  
**Last Updated:** 2026-11-25  
**Purpose:** Permanent engineering reference summarizing all resolved issues, root causes, and implemented fixes (zero credentials or internal secrets included).

---

## 1. Admin & Session Authentication (`REM-P0-01`)
- **Previous Issues:**
  - Client-side fallback admin tokens (`adm_sess_fb_`) and hardcoded passkey/hash checks existed in frontend auth guards and `StorageRLSLayer`.
  - Admin logout left stale credentials in browser storage.
  - `security_audit_logs` inserts failed silently due to column mismatches.
  - `.dockerignore` and `.env.example` lacked database/secret exclusions.
- **Fixes Implemented:**
  - Removed all client-side admin passkey/hash fallbacks (`src/core/auth/*`, `src/core/storage/StorageRLSLayer.ts`, `src/admin-vault/*`, `src/modules/shared/AuthModal.tsx`).
  - Enforced server-side session token verification (`x-admin-token` + `ADMIN_EMAIL` / `ADMIN_PASSKEY` via environment variables) in `server/api.js`.
  - Fixed `security_audit_logs` insert schemas in `server/api.js` while retaining `server/tursoClient.js` log cleanup to protect Turso free-tier read/write quotas.
  - Hardened `.dockerignore` and `.env.example`.
  - **Verification:** `scripts/tests/test_rem_p0_01_admin_auth.mjs`

---

## 2. API RBAC, Account Deletion & Registration Integrity (`REM-P0-02`)
- **Previous Issues:**
  - Public registration allowed role escalation and auto-active plans without payment flow.
  - Several student, mailbox, coin, gift, certificate, and peer endpoints lacked session ownership checks (`requireSessionOrAdmin`) or returned `parentPin` in student DTOs.
  - `POST /api/public/request-account-deletion` allowed unauthenticated deletion by email/phone alone, and offline deletion UI faked success on network errors.
  - `AuthContext.tsx` allowed local storage values to overwrite server-authoritative coin/level/quiz counts.
  - `ReferralProgramme.tsx` fetched the full admin learner table instead of referral-scoped data.
  - `SchoolPortalPage.tsx` did not persist the newly registered session token before calling `/api/school/activate-pack`, causing subsequent retries to fail with `"already exists"`.
- **Fixes Implemented:**
  - Added `extractAuthContext`, `requireSessionOrAdmin`, and `sanitizeLearnerDto` (strips password hashes, salts, and `parentPin`) in `server/api.js`.
  - Locked `POST /api/auth/register` to `role = 'STUDENT'` and required password/Parent PIN verification on `POST /api/public/request-account-deletion`.
  - Removed fake offline deletion success in `AccountDeletionPage.tsx` and `StudentProfile.tsx`.
  - Added `GET /api/students/:id/referrals` for scoped referral tracking in `ReferralProgramme.tsx`.
  - Removed client-over-server score/coin overrides in `AuthContext.tsx`.
  - Fixed `SchoolPortalPage.tsx` to save `al_student_token` immediately on registration, auto-login on retry if an account already exists, and validate 12-digit UTRs cleanly.
  - Restored gateway button verification on `POST /api/payments/activate-gateway` (requires valid session auth; activates `ACTIVE` upon UPI PG return click).
  - **Verification:** `scripts/tests/test_rem_p0_02_rbac_payments_delacc.mjs`

---

## 3. Server-Side Quiz Evaluation & Bundle Optimization (`REM-P0-03`)
- **Previous Issues:**
  - `GET /api/quizzes/fetch-quiz` and `GET /api/quizzes/qotd` exposed `correctIndex` and `explanation` before the student answered.
  - `POST /api/quizzes/attempt` accepted unchecked client-submitted scores.
  - `src/services/offlineBankService.ts` statically imported `curatedQuestionBank.json` (2.73 MB), bloating the client JS bundle.
- **Fixes Implemented:**
  - Stripped `correctIndex` and `explanation` from `/api/quizzes/fetch-quiz` and `/api/quizzes/qotd`.
  - Added server-side quiz session endpoints in `server/api.js` (`POST /api/quizzes/session`, `POST /api/quizzes/submit-answer`, `POST /api/quizzes/finish`) and capped scores in `POST /api/quizzes/attempt`.
  - Wired `src/modules/student/QuizEngine.tsx` to server-graded sessions with offline fallback.
  - Decoupled `curatedQuestionBank.json` from `src/services/offlineBankService.ts` (reducing production JS bundle to ~1.39 MB / 362 KB gzip).
  - **Verification:** `scripts/tests/test_rem_p0_03_server_quiz.mjs`

---

## 4. Nova AI Child-Safety, Neutral UI & Free-Tier Server Optimization (`REM-P0-04`)
- **Previous Issues:**
  - Nova AI had a pink/rose aesthetic and flirting/possessive/upsell directives in `server/api.js` and `src/services/novaAiService.ts`.
  - `AuthContext.tsx` polled `GET /api/students/:id` every 45 seconds in the background, increasing server load.
- **Fixes Implemented:**
  - Refactored `src/modules/student/NovaAiTutor.tsx` to a neutral indigo/slate **AI Study Helper** UI with honest photo attachment handling.
  - Replaced unsafe AI prompts in `server/api.js` and `src/services/novaAiService.ts` with an energetic, encouraging, strictly child-safe Study Buddy persona and prompt-injection filtering.
  - Removed the 45-second background polling interval in `AuthContext.tsx` and throttled focus re-syncs to >= 5 minutes to keep server usage minimal on free tiers.
  - **Verification:** `scripts/tests/test_rem_p0_04_child_safe_ai.mjs`

---

## 5. Material Design 1 UI, Parent PIN Sign-Up & Product Focus (`REM-P0-05`)
- **Previous Issues:**
  - Over-rounded pill/bubble styling, frosted glass blurs, and dark-mode regressions across several public/student pages.
  - Sign-up did not expose a Parent PIN input, and student pages used dense technical/legal terms.
- **Fixes Implemented:**
  - Applied **Material Design 1 (2014–2016)** design tokens in `tailwind.config.js`, `src/index.css`, `index.html`, `src/App.tsx`, `src/modules/public/LandingPage.tsx`, `src/modules/student/QuizEngine.tsx`, and `src/modules/shared/AuthModal.tsx` (`Google Sans`, `#EEEEEE` canvas, `dp` elevation shadows, `2px–4px` corners, neutral light-blue Top App Bar).
  - Converted dark-mode public/student pages (`AccountDeletionPage.tsx`, `CertificateVerificationView.tsx`, `InnovativeEdtechPage.tsx`, `NotFoundPika.tsx`, `SchoolPortalPage.tsx`, `Special49AdsLandingPage.tsx`, `OfflineBankView.tsx`) to Light Mode.
  - Added 4-digit **Parent PIN** input to student sign-up (`AuthModal.tsx`), simplified student-facing jargon (`Verified Coin Wallet`, `Safe & Private Study Space`), removed legal compliance marketing from `LandingPage.tsx`, and scoped board UI to **CBSE** only.

---

## 6. Production Readiness Fixes (`03_QUIZ_BANK_DEEP_AUDIT` & `05_REMEDIATION_TRACKER` Closure)
- **Previous Issues:**
  - Rejecting a student's gift request via `/api/admin/gifts/:id/reject` or `/api/admin/gifts/:id/status` did not refund `coinsCost` to the student.
  - Jumping between questions in `QuizEngine.tsx` reset `isAnswerSubmitted`, allowing re-submission of already-answered items, and showed a misleading `NTA Speed Simulator (+4 / -1)` label.
  - No automated question-bank schema/option/answer-index validator script existed for the 3,600-question SQLite bank.
- **Fixes Implemented:**
  - Added atomic `rejectGiftAndRefundCoins` transaction in `server/api.js` (idempotent; refunds `coinsCost` to `learners.coinBalance` and appends `GIFT_REJECTED_REFUND` to `coin_ledger`).
  - Fixed `handleJumpToQuestion` and `handleSubmitAnswer` in `src/modules/student/QuizEngine.tsx` to restore prior answers from `answersLog` and block duplicate submissions; updated label to `Timed Practice Mode`.
  - Added `scripts/validate_question_bank.mjs` verifying all 3,600 CBSE rows in `question_bank` (`badOptionsLen=0`, `duplicateOptions=0`, `badCorrectIndex=0`, `missingExplanation=0`).
  - **Verification:** `scripts/tests/test_rem_prod_readiness.mjs` & `scripts/validate_question_bank.mjs`
