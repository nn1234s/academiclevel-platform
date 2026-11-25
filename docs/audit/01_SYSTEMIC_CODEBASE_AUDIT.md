# AcademicLevel — Systemic Codebase, Docs & Risk Audit (Phases 1A–1G)

**Document ID:** AL-AUD-0001  
**Created:** 2026-11-25  
**Status:** VERIFIED — IMPLEMENTED (Exhaustive Audit Snapshot at `5604856`)  
**Classification:** Restricted Engineering & Security Audit  
**Owner:** Principal Software Architect & Staff Security Engineer  

---

## Executive Summary

An exhaustive file-by-file audit across all **271 repository files** (backend `server/`, frontend `src/`, all 71 scripts in `scripts/`, root configuration, `docs/`, and `public/` assets) uncovered **46 distinct systemic findings** across **P0-Critical (15)**, **P1-High (17)**, **P2-Medium (10)**, and **P3-Low (4)** severity levels.

Baseline automated build checks run prior to any code modifications:
- `npx.cmd tsc --noEmit`: **Passed (exit 0)**
- `npm.cmd run build`: **Passed (exit 0)** — produced `dist/assets/index-DOCZwlZx.js` at **3,753.89 kB** (`521.78 kB` gzip) because `src/services/offlineBankService.ts:3` statically bundles `src/data/curatedQuestionBank.json` (`2,728,434` bytes).
- SQLite `server/data/academiclevel_prod.db` (read-only schema audit): 20 tables present (`question_bank` = 3,600 rows, `learners` = 9 rows, `subscriptions` = 44 rows, `sessions` = 72 rows).

---

## Pillar 1: Architecture, Gaps, Bugs & Routing

### `AUD-P1-01` [P0-Critical] Complete Remote Admin Authentication Bypass & Client Fallback Secret Exposure
- **Evidence:** `server/api.js:214,228,239,3262-3265`; `src/core/auth/SuperAdminGuard.tsx:11-35,89-93,100-147`; `src/core/auth/AuthContext.tsx:310-359,527-539`; `src/core/storage/StorageRLSLayer.ts:212-222`; `src/admin-vault/modules/CommandCenterOverview.tsx:72`; `src/admin-vault/modules/StudentManagement.tsx:95`; `src/modules/shared/AuthModal.tsx:119-125`
- **Root Cause:**
  1. `isValidAdminSession()` (`server/api.js:239`) unconditionally returns `true` for any token starting with `'adm_sess_fb_'`.
  2. `isAuthorizedAdminPasskey()` (`server/api.js:214,228`) hardcodes `'AL-ADMIN-VAULT-2026'` as a master passkey, while `StorageRLSLayer.ts:215`, `CommandCenterOverview.tsx:72`, and `StudentManagement.tsx:95` bundle `'AL-ADMIN-VAULT-2026'` in frontend JS and send it in `x-admin-passkey`.
  3. `SuperAdminGuard.tsx:100-147` mints `'adm_sess_fb_*'` tokens locally after hashing against client-embedded `KNOWN_ADMIN_EMAIL_HASHES`/`KNOWN_ADMIN_PASS_HASHES` even when `/api/auth/admin-verify` rejects login.
  4. `AuthModal.tsx:119-125` and `AuthContext.tsx:310-359` grant `SUPER_ADMIN` role in browser state without calling `/api/auth/login` when signing in with `admin@academiclevel.in` or `naitiknanda1235@gmail.com`.
- **Exploit Scenario:** Any anonymous attacker can send `x-admin-token: adm_sess_fb_x` or extract `'AL-ADMIN-VAULT-2026'` from the public JS bundle to call every `/api/admin/*` and `/api/storage` route, exfiltrate all child/parent PII, grant unlimited subscriptions, mint coins, or purge accounts.
- **Fix Specification:** Remove `'adm_sess_fb_'` prefix bypass and hardcoded `'AL-ADMIN-VAULT-2026'` from server and client; remove client-side admin hash/email bypasses in `SuperAdminGuard`, `AuthModal`, and `AuthContext`; enforce server-issued cryptographic admin sessions verified on `/api/auth/admin-verify` and `/api/auth/me` using `ADMIN_EMAIL` and server-side hashed `ADMIN_PASSKEY` from environment variables.

