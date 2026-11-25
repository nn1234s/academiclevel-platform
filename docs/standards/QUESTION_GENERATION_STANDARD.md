# AI Question Generation Standard & 10-Stage Contract

**Document ID:** AL-STD-0004  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE  
**Classification:** AI & Assessment Engineering Standard  
**Owner:** AI Evaluation Lead & Principal Curriculum Architect  

---

## 1. Elimination of Universal Generation Prompts

Single generic prompts (such as the baseline `/api/ai/generate-quiz` template at `server/api.js:4693`) cause cross-board phrasing collapse, wrong-grade topics, and hallucinated distractors. AcademicLevel enforces **subject-specific, board-scoped structured contracts**.

### 1.1 Structured Generation Contract Fields
Every generation request MUST pass:
- `board` (`CBSE` | `CISCE` | `IGCSE`) & `syllabusVersionId`
- `grade` (`1..12`) & `developmentalStage` (`STAGE_1_FOUNDATION`..`STAGE_5_SENIOR`)
- `subjectId`, `chapterId`, `subtopicId`, `learningObjectiveId`
- `assessmentObjective`, `commandWordsAllowed`, `prerequisites`
- `targetDifficulty`, `cognitiveLevel`, `questionFormat`
- `commonMisconceptions[]` (used explicitly to craft plausible, diagnostically distinct distractors)
- `verifiedSourceIds[]` (closed set of allowed citations)
- `existingBankFingerprints[]` (dedup context preventing reskinned stems)
- `schemaContract` (strict JSON schema without defaulted dummy values)

## 2. Ten Stage-Separated Pipeline Modules

| Stage | Module Role | Hard Input / Output Boundary |
|---|---|---|
| **1. Curriculum Research** | Extract official syllabus structure | Verified PDF/circular -> `source_records` + raw syllabus tree |
| **2. Chapter Architect** | Define chapter LOs, prerequisites, AOs | Syllabus tree -> `learning_objectives` graph |
| **3. Blueprint Generator** | Compute dynamic target counts & matrix | `learning_objectives` -> `chapter_blueprints` |
| **4. Question Generator** | Subject-specific LLM prompt synthesis | Blueprint slot + misconceptions -> Draft `question_versions` |
| **5. Mathematics Verifier** | Programmatic arithmetic/algebra/CAS verification | Draft math item -> Verified numerical/symbolic answer & distractors |
| **6. Science Verifier** | Unit, stoichiometry, formula, empirical check | Draft physics/chem/bio item -> Verified constants/equations/diagrams |
| **7. Assessment Reviewer** | Psychometric, fairness & board alignment check | Validated draft -> Reviewer sign-off (`QuestionReviews`) |
| **8. Duplicate Auditor** | Exact, normalized, embedding & skeleton check | Draft vs entire curriculum pool -> Unique confirmation |
| **9. Language Auditor** | Grade reading load, British/Indian English, notation | Verified item -> Lingual pass (<= 15w for Class 1–2!) |
| **10. Final Release Auditor** | 16-point release gate & schema check | Approved package -> `published` immutable release |

## 3. Prompt Version Pinning & Golden Regression Suite

- Every prompt module MUST carry a semantic `promptVersion` (e.g. `math-gen-v1.0.0`) logged on each generated draft.
- Target production LLM endpoints MUST pin explicit dated/stable model IDs rather than unvetted preview cascades, and any prompt/model change MUST pass the golden evaluation dataset (arithmetic correctness, syllabus adherence, child-safety, prompt-injection resistance) before rollout.
