# Triage Label Vocabulary

Canonical triage label vocabulary for AcademicLevel issue tracking via `/triage` and `/to-tickets`.

---

## Canonical Triage Roles

| Role | Label String | Meaning / Workflow State |
| :--- | :--- | :--- |
| **Needs Triage** | `needs-triage` | Brand-new issue awaiting initial technical assessment and categorization. |
| **Needs Info** | `needs-info` | Blocked on reproduction details, student diagnostic trace, or user clarification. |
| **Ready for Agent** | `ready-for-agent` | Fully specified, scoped, and ready for autonomous coding agent implementation. |
| **Ready for Human** | `ready-for-human` | Requires manual decision, physical merch procurement, or guardian approval. |
| **Won't Fix** | `wontfix` | Out of product scope, invalid defect, or intentionally deprecated behaviour. |

## Wayfinder Sub-Labels

When `/wayfinder` generates tickets, it attaches these task-type classifiers:
- `wayfinder:map` — Central roadmap issue tracking frontier exploration.
- `wayfinder:research` — Unknown technical, regulatory, or performance investigation.
- `wayfinder:prototype` — Proof of concept or spike implementation.
- `wayfinder:grilling` — Scope-definition or architectural alignment ticket.
- `wayfinder:task` — Concrete execution item with defined acceptance criteria.
