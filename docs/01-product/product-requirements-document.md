# AcademicLevel — Product Requirements Document (PRD)

**Document ID:** AL-PROD-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Product Specification  
**Owner:** Product & Business Analyst Lead  

---

## 1. Product Context & Objectives

AcademicLevel was designed to solve three critical flaws in modern Indian edtech:
1. **Rote Homework Copying:** Generic AI chatbots (e.g. standard ChatGPT) output final answers without teaching, fostering cognitive passivity and academic decline. AcademicLevel locks its Nova AI to Socratic pedagogy that never writes answers directly.
2. **Subject & Question Chaos:** Unstructured question banks mix addition with algebra or English grammar with mathematics. AcademicLevel establishes strict chapter and subject isolation with calibrated 4-tier difficulty nodes.
3. **Lack of Tangible Student Motivation:** Abstract points fail to engage younger students. AcademicLevel links study coins earned through academic accuracy (>= 70%) to tangible rewards (Pokemon stationery, water bottles, and gift vouchers) dispatched to student doorsteps.

---

## 2. User Personas

### Persona 1: Primary Learner (Classes 1–4)
* **Theme:** "Explorer Quest" (Bubbly, playful, bright primary colors).
* **Cognitive Needs:** Visual questions, addition/subtraction word problems, picture-based science, and interactive sticker book rewards.
* **Mascot / Persona:** Leo the Lion & Star Buddies.

### Persona 2: Middle School Cadet (Classes 5–8)
* **Theme:** "Tactical Cadet Command" (Sci-Fi, mission radars, amber/indigo accents).
* **Cognitive Needs:** Structured multi-step algebra, scratch/Python coding logic, science lab experiments, and weekly challenge sprints.

### Persona 3: Senior Scholar (Classes 9–12)
* **Theme:** "Board Specimen & Competitive NTA Simulator" (Sleek, focused, dark slate/emerald palette).
* **Cognitive Needs:** Board exam past-year questions (PYQs), marking scheme step-marking guidance, timed assertion-reasoning, and Olympiad HOTS.

### Persona 4: Parent / Guardian
* **Needs:** 4-digit Parent PIN control, daily streak freeze monitoring, physical reward delivery tracking, and performance visibility without intrusive surveillance.

### Persona 5: Super-Admin (ZingQuark Operations)
* **Needs:** Access to `/adminservice` for manual UTR payment approval, merchandise order dispatch tracking, question bank CRUD, and audit log inspection.

---

## 3. Functional Requirements & Acceptance Criteria

### REQ-0001: 4-Tier Progression Pathways
* **Description:** Every subject across all 12 classes must offer four distinct progression nodes:
  - `FOUNDATION`: 10 questions, ~15 minutes, focus on core definitions and formula recall.
  - `CONCEPT`: 12 questions, ~20 minutes, focus on application and misconception fixes.
  - `EXAM_READY`: 15 questions, ~25 minutes, focus on board pattern PyQs and marking keys.
  - `OLYMPIAD`: 15 questions, ~30 minutes, focus on Higher-Order Thinking Skills (HOTS).
* **Acceptance Criteria:**
  - Tab card displays exact question count matching the actual loaded quiz.
  - Quizzes award +25 Study Coins upon passing with >= 70% accuracy.
  - Re-taking completed levels preserves the student's personal best score.

### REQ-0002: Chapter-Wise Syllabus Practice
* **Description:** In addition to 4-tier nodes, students can practice individual syllabus chapters (e.g. Addition, Quadratic Equations, Trigonometry).
* **Acceptance Criteria:**
  - Zero cross-topic jumbling: 100% of served questions match the selected chapter's topic tags.

### REQ-0003: Quiz Interaction & Answer Evaluation Integrity
* **Description:** Immediate, unambiguous feedback on student answer choices:
  - Correct option styled Emerald Green (`bg-emerald-950/50`, `border-emerald-500`) with checkmark.
  - Incorrect selection styled Rose Red (`bg-rose-950/50`, `border-rose-500`) with X-mark.
  - Numeric type casting (`Number(correctIndex)`) ensures visual styling and score counters never contradict each other.

### REQ-0004: Incomplete Quiz Exit Protection
* **Description:** Students navigating away from an active assessment receive an in-app confirmation modal.
* **Acceptance Criteria:**
  - Offers "Continue Assessment" (stay in quiz) vs "Leave Assessment" (exit).
  - Incomplete attempts are saved in browser session for resumption.
  - Incomplete attempts are NOT recorded as completed attempts, and no false completion coins or XP are granted.

### REQ-0005: Nova AI Socratic Tutoring & Offline Fallback
* **Description:** 24/7 AI tutor powered by Google Gemini.
* **Acceptance Criteria:**
  - Guides students with hints, conceptual analogies, and step-by-step logic.
  - When offline or API keys are unavailable, transparently returns `STATIC_CURRICULUM_FALLBACK` using verified textbook tips and charges 0 student credits.

### REQ-0006: Daily Spin Wheel Retention Engine
* **Description:** Gamified reward wheel available once every 24 hours UTC.
* **Acceptance Criteria:**
  - Exact quadrant landing: 2 Coins (Top/0°), 3 Coins (Right/90°), 5 Coins (Bottom/180°), 40 Coins Jackpot (Left/270°).
  - Multi-spin normalization prevents angular drift across consecutive daily spins.
