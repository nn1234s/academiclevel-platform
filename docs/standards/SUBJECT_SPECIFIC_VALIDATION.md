# Subject-Specific Deterministic Validation Standard

**Document ID:** AL-STD-0005  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE  
**Classification:** Quality Verification Standard  
**Owner:** AI Evaluation Lead & Quality Engineering Lead  

---

## 1. Zero Blind Trust of AI or Generated Outputs

No mathematical calculation, scientific quantity, code output, citation, or JSON structure may enter `validated` or `published` state without passing a **deterministic programmatic validator** external to the generating LLM.

## 2. Validation Validators by Subject Domain

| Subject Domain | Required Deterministic Check | AcademicLevel Tooling Implementation |
|---|---|---|
| **Schema & Structural Integrity** | Exact 4 distinct options (for MCQ), valid `correctIndex` in `0..3` or structured answer spec, non-empty explanation >= 30 chars, valid `learningObjectiveId`, valid `syllabusVersionId`, reading word-count within grade-band ceiling | `scripts/validators/validate_question_schema.mjs` |
| **Mathematics (Arithmetic, Algebra, Calculus, Coordinate Geometry)** | Exact rational arithmetic (`fractions.Fraction`, `decimal.Decimal`), restricted AST math evaluator, numerical substitution checks across sampled test points, distractor non-equivalence verification (two options MUST NOT reduce to the same algebraic/numeric value) | `scripts/validators/verify_math_items.py` + `tools/math_verifier/` (offline stdlib engine immediately; SymPy CAS recommended when package install permitted) |
| **Physics & Chemistry** | SI unit dimensional parsing, numerical tolerance checks, chemical equation atom-balance conservation checker (parse reactant/product atom counts), standard physical constant verification | `scripts/validators/verify_science_items.py` |
| **Computer Science / Coding** | Isolated sandbox execution (`node --permission` / restricted subprocess with zero network/FS writes and strict timeout <= 1000ms) evaluating deterministic output questions (Python / JS / SQL logic) | Planned sandbox runner interface; items requiring code execution MUST NOT bypass verification |
| **Visual / Diagram-Dependent Items** | Categorize `assetClass`: `'assessment_critical' | 'decorative' | 'none'`. If stem references diagram/graph/figure/circuit/map, `assetUrl` MUST resolve to an existing file in `public/` or verified media store + pass non-empty accessible `altText` | Hard publish block on missing/orphaned media assets |
| **Citation / Provenance Resolver** | Check `sourceRecordId` exists in `source_records` and matches `board` + `grade` + `syllabusVersionId` | Referential integrity FK + audit gate |
