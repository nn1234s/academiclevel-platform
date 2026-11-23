# AcademicLevel — Third-Party Vendor & Sub-Processor Inventory

**Document ID:** AL-VND-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Vendor Governance  
**Owner:** DevSecOps Lead & Security Engineer  

---

## 1. Sub-Processor Directory

The table below catalogs all external third-party service providers that process or store AcademicLevel data:

| Vendor ID | Vendor / Legal Entity | Service Provided | Data Accessed / Transferred | Criticality Tier | Data Residency | Portability / Exit Strategy |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **VND-0001** | **Render Services, Inc.** | Container application hosting, Edge TLS, and reverse proxy | HTTP request headers, ephemeral server disk, application logs | **Tier 1 (Critical)** | Singapore / Global Edge | Standard Docker container; portable to any Node 22 Linux VPS or AWS/GCP container host within 15 minutes. |
| **VND-0002** | **ChiselStrike, Inc. (Turso)** | Remote encrypted SQLite (LibSQL) replica and backup sync | Encrypted database replica tables (`learners`, `subscriptions`, `coin_ledger`) | **Tier 2 (High)** | Global Edge / AWS | Embedded SQLite database in `server/db.js` operates independently; Turso sync can be decoupled or pointed to another LibSQL host without downtime. |
| **VND-0003** | **Google LLC (Google Cloud / Gemini API)** | Large Language Model API for Nova AI Socratic tutoring | Student question queries, Grade, Board, and Subject prompts (No PII) | **Tier 2 (High)** | Global (Google Cloud AI) | Zero hard lock-in: System automatically falls back to internal 12,000-question SQLite syllabus bank on API failure or provider termination. |
| **VND-0004** | **Amazon India (Amazon Seller / Fulfillment)** | E-commerce doorstep fulfillment of physical educational gifts | Student recipient name, shipping address, courier tracking AWB | **Tier 3 (Medium)** | India | Manual/automated gift orders; interchangeable with any domestic courier or logistics partner (BlueDart, Delhivery). |
| **VND-0005** | **NPCI / Indian Domestic Banking Rail** | Unified Payments Interface (UPI) QR Code payment processing | 12-digit UTR bank reference number, payment amount in INR | **Tier 3 (Medium)** | India | Off-site UPI payment rail; compatible with all standard Indian UPI applications (Google Pay, PhonePe, Paytm, BHIM). |

---

## 2. Supply Chain Security Controls

1. **Lockfile Enforcement:** Dependency versions are locked via `package-lock.json` preventing unvetted upstream dependency mutations.
2. **Zero In-App Third-Party Analytics:** No behavioral advertising trackers (e.g. Meta Pixel, Google AdSense) are loaded within student quiz screens, upholding strict minor data protection.
3. **No Direct PII to AI Providers:** Prompt payloads to Google Gemini contain strictly pedagogical curriculum context (`Board`, `Grade`, `Subject`, and academic problem statement); learner full names, emails, and phone numbers are stripped prior to API dispatch.
