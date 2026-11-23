# ADR 0003: Client Storage Row-Level Security (StorageRLSLayer)

**Status:** ACCEPTED  
**Date:** 2026-11-23  
**Deciders:** Principal Architect, Security Lead  
**Document ID:** AL-ADR-0003  

---

## Context
K-12 students frequently access educational platforms on low-bandwidth mobile connections, shared home tablets, or school computer labs. If every user interaction (answering a quiz question, checking streak status, reading a mailbox notification) requires synchronous network rounds, poor connectivity causes dropped sessions and perceived sluggishness.

Additionally, multiple siblings sharing the same family browser must not be able to read or mutate each other's progress or coin balances.

## Decision
We implemented a client-side **Storage Row-Level Security Layer** ([`StorageRLSLayer.ts`](../../src/core/storage/StorageRLSLayer.ts)):
1. **Tenant Isolation via Learner ID:** All client storage operations require a `requestingLearnerId` parameter. Records belonging to other learners are strictly filtered out before returning to components.
2. **Super-Admin Exception:** Only an authenticated `SUPER_ADMIN` may bypass tenant scoping.
3. **Optimistic Local Execution with Background Sync:** Student actions update local state instantly, while `ApiClient` triggers background asynchronous POST/PATCH requests to the Express server.
4. **Session Recovery:** Active quiz attempts persist to `sessionStorage` under `al_active_quiz_${learner.id}_...`, shielding students from losing progress on accidental browser refreshes.

## Consequences
* **Positive:** Instantaneous UI responsiveness; offline resilience; strong data isolation on shared devices.
* **Negative:** Requires state synchronization logic between local storage and backend SQLite tables.
