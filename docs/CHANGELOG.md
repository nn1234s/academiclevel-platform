# AcademicLevel Enterprise Platform — Changelog

All notable changes, architectural decisions, and security hardening updates are documented in this file.

## [v1.4.0-PROD] - 2026-11-14

### Google Gemini 5-Key Cascading Failover Engine
- **Server Failover Pool (`server/api.js`)**:
  - Implemented `getGeminiApiKeys()` to retrieve up to 5 unique Gemini API keys from `system_settings.gemini_api_keys` JSON array, slots `gemini_api_key_1..5`, legacy single key, and environment variables `GEMINI_API_KEY_1..5` / `GEMINI_API_KEY`.
  - Implemented `callGeminiApiWithMultiKeyFallback(bodyPayload, timeoutMs = 20000)` cascading through Key 1 -> Key 2 -> Key 3 -> Key 4 -> Key 5 in real time. If Key 1 fails (rate limit 429, invalid key, or quota exhausted), the server automatically cascades to the next key before falling back to the curated syllabus bank.
  - Upgraded `/ai/generate-quiz`, `/ai/explain`, and `/ai/chat` endpoints to leverage the 5-key failover pool.
  - Updated `POST /admin/ai/config` to accept and persist `geminiApiKeys: string[]`.
  - Updated `POST /admin/ai/test-connection` with multi-key diagnostic ping testing all keys in the pool with per-slot latency and model status.
- **Admin Vault Key Management (`src/admin-vault/modules/QuestionBankManager.tsx`)**:
  - Replaced single key input with a 5-Slot API Key Manager (Slot 1 Primary, Slots 2–5 Failover).
  - Added visibility toggle (eye/eye-off), paste from clipboard, clear buttons, and per-slot live test indicators.
  - Added "Save 5 API Keys" and "Test All 5 Keys" actions.
- **Client Synchronization (`src/services/hybridQuizService.ts`)**:
  - Added `getClientStoredKeysPool()` and `setClientStoredKeysPool()`.
  - Enforced `maxOutputTokens: 2430` strictly and relaxed latency guards to 20,000ms–22,000ms.

### 30-Coin Class Practice Worksheets & Revision PDF Center
- **Dedicated Worksheet Viewer (`src/modules/student/PracticeWorksheetViewer.tsx`)**:
  - Generates authentic, curriculum-calibrated practice worksheets directly from the 12,000-question SQLite question bank for all classes (Classes 1 to 12) across CBSE, ICSE, and Cambridge IGCSE.
  - Features subject selector, question count selector (10, 15, 20 questions), and re-roll bank action.
  - **Academic Header**: School banner, candidate name, student ID, board, class, subject, date, time allowed, max marks.
  - **Section A**: Objective Multiple Choice Questions with clean bubble circles `(A)  (B)  (C)  (D)` and candidate answer boxes.
  - **Section B**: Student rough work and calculation scratchpad.
  - **Section C**: Detachable Answer Key & NCERT Step-by-Step Solutions with print page-break `page-break-before: always;`.
  - **1-Click Vector Print**: Opens dedicated printable preview window styled with pristine `@media print` CSS for saving as high-resolution PDF or printing.
  - **Offline Download**: 1-click standalone `.html` worksheet file for offline practice.
- **Coin Mall Integration (`src/modules/student/CoinMall.tsx`)**:
  - Replaced legacy text guide with active 30-coin Practice Worksheets card.
  - On 30-coin purchase: deducts 30 coins via `CoinLedgerService`, persists unlock in student state, and opens `PracticeWorksheetViewer`.
  - Displays "📄 Open & Print Practice Worksheets" with lifetime access once unlocked.

## [v1.3.0-PROD] - 2026-11-11

### 12,000 Question Curriculum Bank (1,000 Questions per Class)
- **Comprehensive Class 1–12 Coverage**:
  - Expanded `src/data/curatedQuestionBank.json` to exactly 12,000 authentic, syllabus-aligned questions.
  - Exactly 1,000 verified questions for each of the 12 grades (Class 1 to Class 12).
  - Balanced across all three education boards: CBSE (3,996 questions), ICSE (4,008 questions), Cambridge IGCSE (3,996 questions).
  - Perfect unbiased answer distribution across all options:
    - Option A: 2,982 (24.85%)
    - Option B: 2,990 (24.92%)
    - Option C: 2,999 (24.99%)
    - Option D: 3,029 (25.24%)
  - Full node coverage across Foundation, Concept, Exam-Ready, and Olympiad.
  - Zero mock or placeholder questions.

