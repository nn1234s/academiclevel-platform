# AcademicLevel Enterprise Platform — Real Cloud Server & Universal Device Deployment Guide

This guide explains how to deploy **AcademicLevel** to a **real, 24/7 production cloud server** so that **any student on any device (Android, iPhone, iPad, Windows, Mac, Linux) on any network (4G, 5G, Wi-Fi)** can register, take quizzes, earn coins, and purchase subscriptions, while the Super-Admin can monitor everything from their own phone or laptop anywhere in the world.

---

## 1. Why `localhost` Doesn't Work Across Different Devices

- `http://localhost:3000/` points exclusively to the machine you are sitting at.
- A mobile phone or another computer has its own separate `localhost`.
- If your laptop is in sleep mode, turned off, or disconnected, a local server stops running.
- **The Solution:** Deploy to a **real cloud server** (e.g. Render, Railway, or Fly.io) with a **cloud database** (Render Persistent Volume or Supabase/Turso/Neon) that stays online **24 hours a day, 7 days a week, 365 days a year**.

---

## 2. Option A: Free 24/7 Cloud Deployment on Render (Recommended)

Render provides free hosting for full-stack Node.js + Express applications with automatic HTTPS SSL certificates.

### Step 1: Initialize Git and Push to GitHub
Open PowerShell in the project directory:
```powershell
cd "C:\Users\NEWADMIN\.gemini\antigravity\scratch\academiclevel-platform"
git init
git add .
git commit -m "feat: AcademicLevel v1.0.0-PROD enterprise release"
```
Create a new private or public repository on [GitHub](https://github.com/new) named `academiclevel-platform`, then link and push:
```powershell
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/academiclevel-platform.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [Render.com](https://render.com/) and sign in with your GitHub account.
2. Click **New +** $\to$ **Web Service**.
3. Select your `academiclevel-platform` repository.
4. Fill in the deployment details:
   - **Name:** `academiclevel`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** `Free`
5. In **Advanced** $\to$ **Add Environment Variable**:
   - `NODE_ENV` = `production`
   - `SUPER_ADMIN_EMAIL` = `admin@academiclevel.in` (or your chosen administrator email)
   - `DATA_DIR` = `/var/data`
6. (Optional Persistent Storage): Under **Disks**, click **Add Disk**, mount path `/var/data`, size `1 GB`.
7. Click **Create Web Service**.

Render will automatically build and publish your application at:
`https://academiclevel.onrender.com`

---

## 3. Option B: 1-Click Containerized Deployment (Railway / Fly.io / Docker)

The project includes an optimized production [`Dockerfile`](../Dockerfile) and [`render.yaml`](../render.yaml).

### Railway:
1. Go to [Railway.app](https://railway.app/).
2. Click **New Project** $\to$ **Deploy from GitHub repo**.
3. Railway automatically detects the `Dockerfile` or `server/server.js`, builds the frontend, and launches the server.
4. Go to **Settings** $\to$ **Generate Domain** to get your live URL (e.g. `https://academiclevel.up.railway.app`).

---

## 4. Option C: Instant Testing on Your Mobile Phone Right Now (Local Wi-Fi)

Your development server is already running and listening on all interfaces (`0.0.0.0:3000`).

Your computer's Wi-Fi IP address is:
```
192.168.0.184
```

### How to test on your phone right this second:
1. Ensure your mobile phone is connected to the **same Wi-Fi network**.
2. Open Chrome or Safari on your phone.
3. Type the address:
   ```
   http://192.168.0.184:3000/
   ```
4. If the page loads, you can register an account, take a quiz, and view the QR checkout.
5. *Note:* If Windows Firewall blocks the connection, allow inbound traffic for Node.js in Windows Defender Firewall settings, or use **Option A (Render)** for global internet access.

---

## 5. Universal Device Compatibility & Data Persistence

Once deployed to a real cloud server:
- **Any Student Device:** Works seamlessly on mobile phones (Android / iOS), tablets (iPad / Galaxy Tab), Chromebooks, laptops, and smart TVs via any standard browser.
- **Shared Central Database:** Every account registered on any device is stored permanently in the cloud SQL database.
- **Cross-Device Sessions:** A student can register on their desktop, practice quizzes on their phone, and their coin balances, progress levels, and subscriptions remain perfectly synchronized.
- **Super-Admin Vault Access (`/ops-vault-al99`):**
  - As the super-admin, you can open `https://your-cloud-domain.com/adminservice` directly on your smartphone anywhere in the world.
  - You will instantly see all submitted payments in your one-tick verification queue and can grant or revoke subscriptions on the go.
