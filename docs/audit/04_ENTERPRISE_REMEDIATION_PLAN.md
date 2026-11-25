# AcademicLevel — Enterprise Production Remediation & 9-Phase Rollout Plan

**Document ID:** AL-AUD-0004  
**Created:** 2026-11-25  
**Status:** APPROVED FOR EXECUTION (Phase 5 Complete -> Entering Phase 6)  
**Classification:** Internal Engineering Execution Plan  
**Owner:** Principal Software Architect  

---

## 1. Strict Priority Remediation Backlog (`P0` -> `P4`)

Every remediation item follows the atomic TDD loop:
`Declare Scope -> Write Failing Verification Test -> Implement Enterprise Fix -> Run Deterministic Checks -> Update 05_REMEDIATION_TRACKER.md`.

### P0 — Immediate Blockers (Security, Child Privacy & Correctness)

1. **`REM-P0-01` — Admin Authentication, Passkey Purge & Security Logging Integrity**
   - **Resolves:** `AUD-P1-01`, `AUD-P1-06` (audit log columns, 180-day CERT-In retention, `.dockerignore`).
   - **Affected Files:** `server/api.js`, `server/tursoClient.js`, `src/core/auth/SuperAdminGuard.tsx`, `src/core/auth/AuthContext.tsx`, `src/core/storage/StorageRLSLayer.ts`, `src/admin-vault/AdminVaultShell.tsx`, `src/admin-vault/modules/{CommandCenterOverview,StudentManagement}.tsx`, `src/modules/shared/AuthModal.tsx`, `.dockerignore`, `.env.example`.
   - **Acceptance Criteria:** Zero hardcoded passkeys (`AL-ADMIN-VAULT-2026`) or client admin password hashes; zero `adm_sess_fb_` bypass; student portal never escalates emails to `SUPER_ADMIN` without verified password; logout revokes both SQLite `sessions` and in-memory `adminSessions`; `security_audit_logs` inserts succeed with exact column names and retain logs `>= 180` days; `.dockerignore` excludes `.env` and SQLite DBs.

2. **`REM-P0-02` — API RBAC, Payment Activation & Account Deletion Hardening**
   - **Resolves:** `AUD-P1-02`, `AUD-P1-03`, `AUD-P1-04` (auth/coin/gift/referral/school routes), `AUD-P7-01`.
   - **Affected Files:** `server/api.js`, `src/core/auth/AuthContext.tsx`, `src/core/storage/StorageRLSLayer.ts`, `src/core/api/apiClient.ts`, `src/services/{paymentService,quotaService,coinLedgerService}.ts`, `src/modules/student/{UPIQRCheckout,QOTD,QuizDuelArena,GiftStore,WorldwideScholarships,ReferralProgramme,StudentProfile,StudentPacks}.tsx`, `src/modules/pokemon/PokemonVaultHub.tsx`, `src/modules/public/{AccountDeletionPage,LandingPage,Special49AdsLandingPage,SchoolPortalPage}.tsx`, `src/modules/shared/ReCaptchaWidget.tsx`.
   - **Acceptance Criteria:** Unauthenticated callers cannot read `/students/:id`, `/payments/my-subscriptions`, `/mailbox`, `/student-packs/*`, `/school/pack-status/:id`, or purge `/public/request-account-deletion`; `/coins/transact` & `/gifts/redeem` enforce session token matching `learnerId` and never trust client `levelsCount`; `/payments/activate-gateway`, `/auth/register`, and `/school/activate-pack` cannot self-mint `ACTIVE` passes or `TEACHER` accounts without verified server approval/payment; `AuthContext` treats server DB as source of truth; zero `'1234'` PIN fallback or hardcoded personal account bypasses.

3. **`REM-P0-03` — Server-Side Quiz Evaluation, Answer-Key Removal & Bundle Decoupling**
   - **Resolves:** `AUD-P1-04`, `AUD-P2-03`, `AUD-P5-01` (`3.75 MB` bundle leak).
   - **Affected Files:** `server/db.js`, `server/api.js`, `src/core/types/index.ts`, `src/core/api/apiClient.ts`, `src/services/{offlineBankService,hybridQuizService}.ts`, `src/modules/student/{QuizEngine,OfflineBankView}.tsx`.
   - **Acceptance Criteria:** `GET /api/quizzes/fetch-quiz` and `/qotd` NEVER expose `correctIndex` or pre-submission `explanation`; active quiz sessions run through `/api/quizzes/session` + `/api/quizzes/submit-answer` + `/api/quizzes/finish` computing score, elapsed duration, and `+25` coin rewards exclusively server-side; `OfflineBankService` no longer bundles `curatedQuestionBank.json` into client JS; jump-button re-answering is disabled once an item is submitted.

