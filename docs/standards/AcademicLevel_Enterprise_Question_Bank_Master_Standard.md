# AcademicLevel — Enterprise Question Bank Master Standard

**Document ID:** AL-STD-0001  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE (Adopted Starting Remediation Phase 6)  
**Classification:** Authoritative Engineering & Assessment Standard  
**Owner:** Principal Assessment & Curriculum Architect  

---

## 1. Purpose & Architectural Mandate

This Master Standard defines the non-negotiable academic, psychometric, security, privacy, and technical architecture governing AcademicLevel's Classes 1–12 assessment ecosystem across **CBSE**, **CISCE (ICSE/ISC)**, and **Cambridge IGCSE**. It supersedes ad-hoc `curatedQuestionBank.json` imports and hardcoded quota scripts (`build_all_12k.mjs`, `import_master_question_bank_new.mjs`).

### 1.1 Ten Core Enterprise Principles
1. **Dynamic Syllabus-Driven Inventory:** Chapter question inventory is calculated dynamically from official syllabus depth, Learning Objectives (LOs), cognitive levels (Bloom's taxonomy), difficulty tiers, required question formats, and exam vs practice needs — **never fixed arbitrary quotas**.
2. **Board & Age Progression Independence:** Age/developmental stage (Classes 1–2 Foundation, 3–5 Foundational Expansion, 6–8 Middle-School Mastery, 9–10 Secondary Exam Prep, 11–12 Senior-Secondary Specialization) is tracked independently from Board syllabus (`CBSE` vs `CISCE` vs `Cambridge IGCSE`), preserving command words, tiering (Cambridge Core/Extended), and electives.
3. **Zero Content–Analytics Coupling:** Curriculum versions, questions, immutable question versions, student responses, and LO mastery records reside in strictly normalized SQLite/Turso tables (`curriculum_versions`, `learning_objectives`, `questions`, `question_versions`, `answer_options`, `quiz_responses`, `lo_mastery_records`). Editing wording creates a new `question_version` without corrupting historical student responses.
4. **Server-Side Authority:** Active quiz fetch APIs never transmit `correctIndex`, `correctOptionId`, or private keys to the client. All scoring, XP, coin awards, and milestone updates are computed exclusively server-side.
5. **Deterministic Verification Before Publishing:** No LLM-generated or human-authored item may enter `published` state without deterministic math/code/schema/citation/duplicate/asset gate passes and independent academic reviewer sign-off.
6. **Child Safety & Privacy (DPDP Act 2023 Sec 9):** Zero behavioral ad tracking, zero manipulative dark patterns, zero romantic/detrimental AI personas, Verifiable Parental Consent (VPC) gating for minors, and non-punitive Classes 1–5 UX.
7. **Dual Exam vs Mastery Preparation:** Chapter mastery offers 9 structured practice modes (`Learn & Practise` through `Timed Practice`); board exam simulation runs strictly against verified board blueprints with automated Exam Paper QA.
8. **LO-Level Multi-Signal Mastery & Adaptive Revision:** Adaptive practice computes 6 mastery stages per Learning Objective across 7 signals and enforces unseen equivalent item validation (never repeating missed items verbatim).
9. **Visual & Language Rigor:** Visual assets classify strictly as `assessment_critical` vs `decorative` with hard blocks on missing assets; translations pass an 8-step independent validation pipeline; British/Indian English conventions and exact command words are enforced.
10. **Empirical Psychometric Calibration:** AI-estimated difficulty is treated as provisional (`UNVERIFIED_PROVISIONAL`) until CTT (`N >= 30` responses: facility $p$, discrimination $D$, distractor rates) and later IRT/CAT gates (`N >= 200+`) calibrate empirical difficulty.

---

## 2. Five-Stage Class-Wise Academic Progression Model

| Stage ID | Grade Band | NCF / Board Focus | Constraints & Guardrails |
|---|---|---|---|
| `STAGE_1_FOUNDATION` | **Classes 1–2** | Curiosity, foundational numeracy/literacy, familiar Indian everyday contexts, observation | Max 18 words/stem (target <= 15), concrete reasoning, high purposeful visual support, 3–4 simple options, zero timers, zero harsh error banners or PIN exit locks. |
| `STAGE_2_PREPARATORY` | **Classes 3–5** | Fluency, comprehension, multi-step arithmetic, measurement/geometry, grammar in context, elementary science | Simple clear English, max 28 words/stem unless short comprehension passage, step-by-step encouraging feedback, gentle optional timing. |
| `STAGE_3_MIDDLE` | **Classes 6–8** | Conceptual abstraction (algebra, equations, geometry), scientific experimentation, data/map interpretation, cross-chapter synthesis | Moderate reading load, selective labeled diagrams, explicit conceptual explanations addressing common misconceptions. |
| `STAGE_4_SECONDARY` | **Classes 9–10** | Full syllabus + competency-based board preparation (CBSE competency/case studies; ICSE structured/analytical; IGCSE Core vs Extended command words) | Mixed mastery modes + optional timed board specimen sets without converting the whole bank into mock papers. |
| `STAGE_5_SENIOR` | **Classes 11–12** | Specialist derivations, proofs, multi-step numericals, experimental analysis, stream/elective isolation (`PCM`, `PCB`, `Commerce`, `Humanities`) | Strict stream/elective boundary enforcement; zero cross-elective pollution; formula/notation rigor via KaTeX. |

---

## 3. Repository & Standards Cross-Reference Map

| Domain Standard | Document ID | Location |
|---|---|---|
| Curriculum Research & Official Sourcing | `AL-STD-0002` | [`CURRICULUM_RESEARCH_PROTOCOL.md`](./CURRICULUM_RESEARCH_PROTOCOL.md) |
| Dynamic Chapter Blueprints & 8-Metric Completeness | `AL-STD-0003` | [`CHAPTER_BLUEPRINT_STANDARD.md`](./CHAPTER_BLUEPRINT_STANDARD.md) |
| Stage-Separated AI Question Generation | `AL-STD-0004` | [`QUESTION_GENERATION_STANDARD.md`](./QUESTION_GENERATION_STANDARD.md) |
| Deterministic Subject-Specific Verification | `AL-STD-0005` | [`SUBJECT_SPECIFIC_VALIDATION.md`](./SUBJECT_SPECIFIC_VALIDATION.md) |
| Exact, Semantic & Structural Duplicate Detection | `AL-STD-0006` | [`DUPLICATE_DETECTION_STANDARD.md`](./DUPLICATE_DETECTION_STANDARD.md) |
| Independent Academic Review Protocol | `AL-STD-0007` | [`ACADEMIC_REVIEW_PROTOCOL.md`](./ACADEMIC_REVIEW_PROTOCOL.md) |
| Normalized Production Data Schema & Migrations | `AL-STD-0008` | [`QUESTION_BANK_DATA_SCHEMA.md`](./QUESTION_BANK_DATA_SCHEMA.md) |
| Release Gates, 16-Point Checklist & Deprecation | `AL-STD-0009` | [`RELEASE_AND_GOVERNANCE_POLICY.md`](./RELEASE_AND_GOVERNANCE_POLICY.md) |
| Multi-Signal LO Mastery & Adaptive Engine | `AL-STD-0010` | [`STUDENT_MASTERY_FRAMEWORK.md`](./STUDENT_MASTERY_FRAMEWORK.md) |
| Immutable Syllabus Versioning & Archive Segregation | `AL-STD-0011` | [`SYLLABUS_VERSIONING_POLICY.md`](./SYLLABUS_VERSIONING_POLICY.md) |