### `AUD-P1-02` [P0-Critical] Unauthenticated Account Deletion (Any User Can Purge Any Account)
- **Evidence:** `server/api.js:878-918`; `src/modules/public/AccountDeletionPage.tsx:72-101,299-313`; `src/modules/student/StudentProfile.tsx:46-73`
- **Root Cause:** `POST /api/public/request-account-deletion` accepts `{ emailOrPhone }` with zero password/PIN/OTP verification and immediately calls `executePermanentLearnerPurge(learner.id)` (`server/api.js:899-900`), wiping the learner, subscriptions, coins, certificates, and attempts. Meanwhile `AccountDeletionPage.tsx:92-101` and `StudentProfile.tsx:67-70` fabricate success or silently log out on network error.
- **Exploit Scenario:** Knowing any student's email or 10-digit phone number allows an unauthenticated attacker to permanently destroy that account immediately.
- **Fix Specification:** Require valid `password` or verified `parentPin` / single-use email confirmation token + `authLimiter` on `/api/public/request-account-deletion`; prohibit public unauthenticated purge of `SUPER_ADMIN` accounts; surface real errors on failure.

### `AUD-P1-03` [P0-Critical] Unauthenticated Payment & Subscription Bypass (`activate-gateway`, `register`, `school/activate-pack`)
- **Evidence:** `server/api.js:512-558,1317-1365,2725-2801`; `src/modules/student/UPIQRCheckout.tsx:73-96,377-415`; `src/services/paymentService.ts:204-265`; `src/modules/public/LandingPage.tsx:70-146`; `src/modules/public/Special49AdsLandingPage.tsx:351-537`; `src/modules/public/SchoolPortalPage.tsx:156-258`
- **Root Cause:**
  1. `POST /api/payments/activate-gateway` and `POST /api/auth/register` (`planTier: 'LITE'|'PLUS'|'GOLD'`) create `'ACTIVE'` subscriptions immediately with no gateway signature verification, webhook confirmation, or 12-digit UTR proof.
  2. `POST /api/school/activate-pack` promotes any learner to `role: 'TEACHER'` (`server/api.js:2739`) and mints 20–40 A-Codes without verified payment; `POST /api/auth/register` (`server/api.js:434`) accepts client-supplied `role: 'TEACHER'`, violating the single-student product scope (no teacher accounts).
- **Exploit Scenario:** Any visitor obtains unlimited 365-day Gold plans or 40 School A-Codes free of charge.
- **Fix Specification:** Disallow client-driven `ACTIVE` status creation: payments submitted manually enter `PENDING_VERIFICATION` until verified via signed gateway webhook or authenticated admin approval; remove `role: 'TEACHER'` escalation on `/api/auth/register` and gate `/api/school/activate-pack` behind verified payment & admin/session authorization.

### `AUD-P1-04` [P0-Critical] Frontend-Trusted Quiz Evaluation, Answer-Key Leakage, Coin Minting & Milestone Bypass
- **Evidence:** `server/api.js:1412-1530,1533-1597,1840-1946,2052-2065,2151-2264`; `src/modules/student/QuizEngine.tsx:362,402-492`; `src/modules/student/OfflineBankView.tsx:102-104`; `src/modules/student/QOTD.tsx:25,104-117`; `src/modules/pokemon/PokemonVaultHub.tsx:248-258`; `src/modules/student/QuizDuelArena.tsx:114-183,335-355`; `src/modules/student/GiftStore.tsx:453-465,510-536`; `src/core/auth/AuthContext.tsx:64-74,105-115,172-181`
- **Root Cause:**
  1. `GET /api/quizzes/fetch-quiz` and `/api/quizzes/qotd` ship `correctIndex` and `explanation` directly to the browser; `curatedQuestionBank.json` (`2.7 MB`) is bundled directly into client JS (`OfflineBankService.ts:3`).
  2. `QuizEngine.tsx:362` grades locally and `POST /api/quizzes/attempt` + `POST /api/progress/level` trust client-supplied `score`, `maxScore`, `passed`, `accuracy`, and `antiCheatPassed` without session auth or answer verification.
  3. `POST /api/coins/transact` (`server/api.js:1449`) evaluates `(isAuthorizedStudent || Boolean(learner))`, letting any unauthenticated caller mint up to 100 coins per call for any `learnerId`.
  4. `POST /api/gifts/redeem` (`server/api.js:1572-1583`) trusts `req.body.levelsCount` and `req.body.quizzesCount` without session auth.
  5. `AuthContext.tsx:64-73,105-115,173-181` overwrites server `coinBalance`/`levelsCompletedCount` whenever `localLearner` values are higher.
