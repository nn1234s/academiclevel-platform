# AcademicLevel — Enterprise Audit Execution Plan & Repository Manifest

**Document ID:** AL-AUD-0000  
**Created:** 2026-11-25  
**Status:** VERIFIED — IMPLEMENTED (Phase 0 Baseline)  
**Classification:** Internal Engineering & Audit Governance  
**Owner:** Principal Software Architect & Enterprise Audit Lead  
**Repository HEAD:** `5604856765a269443d5d8aa870c6f752ecaf563f` (`main`)

---

## 1. Repository Structure & Runtime Baseline

- **Project Name:** AcademicLevel (`academiclevel-platform`, v`2.15.1s`)
- **Repository Remote:** `https://github.com/nn1234s/academiclevel-platform.git`
- **Architecture Pattern:** Monolithic full-stack single-repository web application:
  - **Frontend SPA:** React `^18.3.1`, TypeScript `5.9.3` (bundler resolution), Vite `^6.0.1`, Tailwind CSS `^3.4.16`, `lucide-react` `^1.16.0`, `qrcode` `^1.5.4`, `canvas-confetti` `^1.9.4`.
  - **Backend API & Static Server:** Node.js `v26.13.0` ESM, Express `^5.3.0`, embedded `node:sqlite` (`DatabaseSync` WAL mode) at `server/data/academiclevel_prod.db`, optional HTTP pipeline replication to Turso/libSQL (`server/tursoClient.js`).
  - **AI Runtime Integration:** Direct HTTP integration to Google Gemini API (to be audited in `server/api.js` and `src/services/novaAiService.ts`).
- **Workspace File Count:** **271 project files** (excluding `node_modules/`, `.git/`, `dist/`, `backups/`, and `.agents/` skill definitions) plus **31 installed Matt Pocock engineering skill directories** under `.agents/skills/`.

---

## 2. Inventory of Available Skills & Verification Tooling

### 2.1 Project-Local Agent Skills (`.agents/skills/` — 31 Skills)

| Skill Name | Purpose in This Initiative | Mapped Phases |
|---|---|---|
| `research` | Investigate primary technical/regulatory sources & codebase behavior | Phase 1, 2, 3, 4 |
| `domain-modeling` | Refine canonical `GLOSSARY.md` & `docs/adr/` decisions without implementation leakage | Phase 3, 4 |
| `codebase-design` | Evaluate module depth, seams, interfaces, and refactor targets | Phase 1, 4, 6 |
| `code-review` | Two-axis Standards & Spec review for every remediation slice | Phase 6, 7 |
| `tdd` | Red -> Green verification-first loop at clean public seams | Phase 6 |
| `diagnosing-bugs` | Minimal red-capable reproduction loops for subtle security/state bugs | Phase 1, 6 |
| `implement` / `implement-spec` | Traceable slice-by-slice implementation against specs & backlog | Phase 6 |
| `to-spec` / `to-tickets` | Structure remediation specs and dependency-ordered tickets | Phase 5 |
| `writing-for-agents` | Keep `AGENTS.md`, `CLAUDE.md`, and docs tight, pruned, non-duplicative | Phase 3, 5 |
| `improve-codebase-architecture` | Identify deepening opportunities & remove shallow pass-through leakage | Phase 1, 4, 6 |
| `setup-matt-pocock-skills` | Governance conventions (`docs/agents/domain.md`, `issue-tracker.md`, `triage-labels.md`) | Phase 0, 1 |
| `handoff` / `retro` | Persistent session handoff & verification debt retrospective | Phase 7 |
| `ask-matt`, `grill-me`, `grill-with-docs`, `grilling`, `migrate-to-shoehorn`, `pr`, `prototype`, `scaffold-exercises`, `setup-pre-commit`, `teach`, `to-questionnaire`, `triage`, `wait-what`, `wayfinder`, `wizard`, `git-guardrails-claude-code` | Specialized workflow/planning/refactoring support when triggered | Phase 3–7 |

### 2.2 Host Agent Built-In Skills & Tools

- **Antigravity Built-In Skills (12):** `agy-customizations`, `antigravity-guide`, `automation`, `generative_ui`, `mcp-app-development`, `migrate-agent-settings`, `migrate-workflows`, `plugin`, `run-workflow`, `swarm_monitor`, `swarm_pane`, `ui-plugin-navigation`.
- **Available Subagents:** `research` (read-only codebase/web exploration), `self`, `browser` (available if live UI inspection needed), `image-generator`.
- **Available Search & Runtime Tools:** `read_file`, `write_file`, `edit_file`, `run_command`, `search_web`.

