# Buganda Heritage

A full-stack web application for preserving and exploring Buganda family lineage. Users can register, build family trees, record member details, and manage access through role-based permissions.

## Features

- **Authentication** — Register, login, profile management, and password reset via email code
- **Family records** — Add, edit, and delete members with rich profile fields
- **Family tree** — Interactive generational tree with click-to-view member details
- **Lineage tracking** — Parents, children, siblings, and spouse relationships
- **Search & filter** — Find members by name, occupation, or gender
- **Role-based access** — Admin, contributor, viewer, and moderator roles
- **Admin dashboard** — Create users, change roles, and manage accounts

### Member fields

| Field | Description |
|-------|-------------|
| Full name | Primary name (Erinnya Lijjuvu) |
| Alternative name | Nickname, clan name, or praise name |
| Gender | Male / Female |
| Clan (Omuziro) | Buganda clan affiliation |
| Father / Mother | Lineage links |
| Spouse | Bidirectional spouse linking |
| Date of birth / death | Life dates |
| Occupation | Role or profession |
| Residence | Village, county, or region |
| Bio | Oral history and notes |

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 4 |
| Database | MySQL |
| Auth | JWT, bcrypt |
| Security | Helmet, rate limiting, input validation |

## Project structure

```
BUGANDA/
├── backend/
│   ├── config/          # Database connection
│   ├── models/          # Data access layer
│   ├── utils/           # Validation helpers
│   ├── migrations/      # Database schema
│   ├── tests/           # API tests
│   └── server.js        # Express API entry point
├── frontend/
│   └── src/
│       ├── components/  # UI components
│       ├── context/     # Auth & state management
│       └── pages/       # Route pages
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://www.mysql.com/) 8+
- Git

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/zacman-ug/BUGANDA.git
cd BUGANDA
```

### 2. Create the database

```bash
mysql -u root -p < backend/migrations/001_full_schema.sql
```

This creates the `buganda_heritage` database with tables for users, clans, individuals, and marriages, plus sample clan data.

### 3. Configure the backend

```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=buganda_heritage

JWT_SECRET=your-long-random-secret-key

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

> **Note:** Email settings are optional for local development. Without them, password reset codes are printed in the backend console.

Install dependencies and start the API:

```bash
npm install
npm start
```

The API runs at **http://localhost:5000**.

### 4. Start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**.

### 5. First login

Register a new account at `/register`. The **first registered user** is automatically assigned the **admin** role.

## API endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password-request` | Request password reset code |
| POST | `/api/auth/reset-password` | Reset password with code |

### Family members

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/individuals` | List all members | All |
| POST | `/api/individuals` | Add a member | Admin, Contributor |
| PUT | `/api/individuals/:id` | Update a member | Admin, Contributor |
| DELETE | `/api/individuals/:id` | Delete a member | Admin, Contributor |
| GET | `/api/individuals/:id/lineage` | Get member lineage | All |
| GET | `/api/family-tree` | Get tree structure | All |
| GET | `/api/clans` | List clans | All |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create a user |
| PUT | `/api/admin/users/:id/role` | Change user role |
| DELETE | `/api/admin/users/:id` | Delete a user |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## User roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access — manage users and all family records |
| **Contributor** | Create, edit, and delete family members |
| **Viewer** | Read-only access to family records |
| **Moderator** | Reserved for future moderation features |

## Scripts

### Backend

```bash
npm start    # Start the API server
npm test     # Run health check test
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Security

- JWT authentication on all protected routes
- Role-based access control on write operations
- Rate limiting on authentication endpoints
- Helmet security headers
- Server-side input validation and incest checks for spouse linking
- Production requires a strong `JWT_SECRET` (server refuses to start with the default)

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request
