# Agent Skills Integration & Engineering Workflow Guide

**Document ID:** AL-ENG-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Internal Engineering Standard  
**Author:** Principal Software Architect & DevSecOps Lead  

---

## 1. Upstream Canonical Reference & Provenance

* **Upstream Repository:** `https://github.com/mattpocock/skills`
* **Official Catalogue:** `https://www.aihero.dev/skills`
* **Setup Documentation:** `https://www.aihero.dev/skills-setup-matt-pocock-skills`
* **Installed Upstream Commit:** `abeeaf95660ba9e8b7c753eb38f441ca707a8823` (November 2026 release)
* **Licence:** MIT License (Copyright Matt Pocock)
* **Installation Target:** `.agents/skills/`

---

## 2. Installed Skills Inventory

The official skill collection is installed in the project root under `.agents/skills/`:

### Engineering Skills (`.agents/skills/`)
1. **`setup-matt-pocock-skills`** — Repository-level skill configuration (issue tracker, triage labels, domain docs).
2. **`ask-matt`** — Engineering workflow router and skill selector.
3. **`code-review`** — Automated pull request and diff verification against engineering standards.
4. **`codebase-design`** — Architecture boundary analysis and modular component design.
5. **`diagnosing-bugs`** — Systematic hypothesis-driven root-cause defect analysis.
6. **`domain-modeling`** — Domain-Driven Design ubiquitous language modeling and glossary maintenance.
7. **`grill-with-docs`** — Requirements interrogation and scope alignment via documentation.
8. **`implement`** — Test-backed task implementation.
9. **`implement-spec`** — Specification-guided multi-step feature implementation.
10. **`improve-codebase-architecture`** — Architectural refactoring and boundary decoupling.
11. **`pr`** — Structured pull request drafting.
12. **`prototype`** — Rapid technical spike and feasibility verification.
13. **`research`** — Evidence-backed primary-source technical research.
14. **`retro`** — Engineering process retrospective and continuous improvement.
15. **`tdd`** — Test-Driven Development red-green-refactor loop.
16. **`to-spec`** — Formal technical and product specification authoring.
17. **`to-tickets`** — Work breakdown into structured GitHub issues.
18. **`triage`** — Issue categorization and triage queue management.
19. **`wayfinder`** — Non-linear large initiative roadmap tracking.
20. **`wizard`** — Guided multi-stage codebase transformations.

### Productivity & Agent Skills (`.agents/skills/`)
21. **`grill-me`** — Interactive user requirements interview.
22. **`grilling`** — Deep-dive architectural trade-off exploration.
23. **`handoff`** — Session-to-session engineering continuation notes.
24. **`teach`** — Pedagogical concept explanation.
25. **`to-questionnaire`** — Multi-choice requirement clarity gathering.
26. **`wait-what`** — Inconsistency and ambiguity detection.
27. **`writing-for-agents`** — Clear, durable agent instructions authoring.

### Governance & Guardrail Utilities (`.agents/skills/`)
28. **`git-guardrails-claude-code`** — Branch protection and safe git commit policies.
29. **`migrate-to-shoehorn`** — Configuration migration utility.
30. **`scaffold-exercises`** — Test exercise generation.
31. **`setup-pre-commit`** — Pre-commit hook configuration.

---

## 3. Project Configuration Mapping

Per the `setup-matt-pocock-skills` workflow, configuration files are established in `docs/agents/`:

* **`docs/agents/issue-tracker.md`**: Configured for GitHub Issues on `nn1234s/academiclevel-platform`.
* **`docs/agents/domain.md`**: Configured for a single-context repository utilizing `GLOSSARY.md` and `docs/adr/`.
* **`docs/agents/triage-labels.md`**: Defines canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`).
* **`AGENTS.md`**: Canonical instruction file containing the `## Agent skills` section linking to the configuration.
* **`CLAUDE.md`**: Pointer file directing agents to `AGENTS.md`.

---

## 4. Skill Maintenance & Update Procedure

To update the installed skills from upstream:
1. Fetch latest changes from `https://github.com/mattpocock/skills.git`.
2. Review CHANGELOG.md for breaking frontmatter or invocation changes.
3. Synchronize `.agents/skills/` with the latest upstream release.
4. Run `node scripts/validate_docs.mjs` to ensure all skill references remain valid.