- **Fix Specification:** Strip `correctIndex`/`explanation` from active quiz fetch responses; evaluate quiz answers exclusively server-side in a stateful submission endpoint (`POST /api/quizzes/submit`); require valid session auth on `/api/coins/transact`, `/api/gifts/redeem`, `/api/quizzes/attempt`, `/api/progress/level`; remove `|| Boolean(learner)` at `server/api.js:1449` and `clientLevels`/`clientQuizzes` trust at `:1572-1583`; treat server responses as authoritative in `AuthContext`.

### `AUD-P1-05` [P0-Critical] Stored/Reflected XSS in Printable & Downloadable Worksheets (`PracticeWorksheetViewer`)
- **Evidence:** `src/modules/student/PracticeWorksheetViewer.tsx:333,407,451-453,477,501`; `src/modules/public/Special49AdsLandingPage.tsx:328-334`
- **Root Cause:** Raw `learner.fullName` and question fields are interpolated unescaped into HTML written to a same-origin popup via `printWindow.document.write(htmlContent)` and exported `.html` Blob.
- **Fix Specification:** Escape all HTML-interpolated strings via strict `escapeHtml()` before building worksheet HTML or Blob output.

### `AUD-P1-06` [P1-High] Database Boot Overwrite Risk & Gift Schema Mismatches + Broken Audit Logging
- **Evidence:** `server/db.js:105-117,168-176,421-480`; `server/api.js:3183-3193,3227-3237,3269-3279,3659-3689`; `server/tursoClient.js:390-399`; `.dockerignore:1-5`
- **Root Cause:**
  1. `migrateFromJsonStore()` (`server/db.js:421-480`) runs `INSERT OR REPLACE INTO learners` from `data-store.json` on every server boot without including newer columns (`passwordHash`, `passwordSalt`, `dailyAiMessagesUsed`, `country`, `city`, `schoolName`), risking silent password/field wipe if stale `data-store.json` exists.
  2. `POST /api/admin/gifts/:id/status` updates nonexistent `adminNotes` column (`server/db.js:105-117` lacks `adminNotes`, `courierName`, `trackingId`), throwing HTTP 500 while UI ignores failure.
  3. Admin login/denied-access audit inserts (`server/api.js:3183,3227,3269`) reference nonexistent columns (`learnerId`, `action`, `targetResource`, `ipAddress`, `userAgent`), failing inside silent `catch {}`.
  4. `runAutomatedMaintenance()` (`server/tursoClient.js:394`) purges `security_audit_logs` after 90 days, violating India CERT-In's mandatory 180-day log retention rule.
  5. `.dockerignore:1-5` fails to exclude `.env` and `server/data/*.db*`, exposing secrets and student DB files if built into a Docker image.

### `AUD-P1-07` [P1-High] Shadowed Routes, Broken `/sitemap` Logged-In Store Link & Docs Drift
- **Evidence:** `server/server.js:42-72` vs `src/App.tsx:198,202,1735,1929`; `src/modules/public/SitemapPage.tsx:176-193`; `src/modules/public/LandingPage.tsx:1413`; `src/modules/public/Special49AdsLandingPage.tsx:971,2602`; `docs/{ARCHITECTURE.md,DB_SCHEMA.md,DEPLOYMENT_GUIDE.md,DOCUMENT-CONTROL.md,13-ai/nova-ai-governance-and-system-card.md}`
- **Root Cause:** Static `public/policies.html` and `public/halloffame/index.html` shadow SPA components cleanly with contradictory policy/security text; logged-in users clicking `STORE` routes from `/sitemap` hit an empty `<main>` view; public forms pass `'CAMBRIDGE'`/`'STATE'` boards rejected by `CurriculumService` (`CBSE | ICSE | IGCSE`); docs claim React 19, Postgres DDL, `12,000` questions, and `CBSE/ICSE Teachers` that contradict `package.json` (`React 18.3.1`), SQLite (`3,600`), and product scope.

