# Continuation Development Handoff and Engineering Guide

```
Document ID:    AL-ENG-0003
Owner:          Principal Software Architect
Classification: Internal Engineering Operational Handoff
Last Updated:   2026-11-23
Status:         Approved
Dependencies:   AL-ENG-0001, AL-ENG-0002, AL-ARCH-0001, AL-QUAL-0001
```

---

## 1. Executive Summary and Handoff Intent

This document serves as the **operational handoff guide** for software engineers, site reliability engineers, and autonomous AI agents assuming maintenance, enhancement, or operational ownership of the **AcademicLevel** platform.

AcademicLevel is an established, production-grade learning system developed by **ZingQuark India Technologies Pvt Ltd**. It is designed around the core principles of high student engagement, curriculum rigor, data integrity, child protection compliance (DPDPA 2023), and deterministic offline-first quiz reliability.

---

## 2. Fast-Start Local Development Environment

### 2.1 Prerequisites
- **Node.js**: `v22.x` (LTS or current) — *Mandatory for native `node:sqlite` DatabaseSync support*.
- **npm**: `v10.x` or higher.
- **Git**: Working tree configured for line ending normalization (`core.autocrlf=false` recommended).
- **Operating System**: Cross-platform (Windows, Linux, macOS).

### 2.2 Bootstrapping Commands
```bash
# 1. Clone or navigate to the repository root
cd academiclevel-platform

# 2. Install dependencies (strictly sandboxed or bypass where network required)
npm install

# 3. Environment configuration
cp .env.example .env # Ensure JWT_SECRET and optional GEMINI_API_KEY / TURSO keys are set

# 4. Start local development server (concurrent Express API + Vite Frontend)
npm run dev
# Express API: http://localhost:5000
# Vite Frontend: http://localhost:5173
```

---

## 3. Architecture Rules and Non-Negotiable Invariants

Any engineer or agent modifying this repository must adhere to the following architectural invariants:

1. **Native SQLite Synchronous WAL Persistence**:
   - The primary datastore is `server/data/academiclevel_prod.db` accessed via `node:sqlite` (`DatabaseSync`).
   - SQLite `PRAGMA journal_mode = WAL;` and `PRAGMA foreign_keys = ON;` must be maintained at all times.
   - Do NOT introduce asynchronous ORMs (Prisma, TypeORM, Mongoose) that add memory bloat or race conditions.
2. **Hybrid Offline-First Quiz Engine**:
   - The question bank (`src/data/curriculumBank.ts`) contains exactly 12,000 vetted, curriculum-aligned questions across Grades 1-12 and 5 subjects.
   - The client quiz runner (`src/components/StudentQuizView.tsx`) evaluates questions locally without blocking on network round-trips per option selection.
   - Quiz completion posts an atomic result payload to `/api/quizzes/complete` (`server/api.js`).
3. **Child Privacy and DPDPA 2023 Section 9 Compliance**:
   - No third-party tracking, advertising pixels, or external social SDKs may ever be injected into student-facing views.
   - Sensitive parent actions (account deletion, subscription purchase, personal data export) strictly require 4-digit Parent PIN validation (`parentPin`).
4. **Single-Context Persona Scope**:
   - User personas are strictly limited to:
     - `student` (Standard learner)
     - `parent` (PIN-authenticated guardian view)
     - `superadmin` (Operator back-office)
   - Do NOT invent or scaffold teacher, school tenant, or institutional auditor roles unless directed by a formal enterprise specification.

---

## 4. Agent Skills Workflow Integration

Matt Pocock's official engineering skills have been installed in `.agents/skills/` and mapped in `AGENTS.md`. Future agents MUST adopt these specialized skill workflows:

| Task Type | Recommended Skill | Execution Command / Directive |
| :--- | :--- | :--- |
| **New Feature Implementation** | `to-spec` $\rightarrow$ `implement-spec` | Read requirements, formulate rigorous behavioral spec in `docs/`, then execute with continuous test runs. |
| **Bug Investigation** | `diagnosing-bugs` | Formulate a minimal reproducible script in `scripts/`, inspect the root cause, fix targeted code, and verify regression fix. |
| **Architectural Decisions** | `improve-codebase-architecture` | Author a new numbered ADR in `docs/adr/000X-*.md` adhering to AL-DOC-0001 standards before refactoring. |
| **Test-Driven Changes** | `tdd` | Write a failing behavioral test in `scripts/` or `src/__tests__/`, run test harness, write implementation, pass test. |
| **Code Review / Audit** | `code-review` | Inspect diff against `docs/06-engineering/codebase-standards-and-developer-guide.md` and security checklist. |

---

## 5. Pre-Commit Verification Checklist

Before pushing commits to `main` or opening pull requests, execute this exact validation sequence:

```bash
# Step 1: Validate TypeScript types and Vite production bundle
npm run build

# Step 2: Run core student behavioral verification harness
node scripts/test_student_behavioral_suite.mjs

# Step 3: Run curriculum question bank integrity verification
node scripts/test_quality_recovery_suite.mjs

# Step 4: Validate documentation links, schemas, and governance
node scripts/validate_docs.mjs
```

All 4 steps must return **EXIT CODE 0 (GREEN)**.

---

## 6. Directory and Domain Navigation Matrix

For detailed reference on specific subsystems, consult the canonical documentation modules:

```
docs/
├── 00-governance/            -> System Overview, Scope & Document Standards (AL-GOV-0001 - 0003)
├── 01-product/               -> Product Requirements, Curricula, Pricing (AL-PROD-0001)
├── 02-experience/            -> User Journeys, UI Components, Design System (AL-EXP-0001)
├── 03-architecture/          -> System & Software Architecture Diagrams (AL-ARCH-0001)
│   └── adr/                  -> Architectural Decision Records (AL-ADR-0001 - 0003)
├── 04-runtime/               -> Behavioral State Machines, Quiz Engine (AL-RNTM-0001)
├── 05-data-integrations/     -> SQLite Schema, API Specifications, Turso Sync (AL-DATA-0002)
├── 06-engineering/           -> Developer Guide, Standards, Skills Integration (AL-ENG-0001 - 0003)
├── 07-quality/               -> Test Strategy, Automation Harnesses, CI/CD (AL-QUAL-0001)
├── 08-platform-delivery/     -> Infrastructure Inventory, Docker, Hosting (AL-OPS-0001)
├── 09-operations/            -> SRE Runbooks, Monitoring, Disaster Recovery (AL-OPS-0002)
├── 10-security/              -> Threat Model, Vulnerability Management, AppSec (AL-SEC-0001)
├── 11-grc/                   -> DPDPA 2023, CERT-In, NEP 2020 Compliance (AL-GRC-0001)
├── 12-third-party/           -> Vendor & Subprocessor Inventory (AL-VND-0001)
├── 13-ai/                    -> Nova AI System Card, Prompt Eng, Fallback (AL-AI-0001)
└── 14-research-evidence/     -> Source Register, Claim Matrix, Audit Logs (AL-EVD-0001 - 0004)
```

---

## 7. Immediate Roadmap and Priority Backlog

Future engineering teams should prioritize the following items:
1. **Automated End-to-End Playwright Suite**: Expand headless browser test coverage across mobile viewports for the revised quiz header layout.
2. **Turso Cloud Asynchronous Write-Queue**: Decouple Turso sync from memory polling to an event-driven worker with exponential backoff.
3. **Automated CERT-In Log Export**: Provide automated daily cryptographic hashing and archiving of `security_events` to immutable cold storage.