4. **`REM-P0-04` — Child-Safe Nova AI Overhaul, Prompt Injection & Vision Honesty**
   - **Resolves:** `AUD-P2-01`, `AUD-P2-02`, `AUD-P2-03`.
   - **Affected Files:** `server/api.js`, `src/services/{novaAiService,hybridQuizService}.ts`, `src/modules/student/NovaAiTutor.tsx`, `src/admin-vault/modules/QuestionBankManager.tsx`, `src/data/studygirlMessages.ts`.
   - **Acceptance Criteria:** Zero romantic/flirtatious/"you're mine now"/"study crush"/upsell-manipulation directives in AI prompts or deterministic chat responses; replaced by safe, encouraging, age-adaptive Study Mentor responses (`STAGE_1`..`STAGE_5`); prompt sanitization protects both `query` and `history` + strips PII; Snap & Solve sends bounded image MIME/size data cleanly to backend or transparently discloses offline vision unavailability; zero raw Gemini keys stored in `localStorage`.

5. **`REM-P0-05` — DPDP Sec 9 VPC Gate, Minor PII Safeguards, XSS Fix & Dark-Pattern Removal**
   - **Resolves:** `AUD-P1-05`, `Compliance #1–#8`.
   - **Affected Files:** `server/db.js`, `server/api.js`, `src/modules/shared/AuthModal.tsx`, `src/modules/student/{PracticeWorksheetViewer,GiftStore,ParentReportCardModal,ScholarLeagues,QuizDuelArena,WeeklyChallenges,StudentDashboard,StudentMailboxModal}.tsx`, `src/core/security/piiFirewall.ts`, `src/services/siteConfigService.ts`, `src/modules/public/{LegalPages,AboutPage,Special49AdsLandingPage,LandingPage,InnovativeEdtechPage,FAQPage,PricingPage,SitemapPage,HallOfFamePage}.tsx`, `server/server.js`, `public/{policies.html,halloffame.html}`.
   - **Acceptance Criteria:** Minor signups capture guardian consent declaration + parent verification code/OTP stored in `parental_consents`; `PracticeWorksheetViewer` escapes all HTML (`escapeHtml`); resetting 15-min countdown timers and `"Only 17 spots"` scarcity notices removed; disguised peer bots clearly labeled `AI Practice Bot`; `LegalPages.tsx` publishes Grievance Officer details & Indian address and is single source of truth (no shadowed stale `public/policies.html`); `GiftStore` masks PII and avoids unencrypted `mailto:` address dumps.

---

### P1 — Curriculum Completeness & Normalized Data Architecture

6. **`REM-P1-01` — Normalized Versioned Schema, Quarantine of Bad Items & Multi-Board Pilot Bank**
   - **Resolves:** `AUD-P5-01`, `AUD-P6-01`, Phase 2 Quiz Bank Audit findings.
   - **Affected Files:** `server/db.js`, `server/questionBankService.js` (new deep module), `server/api.js`, `scripts/migrations/001_normalized_qb_and_quarantine.mjs`, `src/services/curriculumService.ts`, `src/modules/student/CourseLevels.tsx`.
   - **Acceptance Criteria:** Idempotent normalized tables (`boards`, `curriculum_versions`, `subjects`, `chapters`, `learning_objectives`, `source_records`, `questions`, `question_versions`, `answer_options`, `question_answers`, `explanations`, `question_reviews`, `duplicate_groups`, `assessment_blueprints`, `practice_sessions`, `quiz_responses`, `lo_mastery_records`, `parental_consents`) provisioned safely with rollback script; `migrateFromJsonStore` executes only as a one-time empty-DB bootstrap; out-of-syllabus Class 10 items (`AL-C10-MATH-002`, `AL-C10-MATH-003`) & cross-grade clones quarantined (`DUPLICATE_CLONE`/`SYLLABUS_MISMATCH`); strict `board` + `chapter` SQL isolation enforced; genuine board-distinct verified CBSE, CISCE (ICSE), Cambridge IGCSE, and CS pilot items populated across all 5 developmental stages (`STAGE_1`..`STAGE_5`) with clean `< 18`-word Classes 1–2 stems!

---

### P2 — Independent Deterministic QA & Governance Pipeline

7. **`REM-P2-01` — Deterministic Math, Science, Schema, Reading-Load & Duplicate Validators**
   - **Resolves:** `AUD-P4-01`.
   - **Affected Files:** `tools/validators/verify_question_bank.mjs`, `tools/validators/verify_math.py`.
   - **Acceptance Criteria:** Automated pipeline validates 100% metadata, reading-load limits (`<= 18` words Classes 1–2), banned wrapper detection, normalized + skeleton `#` duplicate detection, deterministic math evaluation (`fractions`/`ast`/numerical checks), unit consistency, and author != reviewer separation; integrated into `/api/admin/questions` and `/api/ai/generate-quiz`.

8. **`REM-P2-02` — Admin Vault Backend Integrity & Defect Withdrawal Flow**
   - **Resolves:** `AUD-P1-08`.
   - **Affected Files:** `server/api.js`, `src/admin-vault/modules/*`, `src/services/{siteConfigService,paymentService,hybridQuizService}.ts`.
   - **Acceptance Criteria:** Remove `N+M` polling `/api/storage` amplification; enforce real error propagation; fix `gift_requests` columns + refund coins atomically on reject; add `/api/admin/acodes`, `/api/admin/questions`, `/api/admin/subscriptions/:id/revoke`, `/api/admin/moderation/:id/resolve`, and `/api/admin/defects`.