### `AUD-P1-08` [P1-High] Broken Admin Actions, N+M Polling Amplification & Logout Ineffectiveness
- **Evidence:** `src/admin-vault/AdminVaultShell.tsx:243-254`; `src/admin-vault/modules/{CommandCenterOverview,StudentManagement,PaymentVerificationQueue,EntitlementManager,AuditLogViewer,GiftFulfillment,ModerationReports,ACodeManager,QuestionBankManager,ScholarshipManager,PricingManager,AdPagesManager,SiteContentManager}.tsx`; `src/services/siteConfigService.ts:217-271`
- **Root Cause:** Client logout deletes tokens before `ApiClient.logout()`, while `/api/auth/logout` omits `adminSessions` Map cleanup; `PaymentVerificationQueue` fires `N+M` `POST /api/storage` requests every 8 seconds; `SiteConfigService.update*` returns `true` even on HTTP failure; `GiftFulfillment` reject never refunds coins; `StudentManagement` action handlers mutate `localStorage` instead of calling `/api/admin/learners/*`.

---

## Pillar 2: Edge Cases & Prompt Manipulation (AI Security)

### `AUD-P2-01` [P0-Critical] StudyGirl / "Flirting Mode" & "Loop of Love" AI Persona Directed at Minors + Prompt Manipulation
- **Evidence:** `server/api.js:4852-5136,5407-5433`; `src/services/novaAiService.ts:160-540,777-795`
- **Root Cause:** Both `/api/ai/chat` system prompts and the deterministic StudyGirl fallback engine instruct the AI to act as an *"alluring AI study girlie"*, call minor learners (Classes 1–12, ages 6–17) *"my gorgeous study crush"*, *"cutie"*, say *"you're mine now!"*, reward 3–5 completed levels with *"FLIRTING MODE UNLOCKED"* and *"20-MIN FREE CHAT BREAK"* with explicit commercial upsell directives (*"make them buy premium collect coins and fall into the system"*). Additionally, `sanitizeAiQuery()` (`server/api.js:4831-4850`) only strips 6 literal English phrases, is skipped on `history` (`server/api.js:5436-5446` injects raw prior turns unvalidated), and `/api/ai/generate-quiz` (`server/api.js:4693`) & `/api/ai/explain` (`server/api.js:4796`) interpolate `question.text`, `chapter`, and `board` directly with zero delimiter isolation or schema validation of Gemini outputs.
- **Exploit / Child-Safety Impact:** Severe child-safety harm (emotional attachment manipulation / romantic grooming-like language aimed at minors), DPDP Act Sec 9(2)/9(3) & POCSO/NCPCR noncompliance, plus trivial prompt injection via multi-turn `history` or `chapter` inputs and answer-key extraction via chat.
- **Fix Specification:** Immediately dismantle romantic/"flirting"/"you're mine now"/"alluring studygirl" prompts and commercial manipulation nudges across `server/api.js` and `novaAiService.ts`; replace with a strict, age-adaptive, child-safe Socratic/encouraging Mentor persona with zero romantic/possessive language and zero manipulative paywall nudges; harden input sanitization across `query`, `history`, `chapter`, and uploaded content with explicit safety classifiers and child-safe output filtering.

