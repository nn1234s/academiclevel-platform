# Academic Review & Editorial Independence Protocol

**Document ID:** AL-STD-0007  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE  
**Classification:** Content Governance Standard  
**Owner:** Enterprise Documentation & Curriculum Lead  

---

## 1. Mandatory Separation of Generator and Reviewer

Under AcademicLevel Enterprise Governance, **the AI model, script, or human author that generated a `question_version` CANNOT be its sole approver**. Every transition from `validation_in_progress` -> `review_in_progress` -> `approved` requires a traceable `question_reviews` record authored by an **independent reviewer identity** (`reviewerId != authorId`).

## 2. Four Required Independent Review Checks

1. **Academic Correctness & Step Integrity:** Verify premise accuracy, unambiguous phrasing, single defensible correct answer (no dual-correct distractors), and complete misconception coverage.
2. **Board & Syllabus Alignment:** Verify fit to specific board (`CBSE` vs `CISCE` vs `IGCSE` Core/Extended) command words, prescribed terminology, and exact `syllabusVersionId` chapter scope.
3. **Age & Fairness Bias Check (Classes 1–12):** Verify grade-appropriate vocabulary, zero unfair regional/cultural idioms, British/Indian English consistency, and Classes 1–5 reading-load limits (`<= 18` words for Classes 1–2).
4. **Copyright & Translation Integrity:** Verify item originality (no lifted copyrighted publisher text/diagrams) and, for localized/Hinglish variants, pass all **8 Translation Validation Steps**:
   1. Source English item already `approved`.
   2. Pedagogical terminology & technical terms locked (no literal distortion of formulas/command words).
   3. Independent semantic translation.
   4. Back-translation or independent bilingual review check.
   5. Mathematical/scientific symbol & unit parity check.
   6. Distractor plausibility parity check (prevent grammatical gender/case giveaways in Hindi/Hinglish!).
   7. Mobile rendering & Unicode script legibility check.
   8. Explicit translation `question_reviews` sign-off (`reviewedBy`, `reviewedAt`, `notes`).

## 3. Immutable Review Audit Trail

Every approval, rejection, request-for-revision, or withdrawal appends an immutable record to `question_reviews` (`id`, `questionVersionId`, `reviewerId`, `reviewerRole`, `decision`, `rubricScoresJson`, `comments`, `reviewedAt`) and mirrors into `security_audit_logs`.
