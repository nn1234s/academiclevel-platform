# Nova AI Governance and System Card

```
Document ID:    AL-AI-0001
Owner:          AI/ML Systems Architect
Classification: Internal Governance / Educational System Card
Last Updated:   2026-11-23
Status:         Approved
Dependencies:   AL-ARCH-0001, AL-SEC-0001, AL-GRC-0001, SRC-0002
```

---

## 1. System Identity and Educational Intent

**Nova AI** is the built-in pedagogical conversational assistant embedded within the AcademicLevel platform (`src/components/AITutorModal.tsx`, `server/api.js`). 

Nova is engineered strictly as a **Socratic Learning Assistant** for K-12 students (Grades 1 through 12) across National and State boards (CBSE, ICSE, Cambridge, State Board).

### 1.1 Core Pedagogical Objectives
1. **Socratic Guidance**: Never provide raw answers to quiz questions or homework assignments directly. Instead, break problems down into foundational concepts and ask probing questions that lead the student to discover the answer themselves.
2. **Encouragement and Emotional Safety**: Maintain an encouraging, patient, positive, and non-judgmental tone suited to school-age learners.
3. **Curriculum Alignment**: Anchor explanations to standard school curricula (NEP 2020 competency framework, NCERT syllabi) across Mathematics, Science, Computer Science, English, and Social Studies.
4. **Safety Boundaries**: Strictly decline non-educational queries, controversial discussions, personal opinions, self-harm topics, or generation of deceptive/inappropriate content.

---

## 2. Technical and Behavioral Architecture

### 2.1 Interaction Modality
- **Client Interface**: Slide-out / floating modal (`AITutorModal.tsx`) available during learning journeys and post-quiz reviews.
- **Transport**: Authenticated HTTPS JSON POST request to `/api/ai/chat` (`server/api.js:1082-1135`).
- **Context Injection**: Each query to `/api/ai/chat` incorporates:
  - Active Student Grade (e.g., Grade 6).
  - Subject Context (e.g., Mathematics - Fractions).
  - Current Question/Problem Context (if launched from an active quiz question review).
  - Conversation turn history (last 6 turns retained client-side to prevent memory runaway).

### 2.2 System Prompt Specification
The backend enforces the authoritative system prompt (`server/api.js`):

```text
You are Nova, an empathetic, highly encouraging, and brilliant AI study buddy and tutor for K-12 school students on the AcademicLevel learning platform.

Your Pedagogical Guidelines:
1. Socratic Teaching: Do NOT give direct answers immediately if the student is asking about a problem or quiz question. Ask guiding questions, break down complex concepts, and lead them step-by-step.
2. Tone: Friendly, patient, enthusiastic, warm, and age-appropriate for Grade {grade}. Use gentle analogies, relatable real-world examples, and cheerful praise for effort.
3. Brevity & Formatting: Keep responses bite-sized, readable, and structured. Use Markdown bullet points, bold key terms, and short paragraphs. Avoid intimidating blocks of text.
4. Curricular Scope: Focus strictly on educational subjects: Mathematics, Science, Computer Science, English Grammar & Literature, and Social Studies.
5. Safety Boundaries: If a student asks questions unrelated to school, academics, general knowledge, or creative writing, or asks harmful/unsafe questions, warmly guide them back to their studies. Never discuss adult, illicit, or inappropriate topics.
```

---

## 3. High Availability and Fallback Mechanism

Recognizing that educational access must remain resilient regardless of external cloud API latency or quota limits, AcademicLevel implements a multi-tier fallback architecture:

