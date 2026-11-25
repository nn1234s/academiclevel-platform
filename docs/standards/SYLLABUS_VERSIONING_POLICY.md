# Immutable Syllabus Versioning & Archive Segregation Policy

**Document ID:** AL-STD-0011  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE  
**Classification:** Curriculum Operations Policy  
**Owner:** Principal Assessment & Curriculum Architect  

---

## 1. Immutable Academic-Year Manifests

Curriculum manifests are **strictly immutable** once published (e.g., `CBSE/2026-27/Class-10/Mathematics`, `IGCSE/2026-28/0580/Mathematics`). Introducing a `2027-28` syllabus creates a **new `curriculum_versions` row** and never overwrites historical manifests, preserving past-year board integrity and student history attribution.

## 2. Ten-Step Syllabus Change Detection & Impact Workflow

When a board publishes rationalizations, new chapters, or revised exam blueprints:
1. Ingest new official circular/syllabus PDF into `source_records`.
2. Diff against prior `curriculum_versions` tree (added, removed, split, renamed, re-weighted chapters/LOs).
3. Classify chapter impact (`UNCHANGED`, `MODIFIED`, `DEPRECATED`, `ADDED`).
4. Audit all linked `questions` under modified/removed LOs.
5. Assign explicit lifecycle action per item:
   - `RETAIN` (aligns unchanged to new version)
   - `REVIEW_ALIGNMENT` (terminology/mark-weight shift)
   - `DEPRECATE` (topic removed from current syllabus)
   - `CREATE_COVERAGE_GAP` (reopen blueprint to `needs_update`)
   - `REASSESS_DIFFICULTY` (tier shift between Core/Extended or competency format)
   - `UPDATE_EXAM_SETS` (regenerate impacted `assessment_blueprints` mock papers)
   - `REPLACE_SOURCE` (link updated `sourceRecordId`)
   - `IMMEDIATE_WITHDRAW` (any factual invalidity)
6. Update dynamic chapter completeness scores across all 8 dimensions.
7. Run generation + deterministic validators for newly opened LO gaps.
8. Complete independent academic review (`AL-STD-0007`).
9. Execute 16-point release gate (`AL-STD-0009`).
10. Publish new active `curriculumVersionId` atomically.

## 3. Historical Archive Segregation Rule

Deprecated questions from prior syllabi **MUST NEVER** silently appear in active `LEARN_AND_PRACTISE` or current board exam simulations. If retained for reference, they MUST reside under explicitly labeled `ARCHIVE_PREVIOUS_SYLLABUS` collections with clear academic-year badges (e.g., `Archived: Pre-2026 Rationalized Syllabus`).
