# 🛡️ SafeHer AI – Women Safety Navigation & Emergency Response System

A production-style, mobile-first, responsive, and accessible full-stack web application designed for women's personal safety, AI-assisted safe navigation, and real-time emergency response dispatch.

---

## 🌟 Key Features

1. **Deliberate Hold SOS Trigger ("I'M IN DANGER")**:
   - 2-second circular SVG progress hold to eliminate accidental triggers.
   - Immediate high-precision GPS coordinate capture (Latitude, Longitude, Accuracy, Reverse Geocoded Address).
   - Real-time Socket.IO dispatch to Admin Command Center with audible siren alarm.
   - Automated delivery logging with verified tracking receipts sent to emergency contacts.
   - Continuous 6-second live GPS breadcrumb stream until incident resolution.

2. **AI-Assisted Safe Route Navigation**:
   - Multi-route calculation (Safest Recommended, Main Transit Corridor, Direct Shortcut).
   - **AI Safety Score (0–100)**: Evaluates street illumination density, 24/7 safe havens proximity, time of day penalty, and active hazard reports.
   - Interactive OpenStreetMap & Leaflet mapping with safe havens (Police, Hospitals, Shelters, Safe Hubs).
   - Clear and prominent safety disclaimers.

3. **SafeAI Companion & Emergency Triage**:
   - 24/7 conversational safety intelligence with rapid triage actions.
   - **Simulated Fake Incoming Phone Call** with realistic audio ringtones to safely deter uncomfortable surroundings.
   - Direct 1-tap police dialers (911 / 112 / 100), legal safety rights, and de-escalation protocols.

4. **Safety Check-In Timers with Auto-Escalation**:
   - Preset duration timers (15m, 30m, 45m, 1h).
   - Visual countdown clock with one-tap "I Have Arrived Safely" confirmation.
   - Automatic background escalation to emergency contacts and dispatchers if the timer expires without confirmation.

5. **Crowdsourced Community Hazard Intel**:
   - User report submission for poor street lighting, harassment hotspots, isolated corridors, and suspicious activity.
   - Severity tags and status badges (`PENDING`, `APPROVED`, `REJECTED`).

6. **Admin Command Center (`/admin`)**:
   - Role-Based Access Control (RBAC) with secure session authentication.
   - Real-time Live Emergency Map with animated pulse markers and user breadcrumb trails.
   - Incident Triage Workflow (`NEW` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` / `CANCELLED`).
   - Community safety reports moderation (Approve / Reject / Delete).
   - Safety Zones manager (Police stations, 24/7 Hospitals, Safe Havens).
   - Analytics dashboard with charts on incident trends, hazard distributions, and average response times.
   - Immutable security audit log stream.

7. **Demo Presentation Mode**:
   - 1-click toggle to demonstrate the complete end-to-end SOS workflow without contacting real 911 services.
   - Simulated walking movement GPS updates and mock delivery logs.

---

## 🏗️ Architecture & Tech Stack

```
SafeHer AI Architecture
├── Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Leaflet, Lucide Icons, Socket.IO Client, Web Audio API
├── Backend: Node.js, Express, TypeScript, Socket.IO, Helmet, BcryptJS, JWT, Zod, Rate-Limiting
├── Database: Universal DB Engine supporting PostgreSQL via DATABASE_URL with zero-setup JSON/SQLite fallback
└── Real-Time Layer: Socket.IO bi-directional event stream (room:admins, user rooms, incident streams)
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js** (v18 or v20 LTS recommended)
- **npm** (v9+)

---

### 2. Installation

#### Clone or Open Project Directory:
```bash
cd c:/Users/mutht/Downloads/Women
```

#### Install Backend Dependencies:
```bash
cd backend
npm install
```

#### Install Frontend Dependencies:
```bash
cd ../frontend
npm install
```

---

### 3. Environment Variables Configuration

The backend and frontend are already pre-configured with default development environments. You can customize them via `.env`:

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=safeher_super_secure_production_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=
ADMIN_DEFAULT_EMAIL=admin@safeher.ai
ADMIN_DEFAULT_PASSWORD=Admin@SafeHer2026!
```

#### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

### 4. Running the Backend Server

```bash
cd backend
npm run dev
```
*The backend starts at `http://localhost:5000` with WebSocket server at `ws://localhost:5000`.*

---

### 5. Running the Frontend Application

In a separate terminal:
```bash
cd frontend
npm run dev
```
*The frontend web app starts at `http://localhost:3000`.*

---

### 6. One-Click Windows Launch Script

You can also run both servers concurrently using the provided `start.bat`:
```bash
.\start.bat
```

---

### 7. Provisioning the First Administrator Securely

To create or reset administrator credentials interactively via CLI:
```bash
cd backend
npm run seed:admin
```
Follow the interactive prompts to set the email, name, and secure password.

#### Default Pre-Seeded Accounts:
- **Administrator**: `admin@safeher.ai` / `Admin@SafeHer2026!`
- **Demo User**: `sarah@safeher.ai` / `User@SafeHer2026!`

*(1-click quick-login buttons are also available on the `/login` screen).*

---

## 📱 End-to-End Demonstration Workflow

1. Open **`http://localhost:3000/login`** in Browser Window 1 and sign in as **Sarah (Demo User)**.
2. Open **`http://localhost:3000/login?role=admin`** in Browser Window 2 (or incognito) and sign in as **Administrator**.
3. In **Window 1 (User App)**:
   - Check the **Home** dashboard: notice live GPS coordinates, interactive map, and nearby safe havens.
   - Press and hold the red **"I'M IN DANGER"** SOS button for 2 seconds.
4. In **Window 2 (Admin Center)**:
   - Observe the immediate audio siren cue and real-time pop-up notification banner.
   - Open **Live Emergencies** (`/admin/live`): notice the active beacon on the live map.
   - Click **"1. Acknowledge Alarm"** $\rightarrow$ Observe status update synchronously reflected in Window 1.
   - Click **"2. Mark In Progress"** $\rightarrow$ Click **"3. Mark Resolved"**.
5. Test **Safe Navigation** (`/app/navigate`): Search a destination, compare the AI Safety Scores (e.g. 96/100 vs 68/100), and inspect street lighting densities.
6. Test **SafeAI Companion** (`/app/safe-ai`): Ask safety questions or click **"Simulate Fake Call"** to trigger a simulated incoming phone call.
7. Test **Safety Check-In** (`/app/checkin`): Set a 15-minute timer and test the "I Have Arrived Safely" confirmation.

---

## 🛡️ Important Safety Disclaimer

> **Safety Notice**: SafeHer AI is a safety-support and navigation system. AI safety scores and location information are estimates and do not guarantee personal safety or emergency response. In an immediate emergency, contact your local emergency services (911 / 112 / 100).
