# AcademicLevel — System Overview & Governance Scope

**Document ID:** AL-GOV-0003  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Corporate Governance & System Boundaries  
**Owner:** Executive Management & Principal Architect  

---

## 1. Executive System Overview

**AcademicLevel** (`https://academiclevel.in`) is an adaptive, gamified assessment and learning platform calibrated specifically for Indian school curricula (CBSE, ICSE, and Cambridge IGCSE) spanning Classes 1 through 12.

AcademicLevel is operated under the parent corporate brand **ZingQuark India Technologies Pvt Ltd** ("ZingQuark"). The core mission of the platform is to replace passive rote learning and unmonitored homework-cheating with rigorous, Socratic assessments, 4-tier pedagogical progression pathways, and real doorstep merchandise rewards earned exclusively through academic mastery.

---

## 2. In-Scope System Boundaries

The following components, services, and modules are verified as active and in-scope for this engineering architecture:

1. **Client Single-Page Application (SPA):**
   * Built on React 18, Vite 6, and Tailwind CSS.
   * State persistence via browser `localStorage` and `sessionStorage`.
   * Client-side Row-Level Security abstraction ([`StorageRLSLayer.ts`](../../src/core/storage/StorageRLSLayer.ts)) ensuring offline resilience.

2. **Backend Application API Server:**
   * Node.js 22 LTS with Express 5 ([`server/server.js`](../../server/server.js) & [`server/api.js`](../../server/api.js)).
   * REST endpoints mounted under `/api` handling authentication, curriculum progression, quiz attempts, payments, coin transactions, and gift requests.

3. **Data Persistence Engine:**
   * Primary local embedded database: SQLite in WAL mode ([`server/db.js`](../../server/db.js)) using Node 22 built-in `node:sqlite` (`DatabaseSync`).
   * Cloud replica & disaster recovery sync: Turso Cloud Database ([`server/tursoClient.js`](../../server/tursoClient.js)).
   * Syllabus Question Bank: 12,000 verified curriculum questions spanning Classes 1–12 across Math, Computer Science, Science, English, and Social Studies.

4. **Nova AI Socratic Tutoring Service:**
   * Live model integration via Google Gemini API (`server/api.js`).
   * Transparent, zero-credit offline curriculum fallback bank.

5. **Gamification & Rewards Engine:**
   * Cryptographically auditable coin ledger (`coin_ledger`).
   * 24-hour UTC Daily Spin Wheel with calibrated quadrant landing math.
   * Gift Store handling physical merchandise redemptions and Amazon doorstep tracking.

6. **Payment & Entitlement Gate:**
   * UPI QR Code payment submission with 12-digit UTR bank reference verification.
   * Prepaid institutional A-Code voucher redemptions.
   * Super-Admin verification queue at `/adminservice`.

---

## 3. Explicitly Out-of-Scope Systems & Anti-Patterns

To maintain factual engineering integrity and avoid manufactured enterprise complexity, the following are confirmed as **OUT OF SCOPE**:

* **Multi-Tenant Teacher / School LMS Portals:** AcademicLevel is strictly student- and parent-facing. There is no multi-tenant enterprise role hierarchy or teacher grading portal in the production codebase.
* **Complex Microservices & Kubernetes:** AcademicLevel operates as an Express + Vite monolith deployed on cloud container hosting (Render). Service meshes, Kafka brokers, and Kubernetes clusters do not exist and must not be documented as current architecture.
* **International Fiat Gateways:** Payments are conducted exclusively in Indian Rupees (INR) via UPI QR Code and domestic banking rails. International credit cards, Stripe, or PayPal are out of scope.
