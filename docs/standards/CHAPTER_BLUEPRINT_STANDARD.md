# Dynamic Chapter Blueprint Standard

**Document ID:** AL-STD-0003  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE  
**Classification:** Curriculum Engineering Standard  
**Owner:** Principal Assessment & Curriculum Architect  

---

## 1. Ban on Fixed-Quota Generation

Fixed quotas (e.g., "50 questions per chapter" or "300 per grade") distort syllabus priorities and incentivize duplicate padding (`2,227` cloned stems found in Phase 2 audit). Instead, each chapter computes `requiredInventoryCount` dynamically from its blueprint parameters:

$$\text{TargetItems}(C) = \sum_{lo \in C.\text{LOs}} \left( \text{DepthMultiplier}(lo) \times \text{DifficultyBandCount} \times \text{FormatMix}(lo) \right) + \text{TransferBuffer}(C)$$

Where:
- **Learning Objectives count ($|LOs|$):** Broad chapters (e.g. Quadratic Equations or Chemical Reactions) require deeper pools than narrow definitions-only topics.
- **Difficulty tiers:** Minimum floor per LO across `EASY`, `MEDIUM`, `HARD` calibrated to the class stage.
- **Cognitive taxonomy (Bloom's):** `RECALL`, `UNDERSTAND`, `APPLY`, `ANALYZE`, `EVALUATE`.
- **Format mix:** `MCQ_SINGLE`, `ASSERTION_REASON`, `CASE_STUDY`, `NUMERICAL_ENTRY`, `DATA_INTERPRETATION`, `CODE_TRACE` (subject to grade stage).
- **Assessment vs Practice Separation:** At least **30% of chapter items** are reserved for unseen `MASTERY_VALIDATION` / spaced-revision checks so students are never validated with verbatim repeats.

## 2. Eight-Dimension Chapter Completeness Score (`0–100%`)

A chapter is ONLY eligible for `coverage_complete` when **all 8 dimensions** pass their configured threshold — **never** based on raw question count alone:
1. **Syllabus Coverage:** % of official subtopics represented.
2. **Learning Objective (LO) Coverage:** % of chapter LOs meeting minimum item floor.
3. **Difficulty Coverage:** Balanced representation across `EASY`, `MEDIUM`, `HARD` for the grade band.
4. **Cognitive Coverage:** Representation beyond rote recall (`APPLY`/`ANALYZE` per stage guidelines).
5. **Question-Type Coverage:** Required mix of conceptual, numerical/application, case/data formats.
6. **Explanation Coverage:** 100% of items have step-by-step solutions + targeted misconception notes.
7. **Assessment Objective (AO) Coverage:** Matches board AOs (e.g. Cambridge AO1/AO2/AO3 or CBSE Competency weighting).
8. **Prerequisite Coverage:** Mapped prerequisite LOs linked for upstream remediation.

## 3. Nine-State Chapter Lifecycle Machine

`not_started` → `curriculum_mapped` → `blueprint_ready` → `generation_in_progress` → `validation_in_progress` → `review_in_progress` → `coverage_complete` → `published` (or `needs_update` upon syllabus revision/defect threshold).

**Mandatory Invariant:** Transition `coverage_complete -> published` is **blocked** without independent academic reviewer sign-off (`AL-STD-0007`) and 100% release gate validation (`AL-STD-0009`).