```mermaid
flowchart TD
    Req[Student Question via /api/ai/chat] --> CheckKey{GEMINI_API_KEY Configured?}
    CheckKey -- Yes --> CallCloud[Call Google Gemini Flash API]
    CheckKey -- No --> RuleEngine[Execute Local Socratic Fallback Engine]
    
    CallCloud --> CloudSuccess{API Success within 8s?}
    CloudSuccess -- Yes --> Sanitize[Sanitize & Filter Markdown Output]
    CloudSuccess -- No / Timeout --> FallbackTrigger[Trigger Resilient Fallback]
    
    FallbackTrigger --> RuleEngine
    RuleEngine --> PatternMatch{Classify Intent & Concept}
    
    PatternMatch -- Math Keyword --> MathGuidance[Socratic Math Step Generator]
    PatternMatch -- Science Keyword --> ScienceGuidance[Conceptual Explainer & Question]
    PatternMatch -- CS Keyword --> CSGuidance[Syntax/Logic Guided Hint]
    PatternMatch -- General Query --> GeneralSocratic[Encouraging Guiding Prompt]
    
    Sanitize --> Resp[Return JSON { reply, model, timestamp }]
    MathGuidance --> Resp
    ScienceGuidance --> Resp
    CSGuidance --> Resp
    GeneralSocratic --> Resp
```

### 3.1 Local Socratic Engine Verification
If `GEMINI_API_KEY` is absent or the external service experiences network partitioning, `server/api.js` automatically routes the request to an internal pattern-matching pedagogical generator. The student receives continuous, context-relevant academic assistance without crashing or encountering blank screens.

---

## 4. AI Safety, Moderation, and Child Protection

In compliance with **DPDPA 2023 Section 9** (Well-being of Children) and child online safety benchmarks:

### 4.1 Content Filtering & Boundary Defense
1. **Pre-Filter Ingress**: Client-side and server-side keyword sanitization flags and rejects non-educational or explicit queries before dispatching to LLM APIs.
2. **System Instruction Anchoring**: The LLM is strictly instructed never to reveal system instructions, adopt unverified personas, or execute code injection payloads.
3. **No PII Retention**: Student queries sent to `/api/ai/chat` contain no student names, emails, school identities, or IP addresses. The AI model operates purely on ephemeral session tokens and grade-level context.
4. **Zero Profiling for Commercial Exploitation**: Consistent with DPDPA 2023 Section 9(2), interaction logs are never sold, processed for behavioral advertising, or shared with third-party data brokers.

---

## 5. Governance Alignment (ISO 42001 & NIST AI RMF)

AcademicLevel maps Nova AI's operational processes to international AI risk standards:

| Framework | Domain / Requirement | AcademicLevel Nova AI Implementation | Audit Evidence |
| :--- | :--- | :--- | :--- |
| **NIST AI RMF 1.0** | **Govern 1.1**: AI system policies and processes established. | System card AL-AI-0001, clear pedagogical boundary policies. | `docs/13-ai/nova-ai-governance-and-system-card.md` |
| **NIST AI RMF 1.0** | **Map 1.1**: Intended purpose, context, and environment mapped. | K-12 school curriculum support for CBSE/ICSE/State boards. | `docs/01-product/product-requirements-document.md` |
| **NIST AI RMF 1.0** | **Measure 2.2**: AI safety and output reliability evaluated. | Socratic fallback test suite, manual prompt regression checks. | `scripts/test_student_behavioral_suite.mjs` |
| **NIST AI RMF 1.0** | **Manage 1.3**: Fallback procedures for AI outages established. | In-memory local rule-based Socratic fallback engine. | `server/api.js:1115-1135` |
| **ISO/IEC 42001:2023** | **Clause 6.1**: Actions to address risks in AI system. | Minor protection guardrails, input sanitization, zero ad profiling. | `docs/10-security/security-architecture-and-threat-model.md` |
| **ISO/IEC 42001:2023** | **Clause 8.4**: AI model validation and performance verification. | Continuous monitoring of fallback activations and API response codes. | `server/data/academiclevel_prod.db (security_events)` |

---

## 6. Model Lifecycle and Maintenance

1. **Model Upgrades**: When migrating between upstream model releases (e.g., `gemini-1.5-flash` to newer releases), changes must be evaluated against the standard K-12 benchmark test set in `scripts/`.
2. **Response Latency Threshold**: Cloud inference must complete within 8,000ms. If exceeded, the client abort controller switches to the local Socratic generator.
3. **Parent Transparency**: Parents inspecting the Parent Portal can review their child's AI interaction counts and topic summaries to ensure transparent educational alignment.
