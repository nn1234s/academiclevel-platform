# ADR 0001: Hybrid Quiz Synthesis with Curated Offline Bank Fallback

**Status:** ACCEPTED  
**Date:** 2026-11-23  
**Deciders:** Principal Architect, Lead Backend Engineer  
**Document ID:** AL-ADR-0001  

---

## Context
AcademicLevel provides dynamic quiz assessments aligned to CBSE, ICSE, and IGCSE syllabi across 12 grades. While Google Gemini can generate novel MCQs, large language model API calls introduce:
1. Latency spikes (7 to 15 seconds per call).
2. Rate limits or provider network timeouts.
3. Variable question counts (e.g. returning 5 questions when 10 were requested).
4. Potential hallucinations or cross-grade drift.

Students practicing for board exams require immediate responsiveness, guaranteed question counts matching advertised UI tiers (10, 12, 15), and 100% syllabus accuracy.

## Decision
We implemented a **Hybrid Quiz Fetcher Architecture** (`HybridQuizService.ts` and `OfflineBankService.ts`):
1. **Race-Guarded AI Attempt:** When live AI preference is enabled, the client initiates a request to `/api/ai/generate-quiz` wrapped in a 22-second `Promise.race()` timeout.
2. **Deterministic Offline Bank Fallback:** If the AI call times out, returns an error, or is disabled, the system immediately pulls from the local verified 12,000-question SQLite database (`question_bank`).
3. **Exact Count Guarantee:** If the AI or server response contains fewer questions than advertised, `QuizEngine.tsx` dynamically supplements the exact deficit from the curated syllabus bank, guaranteeing that a student who clicks "10 Questions" or "12 Questions" always receives exactly that count.

## Consequences
* **Positive:** Zero latency failure states for students; exact advertised question count matching; resilient to external AI outages.
* **Negative:** Requires maintaining and seeding a 12,000-question SQLite question bank.
