# AcademicLevel — Indian Children's EdTech Regulatory & Child-Safety Compliance Audit

**Document ID:** AL-AUD-0002  
**Created:** 2026-11-25  
**Status:** UPDATED — FIXED & DISMISSED ITEMS ARCHIVED  
**Classification:** Legal, Privacy & Child Safety Audit  
**Owner:** Platform Owner & Engineering  

---

## Executive Disposition Summary

Following owner review of the initial compliance matrix:
- **Dismissed / Accepted by Owner (Removed from Active Matrix):**
  - **Items 1 & 2 (Age-Gating & VPC):** Dismissed — parents set a 4-digit **Parent PIN** during student sign-up (`AuthModal.tsx`), and paid plans are acquired via parent-facing ads.
  - **Item 3 (Nova AI & Quiz Exit Modal):** Resolved/Dismissed — Nova AI has been refactored to a neutral, child-safe study helper (`REM-P0-04`), and the quiz exit confirmation modal is intentionally retained to help students finish quizzes.
  - **Item 4 (Tracking & PokeAPI):** Dismissed — zero Google/Meta ad trackers exist; PokeAPI is strictly used to display sprite images.
  - **Item 6 (Admin & Grievance Details):** Dismissed — server-side admin authentication is hardened (`REM-P0-01`); owner retains platform admin controls.
  - **Item 8 (Dark Patterns):** Dismissed by owner.
  - **Item 10 (WCAG / Accessibility):** Accepted as-is by owner.

---

## Verified Fixed Compliance Items

| Requirement / Regulation | Resolution Status | Implementation Evidence |
|---|---|---|
| **5. Account Deletion & Minor PII Access Control** | **FIXED & VERIFIED** | `/api/public/request-account-deletion` requires password/Parent PIN verification; `/students/:id`, `/mailbox`, `/student-packs/*`, `/payments/*`, `/storage` locked behind session RBAC & sanitized DTOs (`REM-P0-02`); offline fake deletion removed from `AccountDeletionPage.tsx` and `StudentProfile.tsx`. |
| **7. Security Audit Logs (with Turso Free-Tier Cleanup)** | **FIXED & VERIFIED** | `security_audit_logs` insert schemas fixed in `server/api.js` (`REM-P0-01`); `server/tursoClient.js` retains scheduled log cleanup to protect Turso free-tier read/write quotas. |
| **9. Kid-Friendly Wording** | **FIXED & VERIFIED** | Dense adult/legal jargon (`Append-Only Ledger`, `DPDP Act 2023`, `cryptographic token`) replaced with kid-friendly wording (`Verified Coin Wallet`, `Safe & Private Study Space`, `unique verification code`) across student modules. |