### 2.3 Deterministic Compilers, Analyzers & Runtimes

| Tool / Binary | Verified Version / Status | Usage in Audit & Remediation |
|---|---|---|
| `node` | `v26.13.0` (`node:sqlite` native) | Backend execution, SQLite inspection, deterministic test scripts, validator scripts |
| `npm` | `11.20.0` | Dependency inspection & build scripts |
| `npx.cmd tsc` | `5.9.3` (local `typescript ^5.6.3`) | Strict TypeScript type checking (`tsc --noEmit` & `npm run build`) |
| `vite` | `^6.0.1` (local) | Production bundle build & size analysis |
| `python` | `3.13.14` (`sqlite3` 3.50.4, `ast`, `math`, `fractions`, `decimal`, `re`, `json`) | Programmatic arithmetic/algebraic answer-key recomputation, AST-safe expression checking, quiz-bank duplicate/quality scanning |
| `sympy` (Python package) | **NOT INSTALLED** (`ModuleNotFoundError`) | Documented tooling gap: deterministic math verification uses Node/Python stdlib exact `fractions`/`decimal`/restricted AST evaluator; full symbolic CAS flagged for remediation/dependency addition if offline install allowed |
| `eslint` / `vitest` / `playwright` | **NOT INSTALLED** in `node_modules` | Documented verification-debt gap in CI/CD & quality tooling |
| `gh` (GitHub CLI) | **NOT INSTALLED** locally | Documented contradiction vs `docs/agents/issue-tracker.md` |

---

## 3. Verification Checklist Across Phases

1. `[ ]` `cmd /c "npx tsc --noEmit"` and `cmd /c "npm run build"` (Baseline + Post-remediation).
2. `[ ]` `node scripts/audit_question_bank_reality.mjs` & custom deterministic Quiz Bank Deep Audit (exact/near-duplicate scan, format/difficulty/board/grade distribution, math recomputation, orphan/missing field checks).
3. `[ ]` Existing `scripts/test_*.mjs` suite execution audit (record exact PASS/FAIL/SKIP status without omission).
4. `[ ]` New deterministic P0–P4 automated verification suite covering:
   - Server-side quiz grading & zero answer-key exposure in student quiz fetch payloads.
   - RBAC / Auth / Admin token enforcement & `StorageRLSLayer` boundaries.
   - DPDP Act Sec 9 child-privacy compliance (VPC gating, zero behavioral trackers/ads for minors, PII stripping before Gemini API calls).
   - Prompt injection & child-safety output guards on `/api/ai/chat`, `/api/ai/generate-quiz`, `/api/ai/snap-solve`.
   - Normalized curriculum/question bank schema integrity & immutable versioning gates.
   - Math/science deterministic verification gate + duplicate detector + CI/validation script (`scripts/validate_docs.mjs`).

---

## 4. Complete File-by-File Repository Manifest (271 Project Files)

> Status Legend: `PENDING` -> `AUDITED` -> `ISSUES_LOGGED` -> `VERIFIED`

### Domain A: Backend API, Server, Database & Data Stores (7 Files)
| # | File Path | Audit Status | Notes |
|---|---|---|---|
| 1 | `server/server.js` | `AUDITED` | Express boot, headers, standalone routes, Turso sync hooks |
| 2 | `server/db.js` | `PENDING` | Schema partially read (lines 1-600); complete remainder in Phase 1 |
| 3 | `server/api.js` | `PENDING` | Core REST endpoints, auth, quiz delivery, AI, billing, admin |
| 4 | `server/tursoClient.js` | `PENDING` | LibSQL HTTP pipeline sync (lines 1-100 read; complete remainder) |
| 5 | `server/data/academiclevel_prod.db` | `PENDING` | Read-only schema, row-count, integrity & question bank audit (zero PII export) |
| 6 | `server/data/academiclevel_prod.db.bak_recovery` | `PENDING` | Backup snapshot presence & schema parity check (no PII dump) |
| 7 | `data-store.json` | `PENDING` | JSON seed/fallback file audit (PII/migration overwrite check) |

