# Buganda Heritage

A full-stack web application for preserving and exploring Buganda family lineage — 55 clans, totems (emiziro), generational trees, and heritage visualizations.

## Features

- **Authentication** — Register, login, profile, forgot/reset password (email code)
- **Family records** — Add, edit, delete members with rich fields (parents, spouse, clan, oral history)
- **Photo uploads** — Upload ancestor portraits from your device (JPEG, PNG, WebP, GIF)
- **External parents** — Add a father or mother from outside your tree while linking the other parent
- **Family tree** — Generational, React Flow, and card views
- **Heritage Experience** (`/heritage`) — Totem tree, clan alliances, timeline, path to root, narratives, ancestor spotlight, generational rings
- **Heritage completeness** — Track how well your lineage is documented
- **55 Buganda clans** — Public clan directory with totems and clan stories
- **RBAC** — Admin, contributor, moderator, viewer roles with audit log
- **Search & export** — Advanced filters and CSV/JSON heritage export

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, React Flow, Chart.js |
| Backend | Node.js, Express 4, Multer |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT, bcrypt |

## Project structure

```
BUGANDA/
├── backend/
│   ├── prisma/           # Schema, migrations, seed data (55 clans)
│   ├── middleware/       # Photo upload
│   ├── models/           # Data access layer
│   ├── lib/              # Prisma client, heritage service, audit log
│   ├── uploads/          # Member photos (gitignored, created at runtime)
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/   # Forms, trees, heritage visualizations
│       ├── context/      # Auth and API state
│       └── pages/        # Home, dashboard, heritage, clans, etc.
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git

## Setup

### 1. Clone

```bash
git clone https://github.com/zacman-ug/BUGANDA.git
cd BUGANDA
```

### 2. Create the database

```bash
createdb -U postgres buganda_heritage
```

### 3. Backend

```bash
cd backend
copy .env.example .env    # Windows — use cp on macOS/Linux
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/buganda_heritage
JWT_SECRET=your-long-random-secret-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

Install, migrate, and seed:

```bash
npm install
npm run db:migrate
npm run db:seed
npm start
```

API: **http://localhost:5000**

> Without Gmail settings, password reset codes print in the backend console.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173**

### 5. First user

Register at `/register`. The **first registered user** becomes **admin**.

## Main routes

| Route | Description |
|-------|-------------|
| `/` | Home — overview and entry points |
| `/login`, `/register` | Authentication |
| `/dashboard` | Lineage home — add/edit members, search, completeness |
| `/heritage` | Heritage Experience — visualizations |
| `/family-tree` | Interactive tree views |
| `/clans` | Public Buganda clan directory |
| `/profile` | User profile |
| `/admin` | Admin dashboard (admin only) |

## Database (Prisma)

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Apply migrations (development) |
| `npm run db:push` | Push schema without migration file |
| `npm run db:seed` | Seed 55 clans + RBAC data |
| `npm run db:studio` | Visual database browser |

Schema changes: edit `backend/prisma/schema.prisma`, then run `npm run db:migrate`.

## API overview

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Current user profile |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password-request` | Request reset code |
| POST | `/api/auth/reset-password` | Reset password |

### Members & tree

| Method | Endpoint | Roles |
|--------|----------|-------|
| GET | `/api/individuals` | All |
| POST | `/api/individuals` | Admin, Contributor |
| PUT | `/api/individuals/:id` | Admin, Contributor, Moderator |
| DELETE | `/api/individuals/:id` | Admin |
| GET | `/api/individuals/:id/lineage` | All |
| GET | `/api/family-tree` | All |
| POST | `/api/uploads/photo` | Admin, Contributor, Moderator |

### Clans & marriages

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/clans` | Public |
| GET | `/api/clans/:id/members` | Authenticated |
| GET/POST/PUT/DELETE | `/api/marriages` | Role-based |

### Heritage

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/heritage/completeness` | Preservation score |
| GET | `/api/heritage/narrative/:id` | Heritage story |
| GET | `/api/heritage/path/:id` | Path to root ancestor |
| GET | `/api/heritage/alliances` | Cross-clan marriage map |
| GET | `/api/heritage/timeline` | Life events timeline |
| GET | `/api/heritage/spotlight` | Featured ancestor |

### Admin

| Method | Endpoint |
|--------|----------|
| GET/POST/DELETE | `/api/admin/users` |
| PUT | `/api/admin/users/:id/role` |
| GET | `/api/admin/roles` |
| GET | `/api/admin/permissions/:role` |
| GET | `/api/admin/audit-log` |

### Health

| Method | Endpoint |
|--------|----------|
| GET | `/health` |

## User roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access — users, records, audit log |
| **Contributor** | Create, edit, delete members |
| **Moderator** | Edit members, manage marriages |
| **Viewer** | Read-only |

## Deployment

**Frontend** (Netlify / Vercel): `npm run build` in `frontend/`, set `VITE_API_URL` to your API URL.

**Backend** (Fly.io / Render / Railway):

1. Provision PostgreSQL and set `DATABASE_URL`
2. On deploy: `npx prisma migrate deploy && npx prisma db seed`
3. Set `JWT_SECRET` and optional Gmail credentials
4. Ensure `backend/uploads/` persists (volume or object storage) for member photos

## Scripts

```bash
# Backend
npm start              # Start API
npm test               # Health check test
npm run db:migrate     # Migrations
npm run db:seed        # Seed data

# Frontend
npm run dev            # Dev server
npm run build          # Production build
npm run lint           # ESLint
```

## Security

- JWT on protected routes
- RBAC on write operations
- Rate limiting on auth endpoints
- Helmet security headers
- Input validation and spouse-link checks
- Strong `JWT_SECRET` required in production
- Never commit `.env` or uploaded photos

## License

ISC