---

### P3 — Learning Intelligence, Exam Engine & Student UX

9. **`REM-P3-01` — Multi-Signal LO Mastery, 9 Practice Modes, Board Exam Blueprints & Accessible Mobile KaTeX UI**
   - **Resolves:** `AUD-P5-01` (UX/LaTeX), `Compliance #9–#10`.
   - **Affected Files:** `server/masteryEngine.js` (new module), `server/api.js`, `src/modules/shared/MathText.tsx` (clean lightweight Unicode/fraction/formula formatter + overflow protection), `src/modules/student/{QuizEngine,CourseLevels,MistakeVault,PracticeWorksheetViewer,QOTD,QuizDuelArena,StudentDashboard,GiftStore,CertificateVault,WorldwideScholarships,ReferralProgramme,AnnualMasterCertificate,CourseCatalogue}.tsx`, `src/modules/shared/WhatsDifferentFromChatGPT.tsx`, `src/App.tsx`, `src/services/paymentService.ts`.
   - **Acceptance Criteria:** All 9 practice modes & LO 6-stage/7-signal updates run server-side with unseen validation; verified board blueprint mock endpoint passes Exam Paper QA checks; Classes 1–5 quit quizzes cleanly without scary red PIN barrier; WCAG contrast errors & broken `/sitemap` `/STORE` / `'CAMBRIDGE'` / missing QR asset bugs fixed.

---

### P4 — Calibration, Test Isolation, CI Gates & Authoritative Docs Alignment

10. **`REM-P4-01` — Psychometric Telemetry, Isolated Test Harness, CI Hardening & Docs Sync**
    - **Resolves:** `AUD-P3-01`, `AUD-P6-01`, Docs Drift.
    - **Affected Files:** `server/api.js` (`/api/admin/analytics/psychometrics` gated by `N >= 30`), `.github/workflows/ci.yml`, `scripts/validate_docs.mjs`, `scripts/tests/run_enterprise_verification.mjs`, `scripts/restore_database.mjs`, `README.md`, `GLOSSARY.md`, `PROJECT_MEMORY.md`, `docs/DOCUMENT-CONTROL.md`, `docs/03-architecture/*`, `docs/05-data-integrations/*`, `docs/10-security/*`, `docs/11-grc/*`, `docs/13-ai/*`, `docs/14-research-evidence/*`.
    - **Acceptance Criteria:** All verification suites run strictly against isolated `os.tmpdir()` SQLite copies (zero mutations to `server/data/academiclevel_prod.db`); CI removes `continue-on-error: true` and runs build + validator + security + DPDP + prompt-injection + math/QB gates; `validate_docs.mjs` enforces metadata, duplicate IDs, status enum, Mermaid syntax, broken links, and zero secret patterns.

---

## 2. Alignment with the 9-Phase Controlled Enterprise Rollout

| Rollout Phase | Covered Standards & Remediation Workstreams | Exit Gate |
|---|---|---|
| **1. Master Standards** | `docs/standards/AL-STD-0001..0011` (`Phase 3-4`) | All 11 standards authored & indexed |
| **2. Curriculum Universe** | Normalized `boards`, `curriculum_versions`, `subjects`, `chapters`, `learning_objectives` (`REM-P1-01`) | CBSE, CISCE, IGCSE + CS distinctly modeled |
| **3. Pilot Chapter Blueprints** | Blueprint scoring across Stages 1–5 + board exam blueprints (`REM-P1-01`, `REM-P3-01`) | 8-dimension completeness operational |
| **4. Production Generation Systems** | Safe Mentor prompts, stage-separated generation contract, zero client keys (`REM-P0-04`, `REM-P2-01`) | Contract & schema gates active |
| **5. Independent QA** | `tools/validators/*` math, schema, reading-load, dedup & reviewer != author (`REM-P2-01`, `REM-P2-02`) | 100% deterministic validation pass |
| **6. Curriculum Coverage Expansion** | Quarantine of 2,227 clones / out-of-grade items + multi-board clean seed (`REM-P1-01`) | Zero wrong-grade / empty-board leakage |
| **7. AcademicLevel Platform Integration** | Auth, RBAC, VPC, server scoring, XSS, Admin endpoints, LO mastery UI (`REM-P0-01..05`, `REM-P3-01`) | All P0–P3 checks green |
| **8. Supervised Educational Pilot** | CTT psychometric diagnostics (`N >= 30`) + item defect withdrawal API (`REM-P4-01`) | Telemetry & safety gates verified |
| **9. Controlled Release & Continuous Improvement** | CI gates, doc validation, backup+restore verification, Release Acceptance Sign-off (`Phase 7`) | `06_RELEASE_ACCEPTANCE_REPORT.md` signed |
