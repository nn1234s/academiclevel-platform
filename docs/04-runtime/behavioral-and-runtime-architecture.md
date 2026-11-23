# AcademicLevel — Behavioral & Runtime Architecture

**Document ID:** AL-RNTM-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Runtime Systems Architecture  
**Owner:** Senior Full-Stack Engineer & SRE Lead  

---

## 1. Runtime Sequence Diagrams

### 1.1 Quiz Execution, Evaluation, and Auto-Scroll Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant QuizEngine as QuizEngine.tsx
    participant Session as sessionStorage
    participant Storage as StorageRLSLayer
    participant API as /api/quizzes/attempt
    participant DB as SQLite (academiclevel_prod.db)

    Student->>QuizEngine: Clicks "Start Assessment"
    QuizEngine->>Session: Load or initialize active quiz state
    QuizEngine->>QuizEngine: Start 1-second dwell timer (anti-cheat)
    
    Student->>QuizEngine: Selects Option B (index 1)
    QuizEngine->>QuizEngine: Update selectedOption = 1
    
    Student->>QuizEngine: Clicks "Submit Answer"
    QuizEngine->>QuizEngine: Evaluate: isCorrect = (selectedOption === Number(q.correctIndex))
    alt isCorrect is true
        QuizEngine->>QuizEngine: Increment score (+1)
        QuizEngine->>QuizEngine: Style Option B Emerald Green
    else isCorrect is false
        QuizEngine->>QuizEngine: Keep score unchanged
        QuizEngine->>QuizEngine: Style Option B Rose Red, Correct Option Emerald Green
    end
    QuizEngine->>QuizEngine: Render Step-by-Step Explanation & Exam Tip
    
    Student->>QuizEngine: Clicks "Next Question"
    QuizEngine->>QuizEngine: Increment currentIndex, reset dwell = 0
    QuizEngine->>QuizEngine: scrollToQuizTop() (window.scrollTo(0, targetY - 90px))
    QuizEngine->>Session: Save in-progress progress JSON
    
    Note over QuizEngine: On final question submission:
    QuizEngine->>Storage: recordQuizAttempt(attempt)
    QuizEngine->>API: POST /api/quizzes/attempt
    API->>DB: INSERT INTO quiz_attempts & coin_ledger
    QuizEngine->>Session: removeItem(sessionKey)
```

---

### 1.2 Incomplete Assessment Exit Protection Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as App.tsx (Navigation Guard)
    participant Modal as Exit Confirmation Modal
    participant Engine as QuizEngine.tsx
    participant Session as sessionStorage

    Student->>UI: Clicks "Courses" or Header Back (mid-quiz)
    UI->>UI: Intercept route change (currentRoute === 'QUIZ')
    UI->>Modal: Open Exit Confirmation Modal (setQuizExitModalOpen(true))
    
    alt Student selects "Continue Assessment"
        Student->>Modal: Click "Continue Assessment"
        Modal->>UI: setQuizExitModalOpen(false)
        UI->>Engine: Stay in active quiz view (0 state loss)
    else Student selects "Leave Assessment"
        Student->>Modal: Click "Leave Assessment"
        Modal->>UI: navigateTo(route, { forceExit: true })
        UI->>Session: Retain al_active_quiz_... for later resumption
        Note over UI: NO recordQuizAttempt call<br/>NO coin rewards granted<br/>0 completed levels counted
        UI->>UI: Switch route to target destination
    end
```

---

## 2. State Machine Diagrams

### 2.1 Quiz Attempt State Transitions

```mermaid
stateDiagram-v2
    [*] --> UNSTARTED
    UNSTARTED --> IN_PROGRESS: Click "Start Assessment"
    IN_PROGRESS --> ABANDONED_SAVED: Mid-Quiz Exit ("Leave Assessment")
    ABANDONED_SAVED --> IN_PROGRESS: Resume Quiz from Session
    IN_PROGRESS --> EVALUATED_PASSED: Complete all Qs (Score >= 70%)
    IN_PROGRESS --> EVALUATED_FAILED: Complete all Qs (Score < 70%)
    
    EVALUATED_PASSED --> REWARD_CLAIMED: Award +25 Coins, Streak Up
    EVALUATED_FAILED --> RETRY_AVAILABLE: Diagnostic Mailbox Report Sent
    REWARD_CLAIMED --> [*]
    RETRY_AVAILABLE --> [*]
```

### 2.2 Subscription & Payment State Transitions

```mermaid
stateDiagram-v2
    [*] --> FREE_TIER: Student Registers (3 Free Levels)
    FREE_TIER --> EXHAUSTED: Completes 3 Levels
    EXHAUSTED --> PAYWALL_LOCKED: Attempt 4th Level
    
    PAYWALL_LOCKED --> PENDING_VERIFICATION: Submit UPI QR UTR (12-digits)
    PAYWALL_LOCKED --> ACTIVE_PREMIUM: Redeem Valid A-Code Voucher
    
    PENDING_VERIFICATION --> ACTIVE_PREMIUM: Admin Approves UTR at /adminservice
    PENDING_VERIFICATION --> PAYWALL_LOCKED: Admin Rejects UTR (Invalid / Duplicate)
    
    ACTIVE_PREMIUM --> EXPIRED: 60/180/365 Days Elapsed
    EXPIRED --> PAYWALL_LOCKED: Free Limit Already Exhausted
```

---

## 3. Failure Mode and Effects Analysis (FMEA)

| Failure Mode | Root Cause | Potential Severity | Detection Mechanism | Built-In System Mitigation | Verified Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemini AI Service Timeout** | Cloud provider latency or rate limit | Moderate | 22-second `Promise.race()` timeout in `hybridQuizService.ts` | Automatically falls back to 12,000-question SQLite question bank (`CURATED_OFFLINE`) | `test_student_behavioral_suite.mjs` (Step 13 & 14) |
| **Accidental Browser Refresh** | Student refreshes page mid-assessment | High | `sessionStorage` key lookup on component mount | In-progress state automatically restores question bank, index, and score | `QuizEngine.tsx` lines 126–143 |
| **Rapid Bot Clicking** | Automated script answering < 1s | High | 1-second dwell guard in `QuizEngine.tsx` | Disables "Submit Answer" button until dwell >= 1s; increments `antiCheatViolations` | `QuizEngine.tsx` lines 276–278 |
| **SQLite Concurrent Lock** | Concurrent writes on high-traffic bursts | Moderate | Busy handler (`busy_timeout = 5000`) | WAL mode enables non-blocking readers; writers queue for up to 5000ms | `server/db.js` PRAGMA busy_timeout |
| **Spin Wheel Angular Drift** | Accumulation of previous rotation angles | Low | Cumulative degree evaluation | Normalizes target degrees modulo 360° relative to current normalized wheel angle | `DailySpinWheel.tsx` lines 86–91 |
