# AcademicLevel — Agent Operating Instructions

Authoritative operating instructions for autonomous coding agents and human engineers working on the AcademicLevel repository.

---

## Agent skills

### Issue tracker
GitHub Issues (`https://github.com/nn1234s/academiclevel-platform`). See `docs/agents/issue-tracker.md`.

### Triage labels
Canonical five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs
Single-context layout (`GLOSSARY.md` at root and `docs/adr/`). See `docs/agents/domain.md`.

---

## Core Engineering Rules

1. **Evidence Before Claims**: Never claim a bug is fixed or a feature is implemented without running verification code and recording reproducible proof.
2. **No Fabricated Infrastructure**: AcademicLevel is an Express + Vite React SPA deployed on Render with an embedded SQLite WAL database and client-side RLS fallback. Do not invent Kubernetes, microservices, or complex enterprise message brokers.
3. **No Teacher / Multi-Tenant Roles**: AcademicLevel is strictly student-facing (Learners, Parents with PINs, and Super-Admin for ZingQuark operations).
4. **Build and Test Verification**:
   - Production Build: `cmd /c "npm run build"` (`tsc && vite build`)
   - Behavioral Test Suite: `node scripts/test_student_behavioral_suite.mjs`
   - Quality Recovery Suite: `node scripts/test_quality_recovery_suite.mjs`
   - Quiz Count Suite: `node scripts/test_fetch_quiz_counts.mjs`
5. **Documentation Maintenance**: Any architectural change or data schema evolution must update `docs/` and `GLOSSARY.md`.