### Distinct Class UI & Visual Identity Engine
- **Class Theme Architecture (`src/core/theme/classThemes.ts`)**:
  - Engineered distinct visual identity, color palettes, custom mascots, mottos, and specialized widgets for each individual grade (Classes 1 to 12).
  - Categorized into 4 progressive learning stages:
    - **Classes 1–4 (Primary Discovery):** Fun Star Sticker Book, adventure trails, vibrant gradients, bubbly option pills.
    - **Classes 5–8 (Middle School Tactical):** Tactical Cadet Mission Radar, Level Tree, streak multipliers, tech borders.
    - **Classes 9–10 (Secondary Board Preparation):** Official CBSE/ICSE Specimen Question Paper formatting, Live 10th Board Exam Countdown Clock (to Feb 15), Topper Target Simulator.
    - **Classes 11–12 (Senior Secondary Competitive):** NTA CBT Speed-Run Arena, PCM/PCB Stream Specialist Hub, Question Palette grid, rapid formula docks.
- **Interactive Class Switcher Bar (`src/modules/shared/ClassSwitcherBar.tsx`)**:
  - Added horizontal class switcher bar at top of dashboard for instant preview and navigation across all 12 classes without burning student account class-change limits.
- **Dynamic Quiz Engine UI (`src/modules/student/QuizEngine.tsx`)**:
  - Quiz screen adapts dynamically to active class theme (`PLAYFUL_BUBBLY`, `TACTICAL_QUEST`, `BOARD_SPECIMEN`, `COMPETITIVE_NTA`).

### Zero-Lockout Admin Authentication & PII Protection
- **Multi-Layer Cryptographic SHA-256 Authentication**:
  - Gated administrative access via SHA-256 one-way cryptographic hashes on both server (`server/api.js`) and client (`SuperAdminGuard.tsx`, `AuthContext.tsx`).
  - Added seamless client-side Web Crypto fallback so the founder can never be locked out of the Student Portal or Administrator Portal even during cloud server (Render) cold starts.
  - Zero plaintext passwords or personal emails stored in git or public notes.

### Curriculum & AI Core Upgrade
- **1,984-Question Comprehensive Curriculum Bank**:
  - Generated and verified 1,984 authentic class-wise multiple-choice questions across Classes 1 through 12.
  - Full board coverage: CBSE (664 questions), ICSE (664 questions), and Cambridge IGCSE (656 questions).
  - Balanced answer distribution: Correct indices evenly distributed (0: 24.8%, 1: 24.3%, 2: 25.8%, 3: 25.1%), eliminating any Option A bias.
  - Integrated into `OfflineBankService.ts` and `curatedQuestionBank.json` with subject normalization and dynamic fallback hierarchy.
- **Upgraded to Google Gemini 2.5 Flash**:
  - Replaced legacy Gemini models with `gemini-2.5-flash` across backend API routes (`/api/ai/generate-quiz`, `/api/ai/explain`, `/api/ai/chat`, `/api/admin/ai/test-connection`).
  - Updated client-side direct calling services: `HybridQuizService.ts`, `novaAiService.ts`, and `QuestionBankManager.tsx`.

### Security Hardening & StudentPacks Backend
- **Storage & Coin Minting Hardening**:
  - Hardened `/api/storage` against anonymous scraping; now strictly requires valid admin passkey or bearer token (401 Unauthorized for anonymous callers).
  - Secured `/api/coins/transact`: positive credit minting (`amount > 0`) is restricted to super-admin credentials; student callers can only perform legitimate store debits within their own verified balance.
- **Production SQLite StudentPacks Backend**:
  - Built persistent SQLite relational tables `friendships` and `student_messages` in `server/db.js`.
  - Added REST endpoints for peer discovery, friend requests, response handling, and live messaging.
  - Implemented automated PII/profanity firewall blocking phone numbers, email addresses, and inappropriate content before persistence.
- **Gift Store Milestone Recalibration**:
  - Re-anchored reward costs from theoretical multi-year thresholds to motivating, realistic student milestones (500 coins for ₹20 up to 15,000 coins for ₹500).

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
  - Re-architected `GiftStore.tsx` to provide motivating real-world rewards starting at **500 Coins for ₹20 Gift Card**, scaling up by milestones to **15,000 Coins for ₹500 Gift Card**:
    - Level 1: 500 Coins $\to$ ₹20 Gift Card / Direct UPI (Starter Milestone)
    - Level 2: 800 Coins $\to$ ₹30 Gift Card (Bronze Scholar)
    - Level 3: 1,200 Coins $\to$ ₹50 Gift Card (Silver Scholar)
    - Level 4: 2,500 Coins $\to$ ₹100 Gift Card (Gold Scholar)
    - Level 5: 4,000 Coins $\to$ ₹150 Gift Card (Platinum Scholar)
    - Level 6: 5,500 Coins $\to$ ₹200 Gift Card (Diamond Scholar)
    - Level 7: 7,000 Coins $\to$ ₹250 Gift Card (Master Scholar)
    - Level 8: 10,000 Coins $\to$ ₹350 Gift Card (Grandmaster)
    - Level 9: 15,000 Coins $\to$ ₹500 Gift Card (Olympiad Champion)
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