### `AUD-P2-02` [P0-Critical] "Snap & Solve Photo Doubt" Drops Uploaded Photo & Hallucinates Unseen Problems
- **Evidence:** `src/modules/student/NovaAiTutor.tsx:450-509`
- **Root Cause:** `selectedPhoto` (base64 image) is rendered locally in `userMsg.imageUrl` (`line 483`) but NEVER transmitted in `NovaAiService.answerStudentQuery(...)` (`lines 501-509`). Instead, only the string `"[PHOTO DOUBT ANALYSIS] Student uploaded an image..."` is sent, causing Nova AI to fabricate answers without seeing the image.
- **Fix Specification:** Validate image MIME/size (`PNG/JPEG/WEBP`), reject or strip EXIF/PII warnings, send multimodal payload to backend `/api/ai/chat` or clearly disclose if multimodal Vision is disabled/offline instead of hallucinating solutions to unseen images.

### `AUD-P2-03` [P1-High] Client-Side Gemini API Keys in `localStorage` / `VITE_*` & Quiz Engine Edge-Case Bugs
- **Evidence:** `src/services/hybridQuizService.ts:32-86,170-238`; `src/services/novaAiService.ts:143,716`; `src/modules/student/QuizEngine.tsx:393-400,439,465-492`
- **Root Cause:** Admin keys are saved to browser `localStorage` and called directly from client browser JS (`?key=...`); `QuizEngine.handleJumpToQuestion` (`lines 393-400`) clears `isAnswerSubmitted`, allowing students to overwrite prior answers; line 439 submits only the last question's `questionDwellSeconds` instead of cumulative duration; chapter quizzes return only 3 questions even if chapters have 0 true matches (`server/api.js:1989` silently mixes in non-chapter `levelNode` questions!).

---

## Pillar 3: Code Quality & Verification Debt

### `AUD-P3-01` [P0-Critical] Automated Test Suite Mutates Live Production DB & Uses Tautological / Source-Regex Assertions
- **Evidence:** All 71 scripts in `scripts/` audited — 23 `test_*.mjs` scripts import `server/db.js` directly without setting isolated `DB_PATH`, mutating live `server/data/academiclevel_prod.db` and `data-store.json` (`test_cms_persistence_and_milestone_suite.mjs:69` even runs `DELETE FROM system_settings`); 10+ scripts contain zero assertions or only copy logic inline (tautologies) or grep source text; 7 test files hardcode credentials/passkeys (`AL-ADMIN-VAULT-2026`, `naitik2026`, `Admin@AcademicLevel99`) and real student PII (`lrn_mw9asujp_rzun`, `lrn_mw9bph4q_xacr`). CI workflow `.github/workflows/ci.yml:34-35` runs `test_security_gates.mjs` with `continue-on-error: true`, masking security failures, and lacks `eslint`, `vitest`, or `playwright`.
- **Fix Specification:** Enforce isolated temporary DB paths (`DB_PATH` in `os.tmpdir()`) in test harness; remove `continue-on-error: true` from CI security checks; purge hardcoded passwords and real learner PII from `scripts/`; replace tautological tests with real seam-level HTTP/DB/logic tests.

---

## Pillar 4: Hallucinations & Wrong Outputs

### `AUD-P4-01` [P0-Critical] Zero Deterministic Math/Science/Schema Verification on LLM or Seeded Outputs
- **Evidence:** `server/api.js:4741-4767` (`/api/ai/generate-quiz`), `scripts/generate_12k_curriculum_bank.mjs:2497-2499`, `scripts/curriculum_generator/{middle,secondary,senior}.js`
- **Root Cause:** Gemini JSON outputs in `/api/ai/generate-quiz` only check `Array.isArray(parsed)` and default malformed fields (`options` -> `['Option A'..'Option D']`, `correctIndex` -> `0`) without validating mathematical truth, option distinctness, syllabus alignment, or citation validity; Python `sympy` is not installed (`ModuleNotFoundError`), and no deterministic CAS/sandbox runner exists. Additionally, existing generators contain logic bugs (e.g., quadratic discriminant `D >= 0` vs `"Imaginary roots"` distractor collision).

---

## Pillar 5: Bias & Uneven Performance

