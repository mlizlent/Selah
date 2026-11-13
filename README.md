# Selah 🕊️

> **Selah** (Hebrew: *סֶלָה*) — A pause; a space to breathe, rest, and reflect.

Selah is a secure, AI-assisted spiritual support platform and prayer companion designed to carry heavy burdens. It bridges the gap between digital empathy and genuine human pastoral care by connecting users ("Seekers") with a real spiritual leader (the "Priestess") while providing an immediate, scripture-grounded AI conversational layer.

---

## Project Structure

- `frontend/` — React + Vite + TypeScript client (`src/`, configs, `index.html`)
- `backend/` — Express API server (`server.ts`), server modules (`src/server`, `src/middleware`), and PostgreSQL schema (`db/schema.sql`)
- `.env` / `.env.example` — environment configuration (read from repo root)

---

## Tech Stack

*   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (`frontend/`)
*   **Backend**: Node.js, Express (`backend/`)
*   **Database**: PostgreSQL (`pg`) — schema in `backend/db/schema.sql`
*   **AI Integration**: Groq chat completions for the companion

---

## Local Development Setup

### Prerequisites
*   Node.js (v18+) & npm
*   PostgreSQL (local or hosted)

### 1. Install
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the project root (see `.env.example`):

```text
DATABASE_URL=postgresql://user:password@localhost:5432/selah
SESSION_SECRET=change-me-to-a-long-random-secret
ADMIN_EMAIL_SHIELD=admin@example.com
GROQ_API_KEY=your-groq-api-key
# Optional
# DATABASE_SSL=true
# DEV_ORIGIN=http://localhost:5173
```

`ADMIN_EMAIL_SHIELD` marks that account as admin/priestess on login/signup.

### 3. Database Schema
Apply the plain-Postgres schema:

```bash
psql "$DATABASE_URL" -f backend/db/schema.sql
```

This creates `users`, `profiles`, `prayer_requests`, `testimonies`, `appointments`, and `priestess_posts`.

### 4. Run
Start the API server and Vite dev server together (from repo root):

```bash
npm run dev
```

- API server: `http://localhost:5178` (`backend/server.ts`)
- Vite app: `http://localhost:5173` (proxies `/api` to the server)

Run separately if preferred:

```bash
npm run dev:api       # backend
npm run dev:frontend  # frontend (Vite)
```

The companion calls `/api/companion` (proxied in dev), so the API server must be running while using the companion.

### 5. Build / Start
```bash
npm run build
npm start
```

`npm start` runs the Express server (`tsx backend/server.ts`), which serves `frontend/dist/` when present.

---

## Notes
- Auth uses server-side sessions (HTTP-only cookie) backed by the `users`/`profiles` tables; passwords are hashed with `scrypt`.
- Public flows: submit prayer requests/appointments/testimonies and read approved testimonies and posts. Priestess/admin actions are enforced server-side.
- Password reset email delivery is not configured in this setup; `/api/auth/forgot-password` is a placeholder response.
