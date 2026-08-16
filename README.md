# 🎓 PlacePrep — College Placement & Interview Experience Platform

A production-grade, portfolio-ready fullstack web platform for college students to share, search, and prepare for campus placement and internship interviews.

Built with **React 19, TypeScript, Node.js, Express, PostgreSQL, and Supabase**.

---

## 🌟 Key Platform Features

1. **Academic Authentication & RBAC:**
   - Supabase Auth integration with college email verification (`.edu`, `.ac.in`).
   - Role-Based Access Control: `STUDENT`, `MODERATOR`, `ADMIN`.
   - Anonymous submission toggle for privacy.

2. **Multi-Round Interview Reports:**
   - Chronological breakdown: Online Assessments (OA), Technical DSA rounds, System Design (LLD/HLD), Managerial, and HR/Behavioral.
   - Specific questions asked with candidate solution approaches and difficulty scores.
   - Compensation CTC (LPA), placement cycle year, and company selection outcome.

3. **Categorized Question Bank:**
   - Categorized by DSA, System Design, Operating Systems, DBMS/SQL, Computer Networks, and Behavioral STAR questions.
   - Filterable by difficulty, topic tags, and recruiting company.

4. **Community Collaboration:**
   - Single-click Upvotes and Bookmarks.
   - Threaded comments & discussions.
   - User reporting system for inappropriate/inaccurate content.

5. **Moderation Quality Center:**
   - Dedicated portal for student placement coordinators and moderators.
   - Review queue for approving or rejecting interview submissions with custom feedback reasons.
   - Administrative audit trail.

6. **Placement Analytics & Intelligence:**
   - Aggregate charts (Recharts): Average package (CTC), selection rate %, difficulty distributions, and most frequently tested technical topics.

---

## 🏗️ Architecture & Technology Stack

```
React (Vite SPA + Tailwind CSS + Lucide Icons)
       ↓ (HTTPS / REST JSON + Bearer JWT)
Express.js Layered Gateway (Helmet + CORS + Rate Limiter + Zod + RBAC)
       ↓
Controllers → Services → Repositories
       ↓
PostgreSQL Relational Database (via Supabase)
```

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, TanStack Query, Recharts |
| **Backend** | Node.js (v24 LTS), Express.js, TypeScript (Layered Monolith: Router → Controller → Service → Repository) |
| **Database & Auth** | PostgreSQL (Supabase), Prisma ORM, PgBouncer |
| **Validation & Security** | Zod schemas, Helmet, CORS, Express-Rate-Limit |

---

## 📁 Repository Monorepo Structure

```
placeprep/
├── apps/
│   ├── client/                  # React 19 + Vite Frontend SPA
│   │   ├── src/
│   │   │   ├── components/      # UI components, cards, modals, timeline
│   │   │   ├── context/         # AuthContext & Supabase session manager
│   │   │   ├── lib/             # Axios API client & Supabase instance
│   │   │   ├── pages/           # Home, Experiences, Questions, Companies, Analytics, Admin
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── .env.example
│   │
│   └── server/                  # Node.js + Express + Prisma API
│       ├── prisma/
│       │   └── schema.prisma    # PostgreSQL Relational Schema
│       ├── src/
│       │   ├── config/          # Zod environment variable loader
│       │   ├── controllers/     # HTTP Request/Response handlers
│       │   ├── middleware/      # Auth, Role RBAC, Zod Validate, Rate Limiting, Error Handling
│       │   ├── repositories/    # Database queries & transactions
│       │   ├── routes/v1/       # REST API resource routes
│       │   ├── services/        # Pure domain business logic & LRU caching
│       │   ├── db/seed.ts       # Database seeder (Top companies & sample experiences)
│       │   ├── app.ts           # Express setup
│       │   └── server.ts        # Entrypoint with graceful shutdown
│       └── .env.example
│
├── packages/
│   └── shared/                  # Shared TypeScript types, Enums, DTOs, and Zod schemas
└── package.json                 # Monorepo workspaces configuration
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js (v20+ LTS or v24)**
- **npm** or **pnpm**
- A free **Supabase** project (or local PostgreSQL database)

### 2. Clone & Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

**Backend (`apps/server/.env`):**
Copy `apps/server/.env.example` to `apps/server/.env`:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

**Frontend (`apps/client/.env`):**
Copy `apps/client/.env.example` to `apps/client/.env`:
```env
VITE_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
VITE_API_BASE_URL="http://localhost:5000/api/v1"
```

### 4. Push Database Schema & Seed Data
```bash
# Generate Prisma Client & push schema to PostgreSQL
npm run prisma:generate --workspace=apps/server
npm run prisma:migrate --workspace=apps/server

# Seed with top companies (Google, Amazon, etc.) and sample interview questions
npm run prisma:seed --workspace=apps/server
```

### 5. Run the Application
```bash
# Start both Frontend & Backend concurrently:
npm run dev

# Or run individually:
npm run dev:server   # Express API on http://localhost:5000
npm run dev:client   # React App on http://localhost:5173
```

---

## 🔒 Security & Backend Engineering Practices

- **Zero Hardcoded Secrets:** All credentials loaded dynamically through Zod validation.
- **SQL Injection Prevention:** 100% parameterized queries via Prisma ORM.
- **Rate Limiting:** Protects endpoints from abuse using `express-rate-limit`.
- **JWT & Role-Based Access Control:** Multi-tier permissions checking before executing service logic.
- **LRU In-Memory Caching:** High-traffic reference data cached to reduce database queries.
- **Graceful Shutdown:** Handles `SIGTERM`/`SIGINT` signals by cleanly closing active connections.