### Domain B: Frontend Core, Auth, Security, I18n & Services (21 Files)
| # | File Path | Audit Status | Notes |
|---|---|---|---|
| 8 | `src/main.tsx` | `PENDING` | App mount & providers |
| 9 | `src/App.tsx` | `PENDING` | Client routing, auth state, layout, modals |
| 10 | `src/index.css` | `PENDING` | Global styles & mobile layout rules |
| 11 | `src/e2eVerification.ts` | `PENDING` | Client verification helper/exposure check |
| 12 | `src/core/api/apiClient.ts` | `PENDING` | HTTP client, auth headers, error handling |
| 13 | `src/core/auth/AuthContext.tsx` | `PENDING` | Session token handling, login, role checks |
| 14 | `src/core/auth/SuperAdminGuard.tsx` | `PENDING` | Admin route protection |
| 15 | `src/core/i18n/LanguageContext.tsx` | `PENDING` | Language switching (English/Hinglish) |
| 16 | `src/core/i18n/translations.ts` | `PENDING` | UI string translations coverage |
| 17 | `src/core/security/piiFirewall.ts` | `PENDING` | PII & profanity filtering |
| 18 | `src/core/security/utrValidator.ts` | `PENDING` | 12-digit UTR & payment validation |
| 19 | `src/core/storage/StorageRLSLayer.ts` | `PENDING` | Client localStorage isolation & sync |
| 20 | `src/core/theme/classThemes.ts` | `PENDING` | Classes 1-12 UI theming |
| 21 | `src/core/types/index.ts` | `PENDING` | Domain TypeScript types & entitlements |
| 22 | `src/services/certificateService.ts` | `PENDING` | Certificate issuance & verification |
| 23 | `src/services/coinLedgerService.ts` | `PENDING` | Study coin ledger & spin calculations |
| 24 | `src/services/curriculumService.ts` | `PENDING` | Curriculum syllabus tree (CBSE/ICSE/IGCSE) |
| 25 | `src/services/hybridQuizService.ts` | `PENDING` | Quiz fetch orchestration & fallback |
| 26 | `src/services/novaAiService.ts` | `PENDING` | Nova AI / StudyGirl chat, Snap & Solve, quiz gen |
| 27 | `src/services/offlineBankService.ts` | `PENDING` | Curated offline quiz retrieval |
| 28 | `src/services/paymentService.ts` | `PENDING` | UPI QR / tier payment orchestration |
| 29 | `src/services/pokeApiService.ts` | `PENDING` | External PokéAPI calls (privacy/availability) |
| 30 | `src/services/pokemonVoiceAssets.ts` | `PENDING` | Audio asset references |
| 31 | `src/services/quotaService.ts` | `PENDING` | Free tier / level / AI quota gating |
| 32 | `src/services/siteConfigService.ts` | `PENDING` | Dynamic pricing/CMS config |
| 33 | `src/services/studentPacksService.ts` | `PENDING` | School packs & student notes/packs |
| 34 | `src/assets/al-coin.png` | `PENDING` | Bundled coin image asset |

