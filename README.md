# Selah 🕊️

> **Selah** (Hebrew: *סֶלָה*) — A pause; a space to breathe, rest, and reflect.

Selah is a secure, AI-assisted spiritual support platform and prayer companion designed to carry heavy burdens. It bridges the gap between digital empathy and genuine human pastoral care by connecting users ("Seekers") with a real spiritual leader (the "Priestess") while providing an immediate, scripture-grounded AI conversational layer.

---

## ✨ Core Features (Phase 1 MVP)

*   **Secure Prayer Requests** — Submit named or fully anonymous requests tagged by struggle profiles (e.g., anxiety, grief, finance).
*   **Priestess Dashboard** — A live administrative queue tracking requests across structural stages (`Pending` → `Praying` → `Answered`).
*   **Empathetic AI Companion** — Chat interface that responds to distress with contextual empathy and 1–3 highly tailored, curated Bible verses.
*   **Safe Escalation Pathways** — Direct, low-friction integration to turn an active AI chat session into a formal prayer request or book a consultation appointment.
*   **Moderated Testimonies** — Public, read-only feed showcasing verified faith updates and answered prayers to foster communal hope.
*   **Crisis Detection Guardrails** — Automated semantic scanning intercepts safety emergencies and redirects users directly to critical assistance lines.

---

## 🛠️ Tech Stack

*   **Frontend & Logic**: React 18, TypeScript, Vite, Tailwind CSS
*   **Backend & Infrastructure**: Supabase (PostgreSQL, Realtime, and Edge Functions)
*   **Database Management**: PostgreSQL + Database Migrations via Supabase CLI
*   **AI Integration**: Anthropic Claude API (Orchestrated through secure serverless pipelines)

---

## 💾 Core Data Model Blueprint (PostgreSQL / Supabase)

*   `users`: Principal profiles synced with Supabase Auth handling access control and roles (`seeker`, `counselor`, `admin`).
*   `prayer_requests`: Structural ledger containing intent tags, anonymous flags, and workflow statuses protected by Row Level Security (RLS).
*   `verses`: Scriptural database indexed with explicit thematic metadata strings and full-text search capability (`anxiety`, `finances`).
*   `chat_sessions` & `chat_messages`: Auditable transactional message chains tracking AI-matched verses and runtime crisis flags.
*   `appointments`: Calendar slot allocations connecting seekers to designated ministerial care desks.
*   `devotions`: Dedicated daily content logs cleanly splitting human-written and AI-generated streams.

---

## 🚀 Local Development Setup

### 📦 Prerequisites
*   Node.js (v18+) & npm
*   Supabase CLI (Recommended for running migrations locally)

### 1. Project Initialization
```bash
# Clone the repository and move to directory
cd selah

# Clean installation of dependencies
npm install

# Start the Vite local development engine
npm run dev
```

### 2. Environment Variables Configuration
Never commit plaintext credentials to Git. Ensure your local workspace contains a `.env` file referencing your Supabase project keys:
```text
VITE_SUPABASE_URL=https://supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### 3. Running Database Migrations
Apply your local schemas directly to your active database profile using the tracking directory:
```bash
# Apply schemas found inside /supabase/migrations
supabase db push
```

---