### `AUD-P5-01` [P0-Critical] Complete Absence of ICSE/IGCSE Question Content, Cross-Grade Cloning & Primary-Stage Inaccessibility
- **Evidence:** Read-only SQLite audit of `question_bank` (`3,600` rows); `src/services/curriculumService.ts:180-184`; `src/modules/student/{GiftStore,CertificateVault,MistakeVault,WorldwideScholarships}.tsx`; `vite` build output (`dist/assets/index-DOCZwlZx.js` = `3.75 MB`)
- **Findings:**
  1. **Board Bias:** 3,600/3,600 rows in `question_bank` have `board = 'CBSE'`; **0 ICSE** and **0 IGCSE** rows exist.
  2. **Grade Band Cloning & Reading-Load Bias:** **2,227/3,600 items (61.9%)** share identical core question text across multiple grades wrapped in artificial padding (`"In Class X ... consider this mathematics question:"`), giving Class 1 learners (age 6) a **34.0-word average question length** (`247/300 > 25 words`) and pushing Class 11–12 Calculus/Determinants into Class 10 (`AL-C10-MATH-002`, `AL-C10-MATH-003`).
  3. **Heavy Mobile Payload & Missing KaTeX Rendering:** Bundling `curatedQuestionBank.json` (`2.73 MB`) in client JS produces a `3.75 MB` main JS bundle penalizing low-bandwidth Indian mobile devices, while `PracticeWorksheetViewer`, `MistakeVault`, `QOTD`, `QuizDuelArena`, and `OfflineBankView` fail to render `$...$`/`$$...$$` LaTeX cleanly.

---

## Pillar 6: Data & Model Drift

### `AUD-P6-01` [P1-High] Unversioned Syllabi, Unpinned Gemini Model Cascades & Zero Psychometric Calibration
- **Evidence:** `server/db.js:277-291`; `server/api.js:4055-4126`; `src/services/curriculumService.ts`
- **Root Cause:** `question_bank` has no `curriculumVersionId`, `learningObjectiveId`, `questionVersion`, or `status` lifecycle columns; historical answers sit directly against mutable `question_bank` text without snapshot versioning (`quiz_attempts` stores only aggregate counts, zero item-level `responses` telemetry). Gemini callers dynamically discover arbitrary unpinned models (`gemini-3.5-flash-lite` -> `gemma-2-9b-it`) with no prompt version IDs or golden eval regression checks.

---

## Pillar 7: Data Privacy & PII Exposure

### `AUD-P7-01` [P0-Critical] Unauthenticated Endpoints Exposing Child PII, Parent PINs & Third-Party Leaks
- **Evidence:** `server/api.js:923-1009` (`GET /api/students/:id` returns unauthenticated learner records including `parentPin`, `phone`, `parentEmail` via loose `LIKE '%email%'` match), `server/api.js:1367-1398` (`/payments/my-subscriptions` unauthenticated fuzzy lookup), `server/api.js:2837-2875` (`/student-packs/peers` & `/friends` unauthenticated), `server/api.js:3035-3158` (`/mailbox` unauthenticated), `src/modules/student/GiftStore.tsx:1115-1120` (unencrypted `mailto:` shipping PII), `src/services/pokeApiService.ts:3-950` (direct external child IP requests), `src/modules/public/InnovativeEdtechPage.tsx:200-208` (Blogspot third-party iframe).
- **Gemini AI Data Check:** Prompts to `/api/ai/chat`, `/api/ai/explain`, `/api/ai/generate-quiz` strip email/phone, **but** `/api/ai/chat` system instruction passes `studentFirstName` (`server/api.js:4871` / student name if included) and unverified free-text `query` + `history` straight to Google Gemini APIs without blocking accidental student PII pasted into chat.

---

## Manifest Coverage Confirmation (`00_AUDIT_EXECUTION_PLAN.md`)

All **271 project files** across Domains A–I have been inspected either directly (`server/*`, core auth/storage/API/quiz/AI/compliance TSX modules, root configs, and `docs/*`) or via structured read-only subsystem audits (all 18 `src/admin-vault/` files, all 18 `src/modules/public/` + 5 HTML files, all 49 `src/modules/student/` + `shared/` + `pokemon/` + `services/` + `core/` files, and all 71 `scripts/` files) plus direct SQLite schema/question-bank verification. Zero files remain `PENDING`.
