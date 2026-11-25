# Release Gates, 16-Point Acceptance & Governance Policy

**Document ID:** AL-STD-0009  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE  
**Classification:** Release Governance Policy  
**Owner:** Quality Engineering Lead & Enterprise Governance Lead  

---

## 1. Non-Bypassable Content Quality Gates

A question or chapter MUST pass **all 9 automated gates** before status transitions to `published`:
1. **100%** required metadata completeness (`board`, `syllabusVersionId`, `grade`, `subjectId`, `chapterId`, `learningObjectiveId`, `questionFormat`, `difficulty`, `sourceRecordId`).
2. **0%** exact duplicate or trivial numeric reskin conflicts in `published` pool.
3. **100%** deterministic answer-key verification pass (`question_answers.verificationMethod` recorded).
4. **100%** subject-specific schema & asset validation pass rate (no missing referenced diagrams).
5. **100%** verified curriculum & LO mapping (zero out-of-syllabus grade/board leakage).
6. **100%** verified step-by-step explanations & helpful hints (zero `< 30`-char stubs).
7. **100%** stored `source_records` provenance for syllabus/citation claims.
8. **0** unreviewed items in production (`question_reviews.decision = 'APPROVED'` required with `reviewerId != authorId`).
9. **0** unresolved P0/P1 critical defects (`item_defect_reports` open count = 0).

## 2. Sixteen-Point Chapter & Release Acceptance Checklist

Every incremental chapter publish executes this machine-checked checklist:
1. Curriculum manifest (`curriculum_versions`) approved & immutable.
2. Chapter inventory verified against board official syllabus.
3. Learning Objectives mapped with prerequisite graph.
4. Dynamic blueprint coverage score >= threshold across all **8 completeness dimensions**.
5. Metadata 100% populated.
6. Answer validation 100% deterministic pass.
7. Explanation & misconception validation 100% pass.
8. Exact + skeleton + near-duplicate audit passed.
9. Independent academic review approved.
10. Board-alignment & command-word review approved (`CBSE` / `CISCE` / `IGCSE` kept distinct).
11. Copyright & originality review passed.
12. Normalized DB schema & strict JSON validation passed.
13. Role-based publishing permissions verified (`SUPER_ADMIN` / authorized reviewer only).
14. Mobile & desktop KaTeX/equation/diagram rendering verified.
15. Immutable `security_audit_logs` release trail recorded (`>= 180` days retention).
16. Zero unresolved critical defects.

## 3. Automated Board Exam Paper QA Gate

Before any board mock exam paper renders under `BOARD_EXAM_SIM`, automated QA MUST verify:
- 100% items belong to current active `syllabusVersionId` (zero deprecated/out-of-syllabus items).
- Chapter weightage matches `assessment_blueprints.sectionsJson`.
- Total marks & per-question marks sum exactly; duration matches blueprint.
- Zero duplicates / near-duplicates within paper or overlapping internal choice pairs.
- Zero missing figures/passages; valid matching marking scheme.

## 4. Defect Withdrawal SLA

Any published item flagged via student `item_defect_reports` with a verified wrong answer key or missing diagram MUST be withdrawn immediately (`lifecycleStatus = 'WITHDRAWN'`) and quarantined from active `fetch-quiz` pools until fixed as a new `question_version`.
