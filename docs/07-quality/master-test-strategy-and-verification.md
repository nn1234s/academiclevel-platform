# AcademicLevel — Master Test Strategy & Verification

**Document ID:** AL-QUAL-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Quality Assurance Architecture  
**Owner:** Quality Engineering Lead  

---

## 1. Test Pyramid & Verification Strategy

AcademicLevel enforces a four-tier automated testing strategy designed to prevent student-facing regressions:

```text
                  ▲
                 / \
                /   \     Tier 4: Production Build Gate (tsc && vite build)
               /-----\
              /       \    Tier 3: 16-Step Real-Student Behavioral Suite
             /---------\
            /           \   Tier 2: Advertised Question Count Matching Suite
           /-------------\
          /               \  Tier 1: 12k Database & Subject Isolation Suite
         /─────────────────\
```

---

## 2. Automated Test Suite Inventory

### Tier 1: Database Total & Data Integrity Suite
* **Script:** [`scripts/test_quality_recovery_suite.mjs`](../../scripts/test_quality_recovery_suite.mjs)
* **Execution:** `node scripts/test_quality_recovery_suite.mjs`
* **Test Scope:**
  - Verifies exactly 12,000 distinct questions in `question_bank`.
  - Verifies 0 empty question texts and 0 invalid `correctIndex` values (must be 0, 1, 2, or 3).
  - Verifies full subject allocations across all 12 classes (Math: 300, CS: 250, Science: 200, English: 150, Social: 100).
  - Verifies 100% strict subject isolation (zero cross-subject contamination).
  - Verifies spin wheel quadrant center angles (0°, 90°, 180°, 270°).

### Tier 2: Advertised Question Count Matching Suite
* **Script:** [`scripts/test_fetch_quiz_counts.mjs`](../../scripts/test_fetch_quiz_counts.mjs)
* **Execution:** `node scripts/test_fetch_quiz_counts.mjs`
* **Test Scope:**
  - Simulates 12 distinct quiz launch queries across Foundation (10Q), Concept (12Q), Exam-Ready (15Q), and Olympiad (15Q).
  - Proves that query results return the exact advertised count with 0 duplicates.

### Tier 3: Real-Student Behavioral Journey Suite
* **Script:** [`scripts/test_student_behavioral_suite.mjs`](../../scripts/test_student_behavioral_suite.mjs)
* **Execution:** `node scripts/test_student_behavioral_suite.mjs`
* **Test Scope:** Executes all 16 required real-student behavioral actions:
  1. Student enters platform.
  2. Selects Board and Class.
  3. Chooses a Subject.
  4. Picks a specific Chapter/Topic.
  5. Starts a Quiz (validates exact count matching).
  6. Answers Q1 correctly (validates emerald green styling and score increment).
  7. Answers Q2 incorrectly (validates rose red styling, emerald correct styling, no false score increment, and step-by-step explanation).
  8. Attempts to exit mid-quiz (validates in-app confirmation modal; chooses Continue; verifies progress preserved).
  9. Attempts to exit mid-quiz again (chooses Leave; verifies 0 false completion records, 0 coins awarded).
  10. Completes full assessment (verifies results screen, passing grade >= 70%, +25 Study Coins awarded).
  11. Spins Daily Wheel across 5 consecutive multiturn spins (verifies exact quadrant center landing).
  12. Opens Student Mailbox (verifies prominent red close button and diagnostic breakdown).
  13. Asks Nova AI a question (verifies Socratic reasoning prompt).
  14. Simulates Nova offline failure (verifies transparent fallback without claiming live AI).
  15. Tests theme initialization (verifies light mode default for first-time visitors).
  16. Audits codebase text (verifies zero Codingal / IIT Bombay claims remain).

### Tier 4: Production Build Verification Gate
* **Command:** `cmd /c "npm run build"` (`tsc && vite build`)
* **Test Scope:** Validates 100% strict TypeScript types and Vite bundling without warnings or compilation failures.

---

## 3. Platform & Browser Compatibility Matrix

| Operating System / Platform | Browser Engine | Compatibility Status | Tested Features |
| :--- | :--- | :--- | :--- |
| **Windows 11 / 10** | Google Chrome (V8 / Blink) | **VERIFIED — COMPATIBLE** | Full SPA, Quiz Engine, Audio, Spin Wheel |
| **Windows 11 / 10** | Microsoft Edge (Blink) | **VERIFIED — COMPATIBLE** | Full SPA, UPI QR, MathJax / KaTeX formulas |
| **macOS (Sonoma / Sequoia)** | Apple Safari (WebKit) | **VERIFIED — COMPATIBLE** | Sticky headers, auto-scroll offset, touch gestures |
| **iOS / iPadOS (16+)** | Mobile Safari (WebKit) | **VERIFIED — COMPATIBLE** | Mobile drawer, Mailbox modal touch targets |
| **Android (12+)** | Chrome Mobile (Blink) | **VERIFIED — COMPATIBLE** | Responsive cards, QR code zoom, touch dwell timer |
