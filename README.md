<div align="center">

# 🛡️ AI Cyber Tracker

### AI-Powered Website Security Scanner & Risk Assessment Platform

**Passive security scanning · Deterministic risk scoring · AI-generated remediation roadmaps**

Know exactly what your website is quietly exposing — HTTPS misconfigurations, missing security headers, unsafe cookies, expiring TLS certificates, and more — turned into a clear, prioritized action plan.

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/API-Express_5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase_Postgres-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Security](https://img.shields.io/badge/SSRF-Hardened-critical)](#-security--privacy-by-design)

[Live Demo Preview](#) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

</div>

---

## 📖 Table of Contents

- [What is AI Cyber Tracker?](#-what-is-ai-cyber-tracker)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Security & Privacy by Design](#-security--privacy-by-design)
- [Responsible Use Disclaimer](#-responsible-use-disclaimer)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🔎 What is AI Cyber Tracker?

**AI Cyber Tracker** is a full-stack **website security scanner and risk assessment tool** that helps small teams and individual site owners understand their public-facing security posture — without needing a dedicated security team.

It combines three layers of intelligence into one workspace:

1. **A passive, SSRF-hardened scanner** that checks HTTPS enforcement, TLS certificate health, security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), cookie flags (`Secure`, `HttpOnly`, `SameSite`), and public metadata exposure.
2. **A deterministic risk-scoring engine** that combines those technical findings with owner-provided context (does the app handle payments? is admin MFA enabled?) to produce a reproducible, explainable security score — never a black box, never AI-invented numbers.
3. **An AI-generated remediation roadmap** (via OpenRouter) that turns findings into a plain-language "Today / This Week / This Month" action plan — built with strict output validation and a deterministic fallback, so the product never depends on an AI service being available.

Built as a **learn-by-building, full-stack portfolio project**, it doubles as a practical reference implementation for React 19, Express 5, Supabase Row Level Security, and safe server-side scanning patterns.

---

## ✨ Key Features

- 🔐 **Supabase Auth & Row Level Security** — every table enforces ownership at the database layer, not just in application code.
- 🌐 **Safe passive website scanner** — SSRF-protected URL validation, private/internal IP blocking, redirect re-validation, response size limits, and timeouts.
- 📋 **Adaptive 15–25 question security questionnaire** — conditional branching so owners only answer what's actually relevant to their site.
- 📊 **Deterministic risk engine** — the same findings and answers always produce the same score. No randomness, no AI guesswork in the number itself.
- 🤖 **AI-validated security reports** — OpenRouter-generated explanations that are checked against the real findings before being shown, with an automatic fallback report if AI is unavailable or invalid.
- 🕒 **Privacy-first data retention** — detailed assessment data automatically expires after 48 hours, with a manual "Delete Now" option and lightweight score history retained for trend comparisons.
- 📈 **Portfolio dashboard** — track multiple websites, compare scores over time, and see a prioritized "fix first" watchlist across your whole portfolio.
- 🔁 **Rescan & before/after comparison** — measure real improvement after fixing a flagged issue.
- ⚡ **Modern, responsive UI** — built with React 19, Vite, GSAP animations, and an interactive 3D globe visualization.

---

## ⚙️ How It Works

```
   React Frontend (Vite)
         │
         ▼
   Supabase Auth (identity & session)
         │
         ▼
   Express REST API
         │
         ├── Authorization · Validation · Rate Limiting
         ├── Safe Passive Scanner  ──────────────► Findings
         ├── Adaptive Questionnaire Engine ──────► Owner Context
         ├── Deterministic Risk Engine ◄───────── Findings + Context
         │         │
         │         ▼
         │   Security Score (0–100) + Risk Level
         │         │
         ├─────────┴────────────────────► Supabase PostgreSQL (Row Level Security)
         │
         └── Minimized Context Builder ──► OpenRouter AI ──► Validated Report / Fallback
```

Findings and owner context flow into the risk engine → deterministic score → optional AI explanation. If the AI layer fails, times out, or invents anything not present in the actual findings, the app silently falls back to a rule-based report — the score and scanner results are **never** dependent on a third-party AI service.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, GSAP, Recharts, Three.js |
| **Backend** | Node.js, Express 5 (ES Modules) |
| **Database & Auth** | Supabase (PostgreSQL, Auth, Row Level Security) |
| **AI Layer** | OpenRouter (configurable model, JSON-schema validated output) |
| **Testing** | Node's built-in test runner (`node --test`) |
| **Deployment** | Vite static build (frontend) + Node server (backend), Supabase-hosted Postgres |

---

## 🚀 Getting Started

### Prerequisites

- Node.js **20.6+** (uses `node --env-file`)
- A free [Supabase](https://supabase.com) project
- An [OpenRouter](https://openrouter.ai) API key (optional — the app works fully without one, using the deterministic fallback report)

### Installation

```bash
git clone https://github.com/ilhambatool/AI-Cyber-Tracker.git
cd AI-Cyber-Tracker
npm run install:all
```

### Configure environment variables

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Fill in your Supabase project URL and publishable key in both files (see [Environment Variables](#-environment-variables) below).

### Apply database migrations

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### Run the app

```bash
npm run server   # Terminal 1 — starts the Express API
npm run client   # Terminal 2 — starts the Vite dev server
```

The frontend runs at **http://localhost:5173**.

---

## 🔑 Environment Variables

| Variable | Location | Required | Description |
|---|---|---|---|
| `SUPABASE_URL` | `server/.env` | ✅ | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | `server/.env` | ✅ | Supabase publishable/anon key |
| `CLIENT_ORIGIN` | `server/.env` | ✅ | Allowed frontend origin for CORS |
| `OPENROUTER_API_KEY` | `server/.env` | ➖ | Enables AI-generated reports (falls back gracefully if omitted) |
| `OPENROUTER_MODEL` | `server/.env` | ➖ | Defaults to `openrouter/free` |
| `SCAN_RATE_LIMIT_MAX` | `server/.env` | ➖ | Max scans per user per time window (default: 3) |
| `VITE_SUPABASE_URL` | `client/.env` | ✅ | Supabase project URL for the frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `client/.env` | ✅ | Supabase publishable key for the frontend |
| `VITE_API_BASE_URL` | `client/.env` | ✅ | Base URL of the running Express API |

> ⚠️ Never expose `OPENROUTER_API_KEY` or any Supabase **service role** key in the frontend. Only the publishable/anon key belongs in `client/.env`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run install:all` | Installs dependencies for both client and server |
| `npm run client` | Starts the Vite frontend dev server |
| `npm run server` | Starts the Express backend with hot reload |
| `npm test` | Runs the backend test suite |
| `npm run scanner:test` | Runs the scanner against an authorized test URL |
| `npm run ai:test` | Tests the OpenRouter integration end-to-end |
| `npm --prefix client run build` | Builds the production frontend bundle |
| `npm --prefix client run lint` | Lints the frontend codebase |

---

## 📂 Project Structure

```
AI-Cyber-Tracker/
├── client/           # React 19 + Vite frontend
│   └── src/
│       ├── components/   # UI components (dashboard, scan, landing, auth)
│       ├── pages/        # Route-level pages
│       ├── context/      # Auth context / session state
│       └── services/     # API client layer
├── server/           # Express 5 REST API (ES Modules)
│   └── src/
│       ├── scanner/      # SSRF-safe passive scanner modules
│       ├── questionnaire/# Adaptive question engine
│       ├── risk/         # Deterministic scoring engine
│       ├── ai/           # OpenRouter client + validation + fallback
│       ├── middleware/   # Auth, ownership, rate limiting, validation
│       └── repositories/ # Supabase data access layer
├── supabase/
│   └── migrations/   # Versioned SQL migrations (schema, RLS policies)
├── shared/           # Shared API contract & finding code definitions
└── docs/             # Architecture, security, and scoring documentation
```

---

## 🔒 Security & Privacy by Design

Security isn't a feature bolted on afterward — it's the foundation of how this product is built:

- **Row Level Security (RLS):** Every database table enforces ownership at the Postgres level. Even a bug in the API code cannot leak another user's data.
- **SSRF protection:** All scan targets are validated against private/loopback/link-local IP ranges — including a second check after DNS resolution and on every redirect hop — before the server ever makes a request to them.
- **Least-privilege AI context:** The AI layer only ever receives a security score, risk level, and finding *codes* — never raw URLs, cookies, headers, or personal data.
- **Deterministic core:** The security score is calculated by transparent, testable, rule-based code. AI is used only for the explanatory report layer, and its output is validated before being shown — with an automatic fallback if it fails.
- **Data minimization:** Detailed scan evidence automatically expires within 48 hours. Users can permanently delete it sooner via "Delete Now."

---

## ⚖️ Responsible Use Disclaimer

AI Cyber Tracker is a **defensive, passive security assessment tool**. It performs no active exploitation, brute forcing, or intrusive testing.

**Only scan websites you own or have explicit, verifiable authorization to assess.** Scanning third-party websites without permission may violate computer misuse laws in your jurisdiction. This project does not claim that a high score means a website is "100% secure" — it is a starting point for improving your security posture, not a guarantee.

---

## 🗺️ Roadmap

- [ ] Real-time scan progress via WebSockets
- [ ] Scheduled recurring scans
- [ ] Team/organization accounts with shared portfolios
- [ ] Exportable PDF security reports
- [ ] Additional scanner checks (DNS security, subdomain enumeration)

Have an idea? [Open a feature request →](../../issues)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please keep pull requests focused and small — see `docs/` for architecture notes before making structural changes.

---

## 📄 License

This project does not yet have a license file. If you intend to reuse this code, please open an issue to request licensing terms, or add a `LICENSE` file (e.g., MIT) before publishing it as open source.

---

## 🙏 Acknowledgments

Built as part of a full-stack **learn-by-building internship program**, applying React, Node.js, Express, Supabase/PostgreSQL, Row Level Security, and safe web scanning practices in a real, production-shaped codebase rather than isolated tutorials.

**Created by:** Eman Amir Niazi & Ilham Batool

---

<div align="center">

If this project helped you understand full-stack security engineering, consider ⭐ starring the repo!

</div>