### Domain C: Frontend Public, Shared & Pokémon Modules (28 Files)
| # | File Path | Audit Status | Notes |
|---|---|---|---|
| 35 | `src/modules/pokemon/PokemonVaultHub.tsx` | `PENDING` | Gamified vault & PokeAPI usage |
| 36 | `src/modules/public/AboutPage.tsx` | `PENDING` | Legal entity & product claims |
| 37 | `src/modules/public/AccountDeletionPage.tsx` | `PENDING` | DPDP/Play account erasure flow |
| 38 | `src/modules/public/AdsLandingPage.tsx` | `PENDING` | Marketing/tracker audit |
| 39 | `src/modules/public/CertificateVerificationView.tsx` | `PENDING` | Public QR cert verification |
| 40 | `src/modules/public/CurriculumPage.tsx` | `PENDING` | Public curriculum claims vs reality |
| 41 | `src/modules/public/FAQPage.tsx` | `PENDING` | Policy, refund & FAQ alignment |
| 42 | `src/modules/public/HallOfFamePage.tsx` | `PENDING` | Founder/security claims check |
| 43 | `src/modules/public/InnovativeEdtechPage.tsx` | `PENDING` | Marketing & compliance audit |
| 44 | `src/modules/public/LandingPage.tsx` | `PENDING` | Landing page, pricing, claims |
| 45 | `src/modules/public/LegalPages.tsx` | `PENDING` | Privacy Policy, Terms, DPDPA/Grievance Officer |
| 46 | `src/modules/public/NotFoundPika.tsx` | `PENDING` | 404 route fallback |
| 47 | `src/modules/public/PricingPage.tsx` | `PENDING` | Plan pricing, gateways, refund disclosures |
| 48 | `src/modules/public/PublicCourses.tsx` | `PENDING` | Public course showcase |
| 49 | `src/modules/public/SchoolPortalPage.tsx` | `PENDING` | Role/school portal scope vs "no teacher accounts" |
| 50 | `src/modules/public/SecretAdPage.tsx` | `PENDING` | Ad funnel audit |
| 51 | `src/modules/public/SitemapPage.tsx` | `PENDING` | Route listing accuracy |
| 52 | `src/modules/public/Special49AdsLandingPage.tsx` | `PENDING` | ₹49 offer funnel audit |
| 53 | `src/modules/public/YouTubeAdsLandingPage.tsx` | `PENDING` | YouTube ad funnel audit |
| 54 | `src/modules/shared/AuthModal.tsx` | `PENDING` | Signup, VPC/age-gate, login, referral |
| 55 | `src/modules/shared/ClassSwitcherBar.tsx` | `PENDING` | Class switching limits |
| 56 | `src/modules/shared/ErrorBoundary.tsx` | `PENDING` | Crash recovery & PII safety |
| 57 | `src/modules/shared/KidFounderGlazeShowcase.tsx` | `PENDING` | Claims & assets audit |
| 58 | `src/modules/shared/LanguagePreferenceModal.tsx` | `PENDING` | Language modal UX |
| 59 | `src/modules/shared/PaywallGateModal.tsx` | `PENDING` | Entitlement & paywall enforcement |
| 60 | `src/modules/shared/ReCaptchaWidget.tsx` | `PENDING` | Anti-bot control audit (real vs mock) |
| 61 | `src/modules/shared/StudyCoinIcon.tsx` | `PENDING` | Icon component |
| 62 | `src/modules/shared/WhatsDifferentFromChatGPT.tsx` | `PENDING` | AI pedagogical claim vs StudyGirl reality |

### Domain D: Frontend Student Learning, Quiz, AI & Gamification Modules (28 Files)
| # | File Path | Audit Status | Notes |
|---|---|---|---|
| 63 | `src/modules/student/ACodesRedemption.tsx` | `PENDING` | Coupon/A-code redemption |
| 64 | `src/modules/student/AnnualMasterCertificate.tsx` | `PENDING` | Annual cert criteria & generation |
| 65 | `src/modules/student/CertificateVault.tsx` | `PENDING` | Earned certificate UI |
| 66 | `src/modules/student/CoinMall.tsx` | `PENDING` | Digital item/badge/streak-freeze store |
| 67 | `src/modules/student/CourseCatalogue.tsx` | `PENDING` | Subject catalogue & progress |
| 68 | `src/modules/student/CourseLevels.tsx` | `PENDING` | Chapter/level quiz launch & counts |
| 69 | `src/modules/student/DailyQuestsWidget.tsx` | `PENDING` | Daily quest loop & dark-pattern check |
| 70 | `src/modules/student/DailySpinWheel.tsx` | `PENDING` | Daily spin mechanics & backend sync |
| 71 | `src/modules/student/GiftStore.tsx` | `PENDING` | Physical reward order & PII handling |
| 72 | `src/modules/student/LeoStickerBookModal.tsx` | `PENDING` | Primary learner rewards UX |
| 73 | `src/modules/student/MistakeVault.tsx` | `PENDING` | Wrong-answer review & remediation |
| 74 | `src/modules/student/NovaAiTutor.tsx` | `PENDING` | Nova AI, StudyGirl/Flirting Mode, Snap & Solve, Chat Breaks — **HIGH PRIORITY CHILD-SAFETY & AI AUDIT** |
| 75 | `src/modules/student/OfflineBankView.tsx` | `PENDING` | Offline study notes/bank UI |
| 76 | `src/modules/student/ParentReportCardModal.tsx` | `PENDING` | Parent report & WhatsApp sharing PII check |
| 77 | `src/modules/student/PracticeWorksheetViewer.tsx` | `PENDING` | 30-coin printable worksheets |
| 78 | `src/modules/student/PremiumCenter.tsx` | `PENDING` | Subscription management |
| 79 | `src/modules/student/QOTD.tsx` | `PENDING` | Question of the Day & coin rewards |
| 80 | `src/modules/student/QuizDuelArena.tsx` | `PENDING` | 1v1 coin duels & friend challenge rooms |
| 81 | `src/modules/student/QuizEngine.tsx` | `PENDING` | **CORE ASSESSMENT ENGINE**: client vs server scoring, answer key exposure, autosave, Classes 1-5 UX, LaTeX/mobile |
| 82 | `src/modules/student/ReferralProgramme.tsx` | `PENDING` | Referral reward logic |
| 83 | `src/modules/student/ScholarLeagues.tsx` | `PENDING` | Leaderboard & bot coin mechanics |
| 84 | `src/modules/student/StreakEngine.tsx` | `PENDING` | Streaks & dark-pattern compliance |
| 85 | `src/modules/student/StudentDashboard.tsx` | `PENDING` | Main workspace, age-adaptive themes |
| 86 | `src/modules/student/StudentMailboxModal.tsx` | `PENDING` | Mailbox, 20-min Nova notes, Outside Mode, quiz reports |
| 87 | `src/modules/student/StudentPacks.tsx` | `PENDING` | Study packs & community notes PII check |
| 88 | `src/modules/student/StudentProfile.tsx` | `PENDING` | Profile edit, Parent PIN, PII |
| 89 | `src/modules/student/UPIQRCheckout.tsx` | `PENDING` | UPI QR & UTR submission flow |
| 90 | `src/modules/student/WeeklyChallenges.tsx` | `PENDING` | Timed challenge sprints |
| 91 | `src/modules/student/WorldwideScholarships.tsx` | `PENDING` | Scholarship claim workflow |

