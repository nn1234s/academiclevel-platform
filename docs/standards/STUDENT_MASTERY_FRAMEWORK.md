# Student Mastery, Adaptive Practice & Psychometric Calibration Framework

**Document ID:** AL-STD-0010  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE  
**Classification:** Learning Intelligence Standard  
**Owner:** AI Evaluation Lead & Principal Assessment Architect  

---

## 1. Dual Architecture: Mastery vs Examination Simulation

AcademicLevel decouples **Chapter/LO Mastery** (formative skill building) from **Board Examination Simulation** (timed paper performance).

### 1.1 Nine Chapter Practice Modes
1. `LEARN_AND_PRACTISE` (hints + immediate guided explanation)
2. `BASIC_PRACTICE` (foundational confidence builders)
3. `CONCEPT_MASTERY` (deep conceptual understanding & misconception checks)
4. `APPLICATION_PRACTICE` (real-world & word-problem transfer)
5. `REASONING_CHALLENGE` (analytical & HOTS reasoning)
6. `EXAM_STYLE_PRACTICE` (board command-word alignment by CBSE/CISCE/IGCSE)
7. `MISTAKE_REVISION` (targets previously missed LOs using **unseen equivalent items**)
8. `MIXED_PRACTICE` (interleaved across chapter subtopics)
9. `TIMED_PRACTICE` (explicitly labeled speed practice — disabled/hidden as unsolicited pressure for Classes 1–5)

---

## 2. Seven-Signal Learning Objective (LO) Mastery Model

Raw quiz percentages do not measure durable mastery. Mastery is tracked **per Learning Objective** combining **7 signals**:
1. **Accuracy:** Weighted correctness across attempts on the LO.
2. **Consistency:** Rolling performance stability across sessions (not a lucky single guess).
3. **Difficulty Attempted:** Performance across `EASY`, `MEDIUM`, and `HARD` tiers.
4. **LO Breadth:** Distinct sub-skills/formats completed within the LO.
5. **Unseen Fresh-Item Performance:** Accuracy strictly on never-before-seen items (must be `>= 1` fresh validation pass).
6. **Retention After Time Gap:** Accuracy when re-tested after spaced revision delay.
7. **Transfer to Novel Contexts:** Accuracy on cross-topic or application variants.

### 2.1 Six Mastery Stages
`NOT_ASSESSED` -> `INTRODUCED` -> `DEVELOPING` -> `COMPETENT` -> `PROFICIENT` -> `MASTERED`

---

## 3. Eight-Step Adaptive Practice Loop & Spaced Revision

1. **Diagnose** current LO state from recent telemetry.
2. **Identify Weak LOs** (`DEVELOPING` or decaying retention).
3. **Select Matched Unseen Items** calibrated to target difficulty and preferred format.
4. **Adjust Challenge Dynamically** (step down on consecutive errors, step up after confident streak).
5. **Remediate Errors Immediately** with step-by-step concept explanation and misconception note.
6. **Schedule Spaced Revision:** Initial intervals (`Day 1` next session -> `Day 3` -> `Day 7` -> retention-adapted `14d/30d` intervals, shortened on lapse and extended on recall).
7. **Validate Mastery on Unseen Equivalent Items:** **NEVER** promote mastery by re-serving verbatim missed questions — always test transfer on a different unseen item under the same LO.
8. **Update `lo_mastery_records`** atomically after server response verification.

---

## 4. Phased Psychometric Calibration Roadmap & Statistical Gates

| Phase | Sample Size Gate (`quiz_responses` / item) | Calibration Method | Defect vs Difficulty Diagnostic |
|---|---|---|---|
| **Phase 0 (Initial)** | `N < 30` | Expert/Author `estimatedDifficulty` flagged `PROVISIONAL_UNVERIFIED` | Never report AI-guessed difficulty as calibrated |
| **Phase 1 (CTT)** | `N >= 30` valid student responses across target grade | Compute Classical Test Theory metrics: Facility Index $p = \frac{C}{N}$, Point-Biserial / Discrimination Index $D$, distractor selection % | **Defect Alert:** $p < 0.25$ paired with $D \le 0.10$ OR top distractor selected more often by high-scorers flags broken key / ambiguous stem / out-of-syllabus defect |
| **Phase 2 (Fairness / DIF)** | `N >= 100` per subgroup | Monitor unexpected accuracy divergence across boards, language modes (`en`/`hi`), and mobile vs desktop rendering | Privacy-preserving cohort metrics only (DPDP Sec 9 compliant — zero personal profiling) |
| **Phase 3 (IRT / CAT)** | `N >= 200–500+` representative responses | Gate 2PL/3PL Item Response Theory (ICCs, ability $\theta$, TIF, CAT selection) strictly behind statistical sufficiency | Blocked automatically until sample threshold met |
