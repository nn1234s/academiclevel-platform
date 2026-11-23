# Issue Tracker: GitHub

**Target Repository:** `https://github.com/nn1234s/academiclevel-platform`  
**Tracker Type:** GitHub Issues (accessed via `gh` CLI)  
**Configuration Status:** VERIFIED — CONFIGURED  

---

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Sub-issues / Hierarchies**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>`. Without sub-issues, write `Part of #<parent>` at the top of the child body.
- **Blocking Dependencies**: `gh issue edit <child> --add-blocked-by <blocker>` (`gh` 2.94+). Where dependencies are unavailable via API, use `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Count Open Blockers**: `gh api repos/nn1234s/academiclevel-platform/issues/<n> --jq .issue_dependencies_summary.blocked_by`.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: Post the explanation with `gh issue comment <number> --body "..."`, then `gh issue close <number>`.

## Pull Requests as a Triage Surface

**PRs as a request surface: no.**  
Pull requests represent implemented code reviews rather than triage feature requests.

## Wayfinding Operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: A single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body: `gh issue create --label wayfinder:map`.
- **Child Ticket**: An issue linked to the map as a GitHub sub-issue. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving developer.
- **Claim**: `gh issue edit <n> --add-assignee @me`.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer to the map's Decisions-so-far.