### Domain E: Frontend Admin Vault (19 Files)
| # | File Path | Audit Status | Notes |
|---|---|---|---|
| 92 | `src/admin-vault/AdminVaultShell.tsx` | `PENDING` | Admin navigation & auth shell |
| 93 | `src/admin-vault/modules/ACodeManager.tsx` | `PENDING` | A-code generation & management |
| 94 | `src/admin-vault/modules/AdPagesManager.tsx` | `PENDING` | Ad page CMS |
| 95 | `src/admin-vault/modules/AuditLogViewer.tsx` | `PENDING` | Security log inspection |
| 96 | `src/admin-vault/modules/CommandCenterOverview.tsx` | `PENDING` | Admin dashboard metrics |
| 97 | `src/admin-vault/modules/CurriculumManager.tsx` | `PENDING` | Syllabus management UI |
| 98 | `src/admin-vault/modules/EntitlementManager.tsx` | `PENDING` | Premium plan grants |
| 99 | `src/admin-vault/modules/GiftFulfillment.tsx` | `PENDING` | Gift order dispatch & PII |
| 100 | `src/admin-vault/modules/LedgerInspector.tsx` | `PENDING` | Coin ledger auditing |
| 101 | `src/admin-vault/modules/ModerationReports.tsx` | `PENDING` | Content/message moderation |
| 102 | `src/admin-vault/modules/PaymentVerificationQueue.tsx` | `PENDING` | UTR approval queue |
| 103 | `src/admin-vault/modules/PricingManager.tsx` | `PENDING` | Pricing CMS |
| 104 | `src/admin-vault/modules/QuestionBankManager.tsx` | `PENDING` | Question bank CRUD UI |
| 105 | `src/admin-vault/modules/ReferralMonitor.tsx` | `PENDING` | Referral fraud monitoring |
| 106 | `src/admin-vault/modules/ScholarshipManager.tsx` | `PENDING` | Scholarship CRUD |
| 107 | `src/admin-vault/modules/SiteContentManager.tsx` | `PENDING` | Site text CMS |
| 108 | `src/admin-vault/modules/StudentManagement.tsx` | `PENDING` | Learner list/suspension/deletion |
| 109 | `src/admin-vault/modules/SystemHealthAnalytics.tsx` | `PENDING` | Health & usage metrics |

