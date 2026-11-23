# AcademicLevel — Engineering Documentation Standards

**Document ID:** AL-GOV-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — AUTHORITATIVE  
**Classification:** Documentation Standard  
**Owner:** Enterprise Documentation & Governance Guild  

---

## 1. Documentation Principles

1. **Docs-as-Code:** All technical and product specifications reside in Git within the `docs/` tree alongside source code.
2. **Evidence Before Claims:** Every capability must cite concrete implementation files, database schemas, or executed test suites. Fictional enterprise infrastructure (e.g. unverified Kubernetes clusters, microservices, formal ISO certifications) is strictly prohibited.
3. **Canonical Ubiquitous Language:** Terminology must match [`GLOSSARY.md`](../GLOSSARY.md) exactly. Avoid synonyms (e.g. use "Learner", not "Tenant").
4. **Stable Traceability Identifiers:** All artifacts must use stable identifiers:
   - `AL-DOC-*` — Formal documents
   - `AL-REQ-*` — Product requirements
   - `AL-ADR-*` — Architecture decisions
   - `AL-API-*` — API contracts
   - `AL-DATA-*` — Data schemas and tables
   - `AL-RISK-*` — Risk register entries
   - `AL-TEST-*` — Test specifications and test suites
   - `AL-EVD-*` — Empirical evidence and test runs
   - `AL-VND-*` — Third-party vendor entries
   - `AL-AI-*` — AI systems and governance cards

---

## 2. Mandatory Metadata Header

Every document in `docs/` must begin with a standardized header block:

```markdown
# [Title]

**Document ID:** AL-[DOMAIN]-[NUMBER]  
**Created:** YYYY-MM-DD  
**Last Reviewed:** YYYY-MM-DD  
**Status:** [VERIFIED — IMPLEMENTED | PARTIALLY IMPLEMENTED | IMPLEMENTED — NOT OPERATIONALLY VERIFIED | DESIGNED — NOT IMPLEMENTED | PLANNED | UNKNOWN / NOT VERIFIED | NOT APPLICABLE | BLOCKED]  
**Classification:** [Public | Internal Engineering | Restricted Security]  
**Owner:** [Role or Guild, e.g. Lead Systems Architect]  
```

---

## 3. Status Classification Standards

* **VERIFIED — IMPLEMENTED**: Direct code inspection and executed test suites confirm the feature operates.
* **PARTIALLY IMPLEMENTED**: Code exists, but features or edge cases remain incomplete.
* **IMPLEMENTED — NOT OPERATIONALLY VERIFIED**: Code exists, but has not undergone real student runtime validation.
* **DESIGNED — NOT IMPLEMENTED**: Documented architecture proposal exists, but no production code.
* **PLANNED**: Explicitly recorded future roadmap milestone.
* **UNKNOWN / NOT VERIFIED**: Insufficient empirical evidence to prove status.
* **NOT APPLICABLE**: Explicitly non-applicable to the AcademicLevel single-context architecture.
* **BLOCKED**: Implementation or audit blocked on a documented dependency.
