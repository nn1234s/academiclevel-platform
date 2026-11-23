# AcademicLevel — Engineering Documentation Portal

**Document ID:** AL-DOC-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — AUTHORITATIVE  
**Classification:** Documentation Home  
**Parent Brand:** ZingQuark India Technologies Pvt Ltd  
**Target Application:** AcademicLevel (`https://academiclevel.in`)  

Welcome to the authoritative engineering knowledge base for AcademicLevel. This repository contains the verified, evidence-backed technical specifications, architecture diagrams, data dictionaries, security controls, and operational runbooks for the AcademicLevel learning platform.

---

## 🧭 Navigation Directory

```text
docs/
├── README.md                                                  ← You are here
├── DOCUMENTATION-STANDARDS.md                                 ← Formatting, metadata, & evidence rules
├── DOCUMENT-CONTROL.md                                        ← Master document register & RACI matrix
│
├── agents/                                                    ← Matt Pocock skills per-repo configuration
│   ├── issue-tracker.md                                       ← GitHub issues workflow & conventions
│   ├── domain.md                                              ← Domain docs consumer rules & single-context layout
│   └── triage-labels.md                                       ← Canonical triage vocabulary
│
├── adr/                                                       ← Architectural Decision Records
│   ├── 0001-hybrid-quiz-and-offline-bank-architecture.md
│   ├── 0002-synchronous-sqlite-wal-and-turso-cloud-sync.md
│   └── 0003-client-storage-rls-layer.md
│
├── 00-governance/                                             ← Organization, scope, & legal entity
│   └── system-overview-and-scope.md
├── 01-product/                                                ← Requirements, stories, & acceptance criteria
│   └── product-requirements-document.md
├── 02-experience/                                             ← Macro journeys, screen flows, & service blueprints
│   └── user-journeys-and-experience-architecture.md
├── 03-architecture/                                           ← C4 models, DDD contexts, & SPA architecture
│   └── system-and-software-architecture.md
├── 04-runtime/                                                ← Sequence diagrams, state machines, & FMEA
│   └── behavioral-and-runtime-architecture.md
├── 05-data-integrations/                                      ← ERD, data dictionary, & OpenAPI specifications
│   └── data-dictionary-and-api-specifications.md
├── 06-engineering/                                            ← Code standards, developer guide, & handoffs
│   ├── agent-skills-integration.md
│   ├── codebase-standards-and-developer-guide.md
│   └── development-handoff.md
├── 07-quality/                                                ← Test strategy, behavioral harness, & QA metrics
│   └── master-test-strategy-and-verification.md
├── 08-platform-delivery/                                      ← Render / Docker infrastructure & CDN
│   └── deployment-and-infrastructure-inventory.md
├── 09-operations/                                             ← SRE, observability, runbooks, & DR
│   └── operations-sre-and-continuity-runbook.md
├── 10-security/                                               ← Threat model (STRIDE), RBAC, & controls
│   └── security-architecture-and-threat-model.md
├── 11-grc/                                                    ← DPDPA 2023, CERT-In, & risk register
│   └── compliance-applicability-and-risk-register.md
├── 12-third-party/                                            ← Vendors, dependencies, & sub-processors
│   └── vendor-and-subprocessor-inventory.md
├── 13-ai/                                                     ← Nova AI system card, prompts, & safety
│   └── nova-ai-governance-and-system-card.md
└── 14-research-evidence/                                      ← Source register, evidence matrix, & validation
    ├── initial-repository-baseline.md
    ├── source-register.md
    ├── claim-evidence-matrix.md
    └── documentation-validation-report.md
```

---

## ⚡ Quick Start for Autonomous Agents & Engineers

Before beginning any bug fix or feature implementation:
1. Review [`AGENTS.md`](../AGENTS.md) and [`GLOSSARY.md`](../GLOSSARY.md).
2. Consult the relevant architectural domain above.
3. Review [`docs/06-engineering/development-handoff.md`](./06-engineering/development-handoff.md).
4. Run the automated test suites:
   * Behavioral Suite: `node scripts/test_student_behavioral_suite.mjs`
   * Quality Suite: `node scripts/test_quality_recovery_suite.mjs`
   * Build Verification: `cmd /c "npm run build"`
