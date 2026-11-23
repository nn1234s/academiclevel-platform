# AcademicLevel — System & Software Architecture

**Document ID:** AL-ARCH-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Core System Architecture  
**Owner:** Principal Software Architect  

---

## 1. C4 Architecture Models

### 1.1 C4 Level 1: System Context Diagram

```mermaid
C4Context
    title AcademicLevel — System Context Diagram
    
    Person(student, "Learner / Scholar", "K-12 student practicing CBSE, ICSE, or IGCSE curriculum")
    Person(parent, "Parent / Guardian", "Oversees student study habits and controls sensitive actions via 4-digit PIN")
    Person(admin, "Super-Admin", "ZingQuark platform operator managing payments, merchandise, and audit logs")
    
    System(academiclevel, "AcademicLevel Platform", "Adaptive quiz assessment engine, gamified rewards, and Socratic tutoring")
    
    System_Ext(gemini, "Google Gemini AI", "Powers live Socratic doubt tutoring and dynamic question synthesis")
    System_Ext(turso, "Turso Cloud DB", "Remote encrypted replica and disaster recovery sync for SQLite")
    System_Ext(upi, "Indian UPI Rail", "Handles QR code subscription payments via domestic banking rails")
    
    Rel(student, academiclevel, "Practices quizzes, spins daily wheel, chats with Nova AI, and claims rewards")
    Rel(parent, academiclevel, "Enters Parent PIN to manage account settings and review progress")
    Rel(admin, academiclevel, "Approves UTR payments, dispatches gifts, audits logs at /adminservice")
    
    Rel(academiclevel, gemini, "Calls Gemini 2.5 Flash for Socratic reasoning and quiz synthesis")
    Rel(academiclevel, turso, "Synchronizes SQLite writes periodically (every 5 mins) and on shutdown")
    Rel(student, upi, "Scans UPI QR code and submits 12-digit UTR reference")
```

---

### 1.2 C4 Level 2: Container Diagram

```mermaid
C4Container
    title AcademicLevel — Container Diagram
    
    Container(spa, "Single-Page Application (SPA)", "React 18, Vite 6, Tailwind CSS", "Responsive student and admin interface running in the browser")
    Container(api, "Backend API Server", "Node.js 22, Express 5", "REST API handling auth, payments, gamification, and assessment orchestration")
    ContainerDb(sqlite, "Local Database", "SQLite in WAL Mode (DatabaseSync)", "Embedded high-concurrency database storing 12k question bank, users, and ledgers")
    
    Container_Ext(gemini, "Google Gemini API", "HTTPS / JSON", "Cloud AI model provider for Socratic tutoring")
    Container_Ext(turso, "Turso Cloud DB", "HTTPS / LibSQL", "Encrypted cloud persistence replica")
    
    Rel(spa, api, "Makes REST API calls over HTTPS", "JSON / fetch")
    Rel(api, sqlite, "Synchronous zero-latency reads & writes via node:sqlite", "WAL Mode")
    Rel(api, gemini, "Synthesizes quiz questions with 22s timeout race guard", "POST /v1beta/models")
    Rel(api, turso, "Pushes delta records and flushes write buffer", "LibSQL API")
```

---

### 1.3 C4 Level 3: Core Component Architecture

Within the React SPA and Express backend, components are organized cleanly by responsibility:

```text
src/
├── core/
│   ├── api/apiClient.ts                ← HTTP client with automated fallback
│   ├── auth/AuthContext.tsx            ← Session management, role guards, token sync
│   ├── storage/StorageRLSLayer.ts      ← Client Row-Level Security & local persistence
│   ├── theme/classThemes.ts            ← NEP 2020 persona styling & color palettes
│   └── types/index.ts                  ← Strict TypeScript domain entity schemas
│
├── services/
│   ├── curriculumService.ts            ← Subject catalogues, grade mappings, chapters
│   ├── hybridQuizService.ts            ← Live AI synthesis + offline bank fallback
│   ├── offlineBankService.ts           ← Local syllabus bank queries & synthetic generators
│   ├── quotaService.ts                 ← Entitlement limits & 3-level free tier evaluation
│   ├── coinLedgerService.ts            ← Gamified ledger transactions & spin wheel cooldowns
│   └── certificateService.ts           ← Verifiable SHA-256 certificate generation
│
└── modules/
    ├── student/                        ← StudentDashboard, QuizEngine, NovaAiTutor, etc.
    ├── public/                         ← LandingPage, PricingPage, Special49AdsLandingPage
    ├── shared/                         ← ErrorBoundary, PaywallGateModal, AuthModal
    └── admin-vault/                    ← AdminVaultShell and management modules
```

---

## 2. Domain-Driven Design (DDD) Bounded Contexts

```mermaid
graph TD
    subgraph Contexts["AcademicLevel Bounded Contexts"]
        Auth["Identity & Parent Oversight Context"]
        Curriculum["Curriculum & Question Bank Context"]
        Assessment["Assessment & Evaluation Context"]
        Gamification["Gamification & Coin Ledger Context"]
        Subscription["Subscriptions & UPI Payments Context"]
        AiTutor["Socratic AI Tutoring Context"]
    end
    
    Auth -->|learnerId, parentPin| Assessment
    Auth -->|learnerId| Gamification
    Curriculum -->|syllabus hierarchy, 12k bank| Assessment
    Assessment -->|accuracy >= 70%, completion| Gamification
    Assessment -->|diagnostic reports| Auth
    Subscription -->|quota limits, tier| Assessment
    Assessment -->|question context| AiTutor
```

1. **Identity & Parent Oversight Context:** Owns `learners`, credentials, parent PIN hashes, and RLS session keys.
2. **Curriculum & Question Bank Context:** Owns board structures (`CBSE`, `ICSE`, `IGCSE`), 12 grade levels, subjects, chapters, and the 12,000 verified question records in `question_bank`.
3. **Assessment & Evaluation Context:** Owns quiz session state, 1-second bot dwell timers, question count verification, answer integrity evaluation, and `quiz_attempts`.
4. **Gamification & Coin Ledger Context:** Owns `coin_ledger`, daily spin wheel cooldowns, streak freezes, and `gift_requests` physical merchandise redemptions.
5. **Subscriptions & UPI Payments Context:** Owns `subscriptions`, 12-digit UTR references, A-Codes prepaid vouchers, and super-admin approval queues.
6. **Socratic AI Tutoring Context:** Owns Nova AI system instructions, Gemini chat endpoints, student message quotas, and transparent offline curriculum fallback banks.
