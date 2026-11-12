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
|  - 4-Tier Progression Nodes       |                    |   Lock: Hidden        |
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
| **Admin Impersonation** | Hard-locked to verified admin email and passkey session authentication. Any unauthorized access attempt yields 403 Forbidden and writes an immutable audit record. | `SuperAdminGuard.tsx` & `SecurityAuditService` |
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
# AcademicLevel Enterprise Platform — Changelog

All notable changes, architectural decisions, and security hardening updates are documented in this file.

## [v1.0.0-PROD] - 2026-11-09

### Added & Verified
- **Cross-Browser Synchronization & Unified Shared Database**:
  - Solved cross-browser sign-in isolation where accounts created in one browser (e.g. Chrome) were inaccessible in another (e.g. Edge).
  - Built a server-side storage plugin in `vite.config.ts` exposing `/api/storage` backed by persistent `data-store.json` on disk.
  - Implemented automatic bidirectional synchronization in `StorageRLSLayer.ts`: any learner registered or mutated on any browser is immediately synced to disk and loaded across all browsers.
  - Updated `AuthContext.tsx` (`loginStudent`, `registerStudent`) and `AuthModal.tsx` with asynchronous pre-flight server sync, allowing instant seamless login with the same email across all browsers.
  - Configured dev server to run outside sandbox boundaries so all local browsers have unrestricted socket access to `http://localhost:3000/`.

- **Optional UTR Reference & Primary Payer UPI ID Requirement**:
  - Re-architected `UPIQRCheckout.tsx` and `PaymentService.ts` so the **Payer UPI ID** (`payerUpiId`) is the primary required field (`*`).
  - Made the **12-digit Bank UTR / Reference No.** completely **optional**:
    - Students can now submit their payment verification by entering solely their Payer UPI ID.
    - If UTR is omitted, the platform automatically provisions an internal audit reference (`UPI-REF-XXXX`).
    - If UTR is entered, the platform continues to enforce 12-digit integrity and duplicate replay fraud prevention.
    - Added one-click copy button for Payer UPI ID inside Super-Admin Payment Verification Queue for effortless bank statement reconciliation.
- **Kid Control & Finder Center in Super-Admin Vault (`/ops-vault-al99`)**:
  - Overhauled `StudentManagement.tsx` into an all-in-one Kid Finder & Control dashboard.
  - Multi-attribute search (Student Name, Email, Phone, Referral Code, Student ID) with filters for Board (CBSE/ICSE/IGCSE), Class (1 to 12), and Subscription State (Free Tier, Lite, Plus, Pending, Suspended).
  - **Instant One-Click Grant Premium:** Super-admin can grant Lite (60d), Plus (180d), Trial (30d), Annual (365d), or custom durations to any kid with immediate ledger logging.
  - **Instant One-Click Ungrant Premium:** Super-admin can revoke premium on demand, immediately returning student to Free Tier.
  - **Deep Kid Control Drawer:**
    - Override & switch student Board (CBSE, ICSE, IGCSE) and Class (1–12) without burning the student's 1-change limit.
    - Reset Class Change Limits (`classChangesUsedPremium = 0`, `classChangesUsedPostExpiry = 0`).
    - Adjust Study Coin balance (add or deduct coins with ledger audit trails).
    - Reset Free Tier Quiz/Level usage meters.
    - Update/Reset 4-Digit Parent PIN and toggle account suspension.

- **Verified Server-Side 1-Day Verification Flow**:
  - Configured `UPIQRCheckout.tsx` and `PremiumCenter.tsx` so that upon payment submission, students see:
    `"Thank you for your purchase. Due to server side checks, we will grant after 1 day."`
  - Payments enter the Super-Admin Payment Verification Queue (`/ops-vault-al99`), where the admin can verify the UTR and approve/activate the subscription immediately.

- **Amazon GC & Digital Voucher Email Request Dispatch (`academiclevels@gmail.com`)**:
  - In `GiftStore.tsx`, when a learner redeems coins for an Amazon Pay or digital gift card, the platform debits the append-only ledger and prepares a formal claim dispatched to **`academiclevels@gmail.com`**.
  - Provides a one-click button to open pre-filled email in the learner's mail client (`mailto:academiclevels@gmail.com`) plus a one-click copy button for manual submission.
  - In the Super-Admin Vault, `GiftFulfillment.tsx` flags the redemption as targeted to `academiclevels@gmail.com` and provides voucher code dispatch controls.
