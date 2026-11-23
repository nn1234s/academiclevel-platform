# AcademicLevel — Operations, SRE & Continuity Runbooks

**Document ID:** AL-OPS-0002  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Operational Runbooks  
**Owner:** SRE Lead & DevSecOps Engineer  

---

## 1. Observability & Health Monitoring

### System Health Probe (`/api/health`)
The `/api/health` endpoint serves as the liveness and readiness probe for cloud orchestrators:
```json
{
  "status": "HEALTHY",
  "uptimeSeconds": 84210,
  "database": {
    "engine": "SQLite WAL + Turso Cloud",
    "questionBankCount": 3600,
    "cloudSyncConfigured": true
  },
  "timestamp": "2026-11-23T02:00:00.000Z"
}
```

### Audit Logging (`security_audit_logs`)
All administrative mutations (manual payment approval, coin balance adjustments, curriculum overrides, suspension toggles) are written to `security_audit_logs` in `server/db.js` with client IP, action name, actor email, payload JSON, and timestamp.

---

## 2. Standard Operating Procedures (Runbooks)

### SOP-001: Mitigating Google Gemini Outages
* **Trigger:** Error alerts in `/api/ai/chat` or `/api/ai/generate-quiz` (HTTP 429 Rate Limit or 503 Provider Unavailable).
* **System Behavior:** Automatic failover engages immediately. Students practicing quizzes receive questions from the 12,000-question SQLite bank. Nova AI displays `STATIC_CURRICULUM_FALLBACK` advice without charging student credits.
* **Operator Action:**
  1. Inspect Google Cloud Console for quota exhaustion or billing issues.
  2. If an API key is depleted, log into `/adminservice` -> AI Settings and update `GEMINI_API_KEY`.
  3. Run `/api/admin/ai/test-connection` from the admin control panel to verify resolution.

### SOP-002: Resolving Turso Cloud Sync Blockers
* **Trigger:** Server startup logs show `[Turso Boot Sync Warning]` or remote push failures.
* **System Behavior:** Local SQLite database operates unaffected with sub-millisecond read/write latency. Changes queue in `server/tursoClient.js` write buffer.
* **Operator Action:**
  1. Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Render Environment Settings.
  2. Inspect Turso Cloud status dashboard (`https://status.turso.tech`).
  3. Once network/credentials restore, sync resumes automatically on the next 5-minute interval.

### SOP-003: Emergency Hotfix Deployment Procedure
* **Trigger:** P0 critical student bug identified in production.
* **Procedure:**
  1. Create a hotfix branch from `main`: `git checkout -b hotfix/critical-fix`.
  2. Implement targeted fix and execute the verification harness:
     ```bash
     node scripts/test_student_behavioral_suite.mjs
     cmd /c "npm run build"
     ```
  3. Commit and merge to `main` and `dev`.
  4. Push to GitHub: `git push origin main && git push origin dev`.
  5. Render automatically detects the `main` push, builds the Vite container, runs `tsc`, and deploys with zero downtime.

---

## 3. Business Continuity & Disaster Recovery (BCP / DR)

* **Recovery Time Objective (RTO):** < 15 minutes.
  * In the event of a cloud container failure, Render automatically restarts the container.
  * In the event of total hosting outage, a new container can be booted on any Node 22 platform using the Git repository and `Dockerfile`.
* **Recovery Point Objective (RPO):** < 5 minutes.
  * Local writes flush to Turso Cloud every 300 seconds (5 minutes) and synchronously upon `SIGTERM` / `SIGINT` container stop events.
* **Cold Storage Backups:** `data-store.json` provides an additional file-based JSON backup of all registered learners, subscriptions, and coin balances.
