# Domain Docs

How the engineering skills consume AcademicLevel's domain documentation when exploring the codebase.

---

## Before Exploring, Read These

- **`GLOSSARY.md`** at the repo root: Defines the canonical ubiquitous language for AcademicLevel (Learner, Progression Node, Coin Ledger, Quota, Study Coins, A-Codes, Nova AI, etc.).
- **`docs/adr/`**: Read Architectural Decision Records that touch the area you're about to work in (e.g. SQLite WAL architecture, RLS Layer, Hybrid Quiz Fetching).
- **`docs/`**: Consult the modular domain directories (`docs/01-product/`, `docs/03-architecture/`, `docs/05-data-integrations/`, `docs/10-security/`, `docs/13-ai/`).

## File Structure

AcademicLevel is a **single-context application** with a shared client-server boundary:

```text
/
├── GLOSSARY.md              ← Ubiquitous language & domain terminology
├── docs/adr/                ← System-wide Architectural Decision Records
├── docs/agents/             ← Agent skill configuration
├── docs/                    ← Enterprise architecture & product documentation
├── server/                  ← Backend Express & SQLite database services
└── src/                     ← Frontend React TypeScript single-page application
```

## Use the Glossary's Vocabulary

When naming a domain concept (in an issue title, refactor proposal, hypothesis, or test name), use the term as defined in `GLOSSARY.md`. Do not drift to synonyms the glossary explicitly avoids (e.g. use "Learner" or "Scholar", not "Tenant User"; use "Progression Node", not "Difficulty Bucket").

## Flag ADR Conflicts

If proposed output contradicts an existing ADR in `docs/adr/`, surface it explicitly rather than silently overriding:
> _Contradicts ADR-0002 (Synchronous SQLite with WAL Mode in server/db.js), but worth reopening because..._