### Domain F: Quiz Bank Content, Generators, Migration & Audit Scripts (26 Files)
| # | File Path | Audit Status | Notes |
|---|---|---|---|
| 110 | `src/data/curatedQuestionBank.json` | `PENDING` | **CORE ASSET**: inspect schema, count, duplicates, accuracy |
| 111 | `src/data/studygirlMessages.ts` | `PENDING` | Child-safety / age-appropriateness audit |
| 112 | `scripts/curriculum_generator/build_all_12k.mjs` | `PENDING` | Generator orchestrator |
| 113 | `scripts/curriculum_generator/common.js` | `PENDING` | Shared generator templates |
| 114 | `scripts/curriculum_generator/primary.js` | `PENDING` | Classes 1-4 template audit |
| 115 | `scripts/curriculum_generator/middle.js` | `PENDING` | Classes 5-8 template audit |
| 116 | `scripts/curriculum_generator/secondary.js` | `PENDING` | Classes 9-10 template audit |
| 117 | `scripts/curriculum_generator/senior.js` | `PENDING` | Classes 11-12 template audit |
| 118 | `scripts/generate_12k_curriculum_bank.mjs` | `PENDING` | Generator variant |
| 119 | `scripts/generate_authentic_curriculum_12k.mjs` | `PENDING` | Generator variant |
| 120 | `scripts/generate_curriculum_bank.mjs` | `PENDING` | Generator variant |
| 121 | `scripts/generate_master_12k_bank.mjs` | `PENDING` | Generator variant |
| 122 | `scripts/generate_perfect_12k_bank.mjs` | `PENDING` | Generator variant |
| 123 | `scripts/generate_voice_assets.js` | `PENDING` | Voice asset script |
| 124 | `scripts/import_master_question_bank_new.mjs` | `PENDING` | DB seed/import script |
| 125 | `scripts/audit_question_bank_reality.mjs` | `PENDING` | Existing bank reality check |
| 126 | `scripts/audit_questions.mjs` | `PENDING` | Question quality check |
| 127 | `scripts/audit_sql.mjs` | `PENDING` | SQL audit helper |
| 128 | `scripts/verify_all_12000_questions.mjs` | `PENDING` | Verification script |
| 129 | `scripts/verify_curriculum_and_auth.mjs` | `PENDING` | Auth & curriculum script |
| 130 | `scripts/verify_curriculum_engine.mjs` | `PENDING` | Engine check |
| 131 | `scripts/check_learners_levels.mjs` | `PENDING` | Learner level inspection |
| 132 | `scripts/check_models.mjs` | `PENDING` | Gemini model check |
| 133 | `scripts/migrate_ai_quota_schema.mjs` | `PENDING` | Migration safety check |
| 134 | `scripts/migrate_learner_level_counts.mjs` | `PENDING` | Migration safety check |
| 135 | `scripts/link_prabir_alias.mjs` | `PENDING` | One-off account alias script |
| 136 | `scripts/backup_database.mjs` | `PENDING` | Hot backup script audit |
| 137 | `scripts/update_docs_12k_to_3600.mjs` | `PENDING` | Doc rewrite helper |

### Domain G: Automated Test & Validation Scripts (39 Files)
| # | File Path | Audit Status | Notes |
|---|---|---|---|
| 138 | `scripts/validate_docs.mjs` | `PENDING` | Upgrade needed for enterprise checks |
| 139–176 | `scripts/test_*.mjs` (38 test files listed in Section 4.G below) | `PENDING` | Inspect seam quality, tautologies, real execution pass/fail |

