# AcademicLevel — Deployment & Infrastructure Inventory

**Document ID:** AL-OPS-0001  
**Created:** 2026-11-23  
**Status:** VERIFIED — IMPLEMENTED  
**Classification:** Infrastructure Inventory  
**Owner:** SRE & Cloud Operations Lead  

---

## 1. Cloud Hosting & Compute Topology

AcademicLevel is hosted as a single-container unified web service on **Render Cloud Infrastructure**:

* **Host Platform:** Render Cloud Application Services (`https://render.com`)
* **Production Domain:** `https://academiclevel.in`
* **Blueprint Configuration:** [`render.yaml`](../../render.yaml) & [`Dockerfile`](../../Dockerfile)
* **Runtime Container:** Node.js 22 LTS running Alpine Linux / Debian Slim
* **Process Model:** Single Express 5 process serving pre-compiled Vite static frontend assets (`dist/`) and `/api` REST endpoints.
* **Internal Port:** `3000` (`process.env.PORT`)
* **Reverse Proxy Trust:** Enabled (`app.set('trust proxy', true)`) to parse client IP and protocol from Cloudflare / Render edge headers.

---

## 2. Infrastructure Specification (`render.yaml` & `Dockerfile`)

```yaml
services:
  - type: web
    name: academiclevel-platform
    env: node
    plan: starter
    region: singapore # Closest low-latency region to Indian subcontinent
    buildCommand: npm install && npm run build
    startCommand: node server/server.js
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: TURSO_DATABASE_URL
        sync: false
      - key: TURSO_AUTH_TOKEN
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```

---

## 3. Network, Edge, and Security Headers

The application implements defensive HTTP security headers configured at `server/server.js`:

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
```

* **TLS / SSL:** Automated Managed TLS certificates terminating at Render edge CDN with TLS 1.3 enforcement.
* **Health Check Probe:** Endpoint `/api/health` returns HTTP 200 with uptime, database status, and question bank counts.
