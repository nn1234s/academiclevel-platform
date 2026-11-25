# Duplicate & Structural Redundancy Detection Standard

**Document ID:** AL-STD-0006  
**Created:** 2026-11-25  
**Status:** DESIGNED — TARGET ARCHITECTURE  
**Classification:** Content Quality Standard  
**Owner:** Principal Assessment & Curriculum Architect  

---

## 1. Why Existing Checks Failed

Phase 2 proved that naive exact-string deduplication (`normalizeQText`) allowed **2,227 cross-grade cloned stems** to pass by simply wrapping `"In Class X Subject review activity Y..."` around identical questions, and allowed generator scripts to append `(#1)`, `(#2)` suffixes.

## 2. Four-Tier Duplicate Detection Pipeline

| Tier | Detection Method | Scope & Threshold | Action on Match |
|---|---|---|---|
| **Tier 1: Exact Normalized Text** | Strip punctuation, wrapper noise, case, whitespace -> SHA-256 `stemHash` | Global across `published` + `approved` bank (not just within 1 quiz) | **HARD BLOCK** |
| **Tier 2: Parameterized Skeleton & Numeric Reskin** | Replace integers/decimals/common proper nouns (`Riya`, `Aarav`) with `#` / `$PERSON` and normalize mathematical expressions | Same `learningObjectiveId` / chapter (`skeletonHash` collision above configurable reskin limit, default max **1 canonical exemplar** per template unless distinct cognitive variant explicitly flagged) | **HARD BLOCK** on trivial numerical reskins (`AL-STD-0006` bans mass reskin farming) |
| **Tier 3: Near-Text Shingle / Cosine Similarity** | Character/word $n$-gram Jaccard & token TF-IDF similarity after stopword & wrapper stripping | Similarity `>= 0.85` within same subject/grade band | Quarantine into `duplicate_groups` for human adjudication |
| **Tier 4: Pedagogical & Conceptual Equivalence** | Compare `(learningObjectiveId, questionFormat, mathematicalEquivalenceKey, answerSignature)` | Same LO testing identical fact/formula transformation | Reject redundant siblings so chapter slots test breadth of LOs & misconceptions |

## 3. Wrapper-Noise Prohibition

Question stems MUST NEVER prepend synthetic generator scaffolding such as `"In Class X Mathematics review activity Y, answer the following:"` or `"(Problem #42)"`. The schema validator rejects any stem matching banned synthetic prefix/suffix patterns.
