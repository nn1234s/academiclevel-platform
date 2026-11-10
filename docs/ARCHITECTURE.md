# AcademicLevel Platform Architecture Specification (v1.0.0-PROD)
**"Learn in your era" — India's Premier K-12 AI-Powered Educational Platform**

---

## 1. Executive Overview & System Topology

AcademicLevel is an enterprise-grade K-12 educational learning and assessment ecosystem specifically engineered for Indian and international curricula covering **Classes 1 through 12** across:
1. **CBSE (Central Board of Secondary Education)**
2. **ICSE / CISCE (Council for the Indian School Certificate Examinations)**
3. **Cambridge IGCSE (International General Certificate of Secondary Education)**

The system delivers age-adaptive pedagogical interfaces (Classes 1–4 Visual Gamified, Classes 5–8 Interactive Quest, Classes 9–12 Exam-Prep Analytics), anti-cheat adaptive AI quizzes, Socratic tutoring via Nova AI, cryptographic coin economy, and an audited UPI QR payment gateway with human-in-the-loop verification.

```
                      +------------------------------------------+
                      |         AcademicLevel Client Layer       |
                      |   (Vite + React 18 + TS + Tailwind CSS)  |
                      +--------------------+---------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
         [Public Marketing Funnel]                    [Learner & Parent Workspace]
         - Landing Hero & Board Preview               - Age-Adaptive Navigation
         - Google/YouTube Ads Funnel (/ads)           - 19 Core Student Modules
         - Legal, DPDP 2023 & Safety                  - Quota Gate (25Q / 3 Levels)
                   |                                               |
                   +-----------------------+-----------------------+
                                           |
                        +------------------v-------------------+
                        |   Core Security & Kernel Services    |
                        |   - Session & RLS Simulation Layer   |
                        |   - Anti-Tamper UTR Hashing Engine   |
                        |   - Append-Only Study Coin Ledger    |
                        |   - PII / Profanity Regex Firewall   |
                        |   - Anti-Cheat Quiz Timer Guard      |
                        +------------------+-------------------+
                                           |
          +--------------------------------+--------------------------------+
          |                                                                 |
+---------v-------------------------+                    +------------------v--------------------+
|  Curriculum & Intelligence Engine |                    |   Audited Admin Control Plane         |
|  - Board x Class 1-12 Syllabi     |                    |   Route: /ops-vault-al99 (Code-Split) |
|  - 4-Tier Progression Nodes       |                    |   Lock: naitiknanda1235@gmail.com     |
|  - Offline IndexedDB/Local Cache  |                    |   - UPI 12-Digit Verification Queue   |
|  - Nova AI Socratic Engine        |                    |   - Entitlements & ACodes Manager     |
+-----------------------------------+                    |   - Ledger Inspector & Audit Logs     |
                                                         +---------------------------------------+
```

---

## 2. Core Business Rules & Invariant Constraints

1. **Free Tier Quota Ceiling**:
   - Strictly `quizzes_taken <= 25` OR `levels_completed <= 3`.
   - Whichever threshold is reached first activates the `PAYWALL_LOCKED` state.
   - Earned certificates, coin balance, and profile remain accessible in read-only mode during paywall lock.
2. **Subscription Tiers**:
   - **Lite Plan**: ₹49 for 60 calendar days.
   - **Plus Plan**: ₹129 for 180 calendar days.
   - Subscriptions are activated exclusively upon admin approval of a valid 12-digit UTR.
3. **Class Change Governance**:
   - Maximum 1 class change during an active Premium period (`class_changes_used_premium <= 1`).
   - Maximum 1 class change post-expiry (`class_changes_used_post_expiry <= 1`).
   - Prevents curriculum abuse and account sharing across family members without proper entitlement.
4. **Study Coin Economy (Append-Only Ledger)**:
   - **Level Completion**: `+25 Coins` (awarded strictly once per distinct level upon achieving $\ge 70\%$ score and passing time-per-question anti-cheat).
   - **Referral Reward**: `+40 Coins` to the referrer only after the referee registers and finishes their first complete quiz.
   - **Daily Spin Wheel**: 1 spin per 24 UTC hours. Slices: 2, 3, 5 coins.
   - **Spin Wheel Jackpot**: 40 coins slice unlocked on the probability matrix ONLY if `qualified_referrals >= 1`.
5. **Annual Master Certificate**:
   - Awarded ONLY upon completing 3 distinct course levels within a single calendar year.
   - Enforces unique academic year deduplication key: `learner_id + "_" + academic_year`.

---

## 2.5 Hybrid AI Intelligence Engine (Live Gemini + Resilient Syllabus Fallback)

Operates Google Gemini 1.5 Flash live assessment generation with sub-4s automatic fallback to the verified offline syllabus question bank.

---

## 3. Security Architecture & Threat Model

| Threat Vector | Mitigation Strategy | Implementation |
|---|---|---|
| **Admin Route Discovery** | Complete exclusion from public sitemap, navigation, and robots; code-split under `/ops-vault-al99`. | React Lazy route with no public links |
| **Admin Impersonation** | Hard-locked to verified email `naitiknanda1235@gmail.com`. Any unauthorized access attempt yields 403 Forbidden and writes an immutable audit record. | `SuperAdminGuard.tsx` & `SecurityAuditService` |
| **Cross-Tenant Data Leakage** | Row-Level Security (RLS) simulation enforcing `learner_id` isolation on every read and write operation. | `StorageRLSLayer.ts` |
| **Payment UTR Replay Fraud** | Global unique constraint on 12-digit UTRs (`^[0-9]{12}$`) backed by SHA-256 fingerprint hashing. | `PaymentService.ts` |
| **Quiz Speedrun / Cheating** | Enforced minimum dwell time per question ($\ge 3$ seconds) before submit is accepted; prevents automated bot scripts. | `QuizEngine.ts` |
| **StudentPacks PII Leakage** | Real-time regex inspection for phone numbers, email addresses, external URLs, and vulgarity. | `PIIFirewall.ts` |

---

## 4. Directory & Module Structure

```
academiclevel-platform/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PROGRESS_TRACKER.md
│   ├── DB_SCHEMA.md
│   ├── CHANGELOG.md
│   └── SECURITY_AUDIT_LOG.md
├── src/
│   ├── core/
│   │   ├── auth/              # Auth context, SuperAdminGuard, Session
│   │   ├── security/          # UTR hashing, PII firewall, RLS isolation
│   │   ├── storage/           # Database driver, schema seeds, migrations
│   │   └── types/             # TypeScript domain models
│   ├── services/
│   │   ├── curriculumService.ts # CBSE, ICSE, IGCSE syllabus data
│   │   ├── quotaService.ts      # 25-quiz / 3-level paywall engine
│   │   ├── coinLedgerService.ts # Immutable append-only coin ledger
│   │   ├── paymentService.ts    # UPI QR generator & UTR verification
│   │   ├── novaAiService.ts     # Socratic AI tutor & offline fallback
│   │   ├── certificateService.ts# Level & Annual Master certificate generator
│   │   └── studentPacksService.ts# Community, friends, and PII-safe chat
│   ├── modules/
│   │   ├── student/           # 19 Age-Adaptive student modules
│   │   ├── public/            # 9 Public landing pages + /ads funnel
│   │   └── shared/            # Reusable UI components & ErrorBoundary
│   ├── admin-vault/           # /ops-vault-al99 12 Enterprise Admin modules
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