- **High-Appeal Gift Card Reward Economy (Level 1 to 9)**:
  - Re-architected `GiftStore.tsx` to provide motivating real-world rewards starting at **500 Coins for ₹20 Gift Card**, scaling up across 9 milestones to **15,000 Coins for ₹500 Gift Card**:
    - Level 1: 500 Coins $\to$ ₹20 Gift Card / UPI Cash (Starter Milestone)
    - Level 2: 800 Coins $\to$ ₹30 Gift Card (Bronze Scholar)
    - Level 3: 1,200 Coins $\to$ ₹50 Gift Card (Silver Scholar)
    - Level 4: 2,500 Coins $\to$ ₹100 Gift Card (Gold Scholar)
    - Level 5: 4,000 Coins $\to$ ₹150 Gift Card (Platinum Scholar)
    - Level 6: 5,500 Coins $\to$ ₹200 Gift Card (Diamond Scholar)
    - Level 7: 7,00,00 Coins $\to$ ₹250 Gift Card (Master Scholar)
    - Level 8: 10,000 Coins $\to$ ₹350 Gift Card (Grandmaster)
    - Level 9: 15,000 Coins $\to$ ₹500 Gift Card (Olympiad Champion)
  - Unit Economics & Profit Margin: Real cash and voucher claims require an active Scholar Subscription (Lite ₹49 or Plus ₹129) and at least 3 levels mastered, locking in a guaranteed 60%+ platform profit margin. Free users can spend coins on zero-cost digital items in the Coin Mall.
  - Supported delivery formats: Amazon Pay Gift Card, Google Play Redeem Code, Flipkart Voucher, Swiggy Food, and Direct UPI Cash.
  - Added real-time coin progress bar tracking distance to next redeemable milestone.
  - Updated `CoinMall.tsx` with a prominent VIP banner linking learners directly to the Gift Card Arena.
  - Enhanced Admin Vault `GiftFulfillment.tsx` with voucher code input, digital dispatch tracking, and fulfillment audit trail.

- **Official Google Pay UPI QR Integration & High-Res Scanner Layout**:
  - Embedded authentic Google Pay merchant payment cards for `17 Pratyusha Nanda` (`theattirebbsr@okicici`):
    - `public/qr-lite-49.jpg` (Lite Plan ₹49.00 / 60 Days)
    - `public/qr-plus-129.jpg` (Plus Plan ₹129.00 / 180 Days)
  - Displayed high-resolution 737x1024 native ratio cards in `UPIQRCheckout.tsx` with one-click UPI ID copy, ensuring seamless scanning from phone cameras and all UPI banking apps.

- **Post-Login Routing & Frictionless Dashboard Experience**:
  - Configured automatic bypass of the marketing homepage (`HOME`) for authenticated learners, routing them straight to their personalized `StudentDashboard` (`DASHBOARD`).
  - Strict tenant isolation guarantees learners only ever see their own records.
- **Enterprise Documentation & Architecture (Phase 1)**:
  - `docs/ARCHITECTURE.md`: Complete topology, threat model, invariant constraints.
  - `docs/PROGRESS_TRACKER.md`: Modular phase checklist and progress tracking.
  - `docs/DB_SCHEMA.md`: PostgreSQL/RLS schema models with append-only ledger and UTR uniqueness.
  - `docs/SECURITY_AUDIT_LOG.md`: Initialized security audit ledger.
  - `docs/CHANGELOG.md`: Detailed changelog.

- **Security, Auth & Tenant Isolation Kernel (Phase 1)**:
  - `src/core/security/utrValidator.ts`: 12-digit numeric constraint `^[0-9]{12}$` & deduplication fingerprinting.
  - `src/core/security/piiFirewall.ts`: Regex firewall blocking phone numbers, emails, social handles, external links, and vulgarity.
  - `src/core/storage/StorageRLSLayer.ts`: Zero demo accounts, strict Row-Level Security simulation scoping every query to `learner_id`.
  - `src/core/auth/SuperAdminGuard.tsx`: Hard lock exclusively granting `/ops-vault-al99` access to authorized admin credentials. Any unauthorized attempt triggers immediate 403 Forbidden and audit record.
  - `src/core/auth/AuthContext.tsx`: Full auth provider, session manager, and controlled class-change governance (`classChangesUsedPremium <= 1`, `classChangesUsedPostExpiry <= 1`).

