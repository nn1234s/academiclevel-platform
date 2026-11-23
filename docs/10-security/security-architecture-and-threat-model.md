# AcademicLevel — Security Architecture & Threat Model

**Document ID:** AL-SEC-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Security Engineering Standard  
**Owner:** Application Security Engineer  

---

## 1. Threat Model (STRIDE Methodology)

| Threat Category | Potential Attack Vector | Inherent Risk | Implemented Security Control | Code / Architectural Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Spoofing** | Student impersonates another learner or claims Super-Admin role | High | Client-side RLS filtering enforced in `StorageRLSLayer.ts`; server-side `adminAuth` middleware verifies `x-admin-token` or session role before executing administrative routes | `server/api.js` line 3130, `StorageRLSLayer.ts` |
| **Tampering** | Student alters coin balance or manipulates quiz score via DevTools | High | All coin adjustments must execute via `/api/coins/transact` with strict ledger delta verification; level completions are calculated and validated on the server | `server/api.js` line 1408, `coinLedgerService.ts` |
| **Repudiation** | Operator denies modifying student subscription or dispatching gift | Medium | `security_audit_logs` records every admin mutation with actor email, action type, client IP address, payload JSON, and timestamp | `server/db.js` line 168, `server/api.js` line 3936 |
| **Information Disclosure** | Student accesses other learners' personal data or parent email | Critical | Storage RLS layer strictly isolates data by `learnerId`; `learners` table returns sanitized DTOs omitting password hashes and parent PIN hashes | `server/api.js` line 920, `StorageRLSLayer.ts` |
| **Denial of Service** | Bot script spams auth registration, payment submissions, or AI queries | High | Express rate limiters (`authLimiter`, `paymentLimiter`, `aiChatLimiter`) throttle rapid repeat invocations; 1s dwell guard halts automated bots | `server/api.js` line 395, line 1202, line 4706 |
| **Elevation of Privilege** | Student calls `/api/admin/learners/:id/grant-premium` directly | Critical | Every `/api/admin/*` endpoint is guarded by server-side `adminAuth` middleware requiring valid super-admin credentials; client-side UI hiding is never relied upon as security | `server/api.js` lines 3250–3936 |

---

## 2. Role-Based Access Control (RBAC) Matrix

| Route / Capability Scope | Guest / Unauthenticated | Student (Learner) | Super-Admin (`/adminservice`) | Enforcement Point |
| :--- | :---: | :---: | :---: | :--- |
| **Public Landing & Offers (`/`, `/special49`)** | Allowed | Allowed | Allowed | Public Route |
| **Course Catalogue & Syllabus (`/courses`)** | Read-Only | Read-Write | Full Access | Route Guard |
| **Take Quizzes & Progress (`/quiz`, `/levels`)** | Blocked | Allowed (Quota Gate) | Unrestricted | `QuotaService` & `QuizEngine` |
| **Nova AI Tutoring (`/nova`, `/api/ai/chat`)** | Blocked | Allowed (Quota Gate) | Unrestricted | `aiChatLimiter` & quota check |
| **Parent PIN Protected Actions** | Blocked | PIN Verified | Unrestricted | `parentPin` validation |
| **Daily Spin Wheel (`/spin`)** | Blocked | Allowed (24h Cooldown)| Unrestricted | `CoinLedgerService.canSpinWheel` |
| **Gift Store Doorstep Claims (`/store`)** | Blocked | Allowed (Balance Gate)| Unrestricted | `coin_ledger` debit validation |
| **Admin Operations (`/adminservice`, `/api/admin/*`)**| Blocked | Blocked | Full Access | Server Middleware `adminAuth` |

---

## 3. OWASP Top 10 Mitigation Profile

1. **Injection (A03:2021):**
   * SQLite queries across `server/db.js` and `server/api.js` exclusively use parameterized prepared statements (`db.prepare('SELECT ... WHERE id = ?').all(...)`), rendering SQL injection impossible.
2. **Cryptographic Failures (A02:2021):**
   * Parent PINs and passwords are salted and hashed using standard cryptographic algorithms.
   * Production traffic is forced through TLS 1.3 encryption.
3. **Cross-Site Scripting (XSS - A03:2021):**
   * React automatically escapes strings rendered in JSX templates.
   * `dangerouslySetInnerHTML` is audited and restricted to strictly sanitized LaTeX / KaTeX mathematical formatting.
