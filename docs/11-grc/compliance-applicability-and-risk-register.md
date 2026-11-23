# AcademicLevel — Compliance Applicability & Risk Register

**Document ID:** AL-GRC-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — AUTHORITATIVE  
**Classification:** Governance, Risk & Compliance  
**Owner:** GRC Lead & Legal Compliance Counsel  

---

## 1. Statutory & Regulatory Applicability Assessment

### 1.1 Digital Personal Data Protection Act, 2023 (DPDPA - India)
* **Jurisdiction:** Republic of India (Government of India Gazette Act No. 22 of 2023).
* **Applicability:** **DIRECTLY APPLICABLE.** AcademicLevel processes personal data of Indian resident students and parents.
* **Section 9 Compliance (Processing Data of Children):**
  - AcademicLevel requires parental oversight for student accounts under 18 years of age.
  - The platform captures `parentName`, `parentEmail`, and establishes a 4-digit `parentPin` required for account modifications.
  - **Zero Behavioral Tracking of Minors:** No third-party targeted advertising networks (e.g. Meta Pixel, TikTok Pixel, or behavioral ad brokers) are embedded in student learning views.
  - **Right to Erasure:** Dedicated account deletion workflow accessible via `/delacc` and `/api/auth/delete-account`.

### 1.2 CERT-In Cybersecurity Directions (Section 70B(6) IT Act)
* **Jurisdiction:** Indian Computer Emergency Response Team (CERT-In).
* **Applicability:** **DIRECTLY APPLICABLE.**
* **Compliance Actions:**
  - `security_audit_logs` maintains chronological records of administrative events, client IP addresses, and operational mutations.
  - Log retention standard set to a minimum of 180 days within database storage.

### 1.3 Enterprise & International Frameworks Qualification

> [!IMPORTANT]
> The following evaluation represents a technical applicability assessment. AcademicLevel does **NOT** claim external third-party audit certification for ISO 27001, SOC 2, or PCI-DSS.

| Framework | Status | Justification & Architectural Reality |
| :--- | :--- | :--- |
| **ISO/IEC 27001:2022** | Comparative Technical Reference | Information security management principles (least privilege, change control, threat modeling) are applied; formal ISO certification has not been audited by an accredited registrar. |
| **SOC 2 Type II** | Comparative Technical Reference | Internal controls over security, availability, and confidentiality are mapped; formal third-party SOC 2 Type II audit report has not been commissioned. |
| **PCI-DSS v4.0** | **NOT APPLICABLE** | AcademicLevel does not process, store, or transmit credit card numbers. Payments are handled via off-site UPI QR Code rails using 12-digit bank UTR numbers. |
| **HIPAA** | **NOT APPLICABLE** | Platform contains no protected health information (PHI). |
| **GDPR / COPPA** | Design Reference for Minor Privacy | Evaluated for technical privacy-by-design standards regarding minor consent and data minimization. |

---

## 2. Enterprise Risk Register

| Risk ID | Risk Description | Likelihood | Impact | Severity | Owner | Mitigation Strategy | Residual Risk | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: | :--- |
| **RSK-0001** | Third-party Google Gemini API rate limits or service degradation impacting live quiz generation | Medium | Moderate | Medium | AI Architect | Auto-fallback to verified 3,600 SQLite Question Bank ensures zero student-facing downtime. | Low | **MITIGATED** |
| **RSK-0002** | Fraudulent student submission of fictitious 12-digit UTR numbers for subscription activation | High | Moderate | Medium | Super-Admin | Subscriptions remain in `PENDING_VERIFICATION` until manual super-admin verification against bank statements. | Low | **MITIGATED** |
| **RSK-0003** | Cloud container restart causing local SQLite database state divergence | Low | High | Medium | SRE Lead | Dual-layer persistence: WAL SQLite disk storage combined with asynchronous Turso Cloud synchronization every 5 minutes. | Low | **MITIGATED** |
| **RSK-0004** | Discrepancy between advertised card question counts and served assessment items | Low | High | High | QA Lead | Exact count matching enforcement in `QuizEngine.tsx` and automated behavioral test suite in CI. | Low | **RESOLVED** |
| **RSK-0005** | Accidental loss of in-progress assessment on mobile browser tab closure | Medium | Moderate | Medium | UX Architect | In-app exit confirmation modal and `sessionStorage` in-progress state restoration. | Low | **RESOLVED** |