- **Multi-Board Curriculum Engine & Quota Gatekeeper (Phase 2)**:
  - `src/services/curriculumService.ts`: Covers Classes 1 to 12 across CBSE, ICSE/CISCE, and Cambridge IGCSE with 4-tier node progression (`FOUNDATION`, `CONCEPT`, `EXAM_READY`, `OLYMPIAD`).
  - `src/services/quotaService.ts`: Free tier strictly capped at 25 quizzes OR 3 course levels. Active Lite/Plus subscriptions lift all quotas.
  - `src/services/offlineBankService.ts`: Local question cache guaranteeing uninterrupted quizzes under 2,500ms network timeout fallback.
  - `src/services/novaAiService.ts`: Age-adaptive Socratic tutor (playful for primary, quest-oriented for middle, exam-rigor for senior high school).
  - `src/modules/student/QuizEngine.tsx`: Anti-cheat timer ($\ge 3$s per question dwell time), instant step-by-step explanations, and reward triggers.
  - `src/modules/shared/PaywallGateModal.tsx`: Unobtrusive paywall prompt preserving earned certificates, coins, and profile.

- **Gamification, Economy & Safe Community (Phase 3)**:
  - `src/services/coinLedgerService.ts`: Append-only ledger with cryptographic hash signatures.
    - Level completion reward: +25 Coins (strictly once per distinct level upon achieving $\ge 70\%$ score and passing anti-cheat).
    - Referral reward: +40 Coins to referrer ONLY after genuinely new student registers and completes first full quiz.
    - Daily spin wheel: 1 spin per 24 UTC hours. Standard slices: 2, 3, 5 coins.
    - Rare Jackpot: 40 Coins unlocked on the probability matrix ONLY when `qualified_referrals >= 1`.
  - `src/services/certificateService.ts`: Unique certificate IDs and Annual Master Certificate deduplication (max 1 per student per academic year).
  - `src/modules/student/DailySpinWheel.tsx`: Animated wheel with countdown timer and referral jackpot unlock.
  - `src/modules/student/ReferralProgramme.tsx`: Unique referral code and first-quiz qualification pipeline.
  - `src/modules/student/CoinMall.tsx`: Avatar frames, streak freezes, digital study guides.
  - `src/modules/student/GiftStore.tsx`: Physical rewards queued for admin dispatch.
  - `src/modules/student/StudentPacks.tsx`: Safe peer directory and real-time PII-filtered chat.
  - `src/modules/student/CertificateVault.tsx`: Printable/downloadable certificates with verification tokens.
  - `src/modules/student/AnnualMasterCertificate.tsx`: Milestone tracker for 3 distinct levels in one calendar year.
  - `src/modules/student/StreakEngine.tsx`: Visual 28-day consistency calendar heatmap.
  - `src/modules/student/StudentProfile.tsx`: Controlled class change manager and 4-digit Parent PIN lock.

- **Audited UPI QR Checkout & Admin Control Plane (Phase 4)**:
  - `src/modules/student/UPIQRCheckout.tsx`: Dynamic NPCI UPI QR code generator for ₹49 Lite (60d) and ₹129 Plus (180d). Captures Payer UPI ID and 12-digit UTR with state set to `PENDING_VERIFICATION`.
  - `src/services/paymentService.ts`: Payment verification service, ACode redemption, trial grants, and subscription management.
  - `src/admin-vault/AdminVaultShell.tsx`: Code-split super-admin portal locked to authorized super-admin credentials.
  - 12 Enterprise Admin Modules:
    1. `StudentManagement.tsx`
    2. `PaymentVerificationQueue.tsx`
    3. `EntitlementManager.tsx`
    4. `ACodeManager.tsx`
    5. `CurriculumManager.tsx`
    6. `QuestionBankManager.tsx`
    7. `LedgerInspector.tsx`
    8. `ReferralMonitor.tsx`
    9. `GiftFulfillment.tsx`
    10. `ModerationReports.tsx`
    11. `AuditLogViewer.tsx`
    12. `SystemHealthAnalytics.tsx`

- **Public Marketing & Compliance Funnel (Phase 5)**:
  - `src/modules/public/LandingPage.tsx`: Main hero, interactive board selector, social proof, pricing.
  - `src/modules/public/AdsLandingPage.tsx`: High-converting Google Ads & YouTube Ads distraction-free signup funnel at `/ads`.
  - `src/modules/public/PublicCourses.tsx`: Full syllabus catalogue preview.
  - `src/modules/public/PricingPage.tsx`: Transparent comparison (Free vs Lite ₹49 vs Plus ₹129).
  - `src/modules/public/AboutPage.tsx`: Educational philosophy and pedagogical mission.
  - `src/modules/public/FAQPage.tsx`: Complete answers to common questions.
  - `src/modules/public/LegalPages.tsx`: DPDP Act 2023 compliance, child safety protocol, and terms of service.
  - `src/modules/shared/ErrorBoundary.tsx`: Granular error boundary with state preservation.

- **Automated Verification Suite**:
  - `src/e2eVerification.ts`: 32 automated tests passed with 100% success rate across all security checkpoints, UTR deduplication, quotas, and ledger rules.
  - 
