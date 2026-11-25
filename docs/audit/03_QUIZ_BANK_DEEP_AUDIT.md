# AcademicLevel — Quiz Bank Deep Audit (Class, Board, Subject, Chapter & Delivery UX)

**Document ID:** AL-AUD-0003  
**Created:** 2026-11-25  
**Status:** VERIFIED — IMPLEMENTED (Audit of `academiclevel_prod.db` + `curatedQuestionBank.json` + Delivery Pipeline at `5604856`)  
**Classification:** Internal Assessment & Curriculum Audit  
**Owner:** Principal Assessment & Curriculum Architect  

---

## 1. Structural Inventory (Observed Database Reality)

Both `server/data/academiclevel_prod.db` (`question_bank` table) and `src/data/curatedQuestionBank.json` (`2,728,434` bytes) contain an identical **3,600 rows** (`ID_OVERLAP = 3600`), completely contradicting stale repository claims of `12,000` questions across `CBSE / ICSE / IGCSE`.

### 1.1 Exact Board, Grade, Subject, Tier & Difficulty Breakdown (SQLite Verified)
- **Boards Present:**
  - `CBSE`: **3,600 (100.0%)**
  - `ICSE`: **0 (0.0%)**
  - `Cambridge IGCSE`: **0 (0.0%)**
- **Classes Covered (Uniform Hardcoded Quota):**
  - **Classes 1–10 (each class):** Exactly **300 questions** (`math`: 75, `english`: 75, `science`: 75, `social`: 75) — zero `cs`/`coding` rows in SQLite despite UI tabs & docs advertising Coding/CS!
  - **Classes 11–12 (each class):** Exactly **300 questions** (`math`: 50, `physics`: 50, `chemistry`: 50, `biology`: 50, `english`: 50, `humanities`: 50).
- **Level Nodes:** `FOUNDATION`: 900 | `CONCEPT`: 900 | `EXAM_READY`: 900 | `OLYMPIAD`: 900 (assigned mechanically `idx % 4` in `scripts/import_master_question_bank_new.mjs:189`, NOT by pedagogical complexity!).
- **Difficulty Labels:** `EASY`: 1,440 | `MEDIUM`: 1,440 | `HARD`: 720 (static tags never recalibrated by empirical performance).
- **Formatting Gaps:** `bad_options_len` = 0, `duplicate_options_within_item` = 0, `bad_correct_index` = 0, `missing_explanation` = 0, **short explanations (< 30 chars) = 171** (e.g., `"Vowels are a, e, i, o and u."`).

---

## 2. Storage & Data Architecture Audit

1. **Client Bundle Leakage (`src/services/offlineBankService.ts:3`):** Static `import curatedBankJson from '../data/curatedQuestionBank.json'` ships all 3,600 questions **and their `correctIndex` answers** inside the browser JS bundle (`3.75 MB` unsplit chunk), wrecking low-bandwidth Indian mobile performance and enabling instant DevTools answer extraction.
2. **Flat Denormalized Table (`server/db.js:277-291`):** Single flat `question_bank` table with free-text `topicTag` strings (e.g. English/Science/Social across Class 1–2 each collapse into **1 coarse `topicTag`** — `'Foundational literacy'`, `'Everyday Science and EVS'`, `'History, Geography, Civics and General Knowledge'`), zero `curriculum_version` manifest, zero `learning_objective_id`, zero `question_version` history, and zero `answer_options` / `sources` / `reviews` / `responses` relational separation.
3. **Historical Analytics Corruption Risk (`server/db.js:119-130`):** `quiz_attempts` records only aggregate `score` / `maxScore` (`accuracyPercent`) — no per-item `responses` or `questionVersionId`, making item-level psychometrics (facility index $p$, discrimination $D$, distractor analysis) impossible and breaking auditability whenever questions change.

---

## 3. Academic, Psychometric & Curriculum Quality Audit