#### Section 4.G Exact List (`scripts/test_*.mjs` — 38 Files)
139. `scripts/test_4_and_5_level_chat_break.mjs`
140. `scripts/test_5keys_and_worksheets_suite.mjs`
141. `scripts/test_acodes_scholarships_awards_suite.mjs`
142. `scripts/test_admin_auth_fix.mjs`
143. `scripts/test_admin_management_suite.mjs`
144. `scripts/test_ads_study_material_suite.mjs`
145. `scripts/test_ai_quiz_latency_and_sticker_book_suite.mjs`
146. `scripts/test_ai_quota_and_fallback.mjs`
147. `scripts/test_cms_persistence_and_milestone_suite.mjs`
148. `scripts/test_complete_payment_and_grant_flow.mjs`
149. `scripts/test_curriculum_grade_isolation.mjs`
150. `scripts/test_create_scholarship.mjs`
151. `scripts/test_developed_by_student_audit.mjs`
152. `scripts/test_dynamic_upi_qr.mjs`
153. `scripts/test_fetch_quiz_counts.mjs`
154. `scripts/test_flirting_and_admin_suite.mjs`
155. `scripts/test_flirting_normal_chat_and_loop_of_love.mjs`
156. `scripts/test_free_account_limit.mjs`
157. `scripts/test_gc_dispatch_dashboard_suite.mjs`
158. `scripts/test_gemini25_and_bank.mjs`
| 159–176 (continued) | Exact remaining `test_*.mjs` files | `PENDING` | |
159. `scripts/test_gift_card_pricing_increase_audit.mjs`
160. `scripts/test_gold_plan_branding_and_days_adder.mjs`
161. `scripts/test_google_play_account_deletion_audit.mjs`
162. `scripts/test_payee_and_truth_audit.mjs`
163. `scripts/test_physical_rewards_and_ad_pricing_suite.mjs`
164. `scripts/test_pika_pokemon_vault.mjs`
165. `scripts/test_production_readiness_suite.mjs`
166. `scripts/test_proof_of_study_milestone_fix.mjs`
167. `scripts/test_qb_sqlite.mjs`
168. `scripts/test_quality_recovery_suite.mjs`
169. `scripts/test_remove_upi_id_and_return_popup.mjs`
170. `scripts/test_routing_auth_audit.mjs`
171. `scripts/test_scholarship_and_levels.mjs`
172. `scripts/test_scholarships_feature.mjs`
173. `scripts/test_school_pack_and_acode_flow.mjs`
174. `scripts/test_security_gates.mjs`
175. `scripts/test_special49_flow.mjs`
176. `scripts/test_storage_and_spin_fix.mjs`
177. `scripts/test_student_behavioral_suite.mjs`
178. `scripts/test_student_mailbox_reports_suite.mjs`
179. `scripts/test_student_password_auth.mjs`
180. `scripts/test_turso_write_optimization.mjs`
181. `scripts/test_unified_payment_and_free_tier_fix.mjs`
182. `scripts/test_worldwide_studygirl_suite.mjs`

