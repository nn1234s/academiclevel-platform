# Curriculum Research Protocol (CBSE, CISCE, Cambridge IGCSE)

**Document ID:** AL-STD-0002  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE  
**Classification:** Curriculum Governance Standard  
**Owner:** Principal Assessment & Curriculum Architect  

---

## 1. Zero-Hallucination Sourcing Rule

Every board subject, official subject code, chapter title, deleted/retained topic decision, subtopic, and Learning Objective (LO) recorded in AcademicLevel MUST map back to a stored `source_records` entry referencing an official primary syllabus authority. **Zero inferred or fabricated textbook citations are permitted.**

## 2. Authoritative Primary Sources by Board

| Board ID | Authority | Canonical Syllabus Source Types | Key Structural Distinctions |
|---|---|---|---|
| `CBSE` | NCERT / CBSE Academic (`cbseacademic.nic.in`, `ncert.nic.in`) | NCF-SE 2023 framework, NCERT rationalized textbooks (Classes 1–12), official CBSE Annual Curriculum circulars & subject codes (e.g., Math Standard `041` vs Basic `241`) | 5+3+3+4 stages; Competency-Based Questions (CBQs), Assertion-Reasoning, Case-Based items in Secondary/Senior. |
| `CISCE` | Council for the Indian School Certificate Examinations (`cisce.org`) | CISCE Regulations & Syllabi (Classes 1–8 guidelines, Class 9–10 ICSE Group I/II/III, Class 11–12 ISC electives) | Strong English Language/Literature analytical weighting; dedicated internal/project practical components (20–50%); separate Physics/Chem/Bio notation from middle school upward. |
| `IGCSE` | Cambridge Assessment International Education (`cambridgeinternational.org`) | Official Syllabus PDFs by syllabus code (e.g., `0580` Math, `0625` Physics, `0620` Chemistry, `0610` Biology, `0478` CS, `0500` First Language English) & Cambridge Primary/Lower Secondary checkpoints | Explicit **Core** vs **Extended** tiers; strict Cambridge command words (`State`, `Define`, `Describe`, `Explain`, `Suggest`, `Calculate`, `Deduce`); SI notation and A*–G paper component mapping. |

## 3. Research & Source Registry Workflow

1. **Extract:** Pull official syllabus code, academic year (e.g. `2026-27`), prescribed chapters, subtopics, exclusions/rationalizations, and official Assessment Objectives (AOs).
2. **Store `source_records`:** Persist `sourceId`, `board`, `syllabusYear`, `authorityUrl`, `documentTitle`, `sectionRef`, `checksumOrDate`, and `verifiedBy`.
3. **Never Assume Cross-Board Parity:** A topic present in Class 10 IGCSE Extended (`0580` Calculus/Matrices introduction) MUST NOT automatically be copied into CBSE Class 10 Math (`041`), preventing observed drift bugs like `AL-C10-MATH-002` (Differentiation in CBSE Class 10).
4. **Mark Gaps Explicitly:** Unsourced chapters stay `not_started` and CANNOT advance to `blueprint_ready`.