| Quality Failure | Measured Programmatic Evidence | Severity | Root Cause |
|---|---|---|---|
| **1. Zero ICSE & IGCSE Bank Content** | `CBSE: 3,600`, `ICSE: 0`, `IGCSE: 0`. Yet UI allows choosing ICSE/IGCSE and fetches `/api/quizzes/fetch-quiz` which ignores `board` in SQL (`WHERE grade = ? AND subjectId = ?` at `server/api.js:1981,1992`)! | **P0-Critical** | `import_master_question_bank_new.mjs:202` hardcoded `'CBSE'`, and `fetch-quiz` omits `WHERE board = ?`, silently serving CBSE content (e.g. `NCERT`, `Indian Constitution`!) to Cambridge IGCSE students! |
| **2. Massive Cross-Grade Question Cloning** | Strip the wrapper prefix `"In Class X Subject review activity Y..."`: **2,227 of 3,600 questions (61.9%)** are **verbatim clones across multiple grades** (e.g., identical items stamped into Class 1 & 2, 3–5, 6–8, 9–10, 11–12). | **P0-Critical** | Generators and master bank reused shared grade-band pools without grade-specific learning objective differentiation. |
| **3. Severe Grade/Syllabus Misalignment** | Class 10 Math contains **Differentiation (`y = x^6`)** (`AL-C10-MATH-002`) and **Matrix Determinants** (`AL-C10-MATH-003`) — topics belonging to Class 11/12/ISC/AS, NOT CBSE Class 10! | **P0-Critical** | Unvalidated import & AI/script templates lacked syllabus-version LO gating and deterministic syllabus checks. |
| **4. Excessive Reading Load in Classes 1–2** | Every stem is inflated by a 15–19 word synthetic wrapper (`"In Class 1 Mathematics review activity 1, answer the following: During a guided science-fair activity, consider this mathematics question: ..."`), yielding **34.0 words average (max 45, 247/300 > 25 words)** in Class 1 & 2! | **P1-High** | Generator injected noisy filler phrases to make cloned items look syntactically unique to hash checks. |
| **5. Missing Subjects & Collapsed Chapters** | `question_bank` has **0 Computer Science (`cs`) questions** despite UI tabs (`CourseCatalogue`, `CurriculumService`); Classes 1–2 English/Science/Social collapse entire textbooks into **1 single `topicTag`**, breaking chapter-wise practice! | **P1-High** | Subject normalization & bank seeding excluded CS and real chapter-level curriculum manifests. |
| **6. Wrong Math Logic & Weak Verification** | `scripts/generate_12k_curriculum_bank.mjs:2497-2499` conflates `D > 0` and `D = 0`; `audit_questions.mjs:25` crashes (`no such column: options`); 0 CAS/symbolic math validators exist in production pipeline; all `levelNode` tags were assigned mod-4 (`idx % 4`). | **P1-High** | No deterministic math/science/schema/duplicate gate prior to DB ingestion. |
| **7. Unsafe Chapter Selection Silent Mix** | `/api/quizzes/fetch-quiz` (`server/api.js:1989-1996`) silently falls back to random non-chapter `levelNode` questions if a chapter has fewer than 6 rows, violating zero-contamination promises. | **P1-High** | Missing strict chapter filter invariant when `chapter` parameter is provided. |

---

## 4. Delivery & Student Quiz UX Audit

1. **Client-Side Answer Keys & Evaluation (`QuizEngine.tsx:362`, `server/api.js:2060`):** Answers can be read from HTTP payload or DevTools JS bundle before answering; server accepts unverified score POSTs.
2. **Jump-Reanswer Cheat (`QuizEngine.tsx:393-400`):** Clicking question jump buttons resets `selectedOption(null)` and `isAnswerSubmitted(false)`, allowing re-submission of already-answered items or inconsistent score tracking.
3. **Broken Scoring Mode Badge (`QuizEngine.tsx:830`):** Displays `NTA Speed Simulator (+4 / -1)` to Class 11–12 students while still scoring plain 1-point accuracy with no negative marking.
4. **Classes 1–5 Punitive & Unreadable UX:** Exit guard (`App.tsx:2353-2445`) triggers an alarming red X modal + Parent PIN check even for a 6-year-old child; several secondary views (`MistakeVault`, `PracticeWorksheetViewer`, `QOTD`, `QuizDuelArena`) fail to render KaTeX formulas on mobile; zero in-app question defect report button exists inside `QuizEngine.tsx`.
5. **Missing Adaptive & Mastery Architecture:** Current `course_progress` tracks 4 static tier nodes per subject, **NOT** multi-signal Learning Objective mastery, mistake-remediation unseen validation, or board-specific exam paper blueprints (`CBSE` vs `ICSE` vs `Cambridge IGCSE` Core/Extended components).
