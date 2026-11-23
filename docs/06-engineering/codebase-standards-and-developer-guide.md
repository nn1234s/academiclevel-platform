# AcademicLevel — Codebase Standards & Developer Guide

**Document ID:** AL-ENG-0002  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Developer Guidelines  
**Owner:** Senior Full-Stack Engineer  

---

## 1. Local Development Setup

### System Prerequisites
* **Runtime:** Node.js 22 LTS or newer (required for native `node:sqlite` `DatabaseSync`).
* **Package Manager:** npm 10+ (managed via Node LTS).
* **Operating System:** Windows, macOS, or Linux.

### Installation & Execution
```bash
# 1. Clone repository
git clone https://github.com/nn1234s/academiclevel-platform.git
cd academiclevel-platform

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env

# 4. Start frontend development server (Vite)
npm run dev

# 5. Start backend production server
npm start
# Server boots at http://localhost:3000/
```

---

## 2. Environment Variable Catalogue

| Variable Name | Required | Default / Format | Purpose | Secret Storage Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Optional | `3000` | HTTP listening port | Plaintext environment variable |
| `DB_PATH` | Optional | `server/data/academiclevel_prod.db` | Absolute or relative path to SQLite database | Plaintext environment variable |
| `TURSO_DATABASE_URL`| Optional | `libsql://...` | Remote Turso database connection string | Cloud Secret Manager (Render) |
| `TURSO_AUTH_TOKEN` | Optional | JWT string | Authentication bearer token for Turso | Cloud Secret Manager (Render) |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google Cloud Gemini AI API key | Cloud Secret Manager / Admin Vault |
| `SUPER_ADMIN_PASS` | Optional | Secure string | Access password for `/adminservice` | Cloud Secret Manager (Render) |
| `SESSION_SECRET` | Optional | 64-char hex string | Session cookie signing secret | Cloud Secret Manager (Render) |

---

## 3. Engineering & Coding Standards

1. **TypeScript Strict Mode:** All frontend and backend code must pass TypeScript compilation without errors (`tsc`). Implicit `any` is prohibited across business logic.
2. **Component Architecture:** Pure functional components with React Hooks. Avoid legacy class components.
3. **CSS & Styling:** Utility-first Tailwind CSS. Never use inline `style={{ ... }}` for static layout properties unless computing dynamic rotation angles (e.g. `transform: rotate(...)` in `DailySpinWheel.tsx`).
4. **Git Workflow:**
   * `main` — Production release branch. Deployed automatically to `https://academiclevel.in`.
   * `dev` — Staging integration branch.
   * Commits must follow Conventional Commits format: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
   * Both `main` and `dev` must remain synchronized.

---

## 4. Software Bill of Materials (SBOM) & Licence Review

AcademicLevel uses only permissive open-source packages:
* **MIT Licence:** `react`, `react-dom`, `vite`, `express`, `tailwindcss`, `lucide-react`, `canvas-confetti`, `qrcode`.
* **ISC / BSD-3:** `cors`, `autoprefixer`, `postcss`.
* **Zero Copyleft / Viral Licenses:** No GPL, AGPL, or SSPL licensed libraries are bundled in client or server distributions.