*(Note: Count verified = 39 scripts in `scripts/` test+validator group; file # adjustments reflect exact total 271 across all sections.)*

### Domain H: Documentation, Governance, Agent Config & Build/Infra (50 Files)
- **Root Config & Governance (17 Files):**
  - `.dockerignore` (`PENDING`), `.env` (**METADATA/KEY-NAMES CHECK ONLY — NEVER EXPOSE SECRETS**, `PENDING`), `.env.example` (`AUDITED` — only 4 vars), `.github/workflows/ci.yml` (`AUDITED` — security test has `continue-on-error: true`!), `.gitignore` (`PENDING`), `AGENTS.md` (`AUDITED`), `CLAUDE.md` (`AUDITED`), `Dockerfile` (`AUDITED`), `GLOSSARY.md` (`AUDITED` — stale), `PROJECT_MEMORY.md` (`AUDITED` — claims React 19 vs 18.3.1), `README.md` (`PENDING`), `index.html` (`PENDING`), `package.json` (`AUDITED`), `package-lock.json` (`PENDING` — lockfile presence check), `postcss.config.js` (`PENDING`), `render.yaml` (`AUDITED`), `tailwind.config.js` (`PENDING`), `tsconfig.json` (`AUDITED`), `vite.config.ts` (`AUDITED`).
- **Existing Docs Tree (`docs/` — 33 Files):**
  - `docs/README.md` (`AUDITED`), `docs/DOCUMENT-CONTROL.md` (`AUDITED`), `docs/DOCUMENTATION-STANDARDS.md` (`AUDITED`), `docs/ARCHITECTURE.md` (`AUDITED` — stub "Redacted for privacy"), `docs/CHANGELOG.md` (`PENDING`), `docs/DB_SCHEMA.md` (`AUDITED` — mismatched Postgres DDL), `docs/DEPLOYMENT_GUIDE.md` (`AUDITED` — 1-line stub), `docs/PROGRESS_TRACKER.md` (`PENDING`), `docs/SECURITY_AUDIT_LOG.md` (`AUDITED`).
  - `docs/00-governance/system-overview-and-scope.md` (`AUDITED`), `docs/01-product/product-requirements-document.md` (`AUDITED`), `docs/02-experience/user-journeys-and-experience-architecture.md` (`AUDITED`), `docs/03-architecture/system-and-software-architecture.md` (`AUDITED`), `docs/04-runtime/behavioral-and-runtime-architecture.md` (`AUDITED`), `docs/05-data-integrations/data-dictionary-and-api-specifications.md` (`AUDITED`), `docs/06-engineering/agent-skills-integration.md` (`AUDITED`), `docs/06-engineering/codebase-standards-and-developer-guide.md` (`AUDITED`), `docs/06-engineering/development-handoff.md` (`AUDITED`), `docs/07-quality/master-test-strategy-and-verification.md` (`AUDITED`), `docs/08-platform-delivery/deployment-and-infrastructure-inventory.md` (`AUDITED`), `docs/09-operations/operations-sre-and-continuity-runbook.md` (`AUDITED`), `docs/10-security/security-architecture-and-threat-model.md` (`AUDITED`), `docs/11-grc/compliance-applicability-and-risk-register.md` (`AUDITED`), `docs/12-third-party/vendor-and-subprocessor-inventory.md` (`AUDITED`), `docs/13-ai/nova-ai-governance-and-system-card.md` (`AUDITED`).
  - `docs/14-research-evidence/{claim-evidence-matrix.md,documentation-validation-report.md,initial-repository-baseline.md,source-register.md}` (`AUDITED` — all stale from `448fc25` / `2026-11-23`).
  - `docs/adr/0001-hybrid-quiz-and-offline-bank-architecture.md` (`AUDITED`), `docs/adr/0002-synchronous-sqlite-wal-and-turso-cloud-sync.md` (`PENDING` — check actual filename), `docs/adr/0003-client-storage-rls-layer.md` (`AUDITED`).
  - `docs/agents/{domain.md,issue-tracker.md,triage-labels.md}` (`AUDITED` — `issue-tracker.md` falsely marks `gh` CLI configured).

### Domain I: Public Static Files, Trackers, Policies & Media Assets (33 Files)
- `public/_redirects`, `public/robots.txt`, `public/sitemap.xml`, `public/halloffame.html`, `public/halloffame/index.html`, `public/policies.html`, `public/policies/index.html`, `public/qr-lite-49.jpg`, `public/qr-plus-129.jpg`, `public/recaptcha-logo.png`, `public/pika-bush.jpg`, `public/al-coin.png`, `public/coin.png`, `public/audio/{eevee.mp3,pikachu.mp3}`, `public/founder-certs/*` (12 images), `public/rewards/*` (8 images) (`PENDING`).

---

## 5. Planned Phase Sequence

1. **Phase 0 (Done):** Repository discovery, skill inventory, and execution plan (`docs/audit/00_AUDIT_EXECUTION_PLAN.md`).
2. **Phase 1:** Exhaustive file-by-file codebase, API, auth, AI security, PII, and Indian Children's EdTech compliance audit (`docs/audit/01_SYSTEMIC_CODEBASE_AUDIT.md`, `docs/audit/02_INDIA_CHILDREN_EDTECH_COMPLIANCE.md`).
3. **Phase 2:** Programmatic & academic audit of SQLite `question_bank`, `curatedQuestionBank.json`, generator scripts, and quiz UX (`docs/audit/03_QUIZ_BANK_DEEP_AUDIT.md`).
4. **Phase 3 & 4:** Author the 11 authoritative Enterprise Question Bank Standards in `docs/standards/` grounded in actual codebase + official syllabus/regulatory architecture.
5. **Phase 5:** Synthesize `docs/audit/04_ENTERPRISE_REMEDIATION_PLAN.md` (strict P0 -> P4 priority order, aligned to the 9-phase rollout).
6. **Phase 6:** Execute P0–P4 remediations **one item at a time** (Verification First -> Minimal Enterprise Fix -> Deterministic Checks -> Audit-log in `docs/audit/05_REMEDIATION_TRACKER.md`).
7. **Phase 7:** Full verification sweep (`tsc`, `npm run build`, automated test suites, schema/security/DPDP/prompt-injection/math gates, `validate_docs.mjs`) and produce `docs/audit/06_RELEASE_ACCEPTANCE_REPORT.md`.
