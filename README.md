# 3R-Elite Marketplace

A multi-country marketplace web application for UAE & Uganda — similar to Jiji, Dubizzle, and Jumia. Individuals and businesses can buy and sell goods and services.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js + Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + Refresh Tokens |
| Cache | Redis |
| File Storage | AWS S3 (via env vars) |

## Project Structure

```
├── frontend/              # Next.js 14 app (port 3000)
│   ├── railway.toml       # Railway deployment config
│   └── nixpacks.toml      # Nixpacks build config (Railway)
├── backend/               # Express API (port 5000)
│   ├── railway.toml       # Railway deployment config
│   └── nixpacks.toml      # Nixpacks build config (Railway)
├── render.yaml            # Render blueprint (backend + frontend + DB + Redis)
├── docker-compose.yml
├── .github/workflows/ci.yml
└── .gitignore
```

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database/JWT credentials
npm install
npx prisma migrate dev --name init
npx prisma db seed  # Seeds categories and admin user
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL to your backend URL
npm install
npm run dev
```

### Docker (all services)

```bash
# Set required env vars (JWT_SECRET, JWT_REFRESH_SECRET, etc.) then:
docker-compose up -d
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

### Render (one-click blueprint)

1. Push the repository to GitHub or GitLab.
2. In the Render dashboard select **New → Blueprint** and point it at this repository.  
   Render will automatically provision the backend, frontend, PostgreSQL database, and Redis instance defined in `render.yaml`.
3. After the first deploy, update two environment variables in the Render dashboard:
   - **backend** service → `CORS_ORIGIN`: set to the public URL of the frontend service (e.g. `https://3r-elite-frontend.onrender.com`).
   - **frontend** service → `NEXT_PUBLIC_API_URL`: set to the public URL of the backend service (e.g. `https://3r-elite-backend.onrender.com`), then trigger a redeploy.

### Railway

The `backend/railway.toml` and `backend/nixpacks.toml` files configure the backend for Railway.  
The `frontend/railway.toml` and `frontend/nixpacks.toml` files configure the frontend for Railway.

1. Create a new Railway project and add two services — one pointing at `backend/` and one at `frontend/`.
2. Provision a **Railway PostgreSQL** plugin and a **Railway Redis** plugin; Railway automatically injects `DATABASE_URL` and `REDIS_URL` into connected services.
3. Set the remaining required environment variables listed in the table below.
4. On Railway the private-network PostgreSQL URL (`DATABASE_PRIVATE_URL`) is available as a service variable; the backend will prefer it over `DATABASE_URL` for internal traffic.

## Environment Variables

### Backend (`backend/.env` — copy from `backend/.env.example`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`). Auto-injected on Render and Railway. |
| `DATABASE_PRIVATE_URL` | ⬜ Railway only | — | Railway internal private-network PostgreSQL URL (optional). When set, the backend uses this instead of `DATABASE_URL` for all runtime queries (faster, no egress cost). `DATABASE_URL` must still be set as a fallback for Prisma migrations. |
| `JWT_SECRET` | ✅ | — | Secret used to sign JWT access tokens. Use a long random string in production. |
| `JWT_REFRESH_SECRET` | ✅ | — | Secret used to sign JWT refresh tokens. Must differ from `JWT_SECRET`. |
| `JWT_EXPIRES_IN` | ⬜ | `15m` | Access token lifetime (e.g. `15m`, `1h`). |
| `JWT_REFRESH_EXPIRES_IN` | ⬜ | `7d` | Refresh token lifetime (e.g. `7d`, `30d`). |
| `REDIS_URL` | ⬜ | `redis://localhost:6379` | Redis connection URL. Auto-injected on Render and Railway. |
| `PORT` | ⬜ | `5000` | Port the Express server listens on. Auto-injected by Render (10000) and Railway. |
| `NODE_ENV` | ⬜ | `development` | Set to `production` on hosted platforms. |
| `CORS_ORIGIN` | ⬜ | `http://localhost:3000` | Allowed CORS origin. Set to the public frontend URL in production. |
| `RATE_LIMIT_WINDOW_MS` | ⬜ | `900000` | Rate-limit sliding window in milliseconds (default 15 min). |
| `RATE_LIMIT_MAX` | ⬜ | `100` | Maximum requests per IP per window. |
| `AWS_ACCESS_KEY_ID` | ⬜ | — | AWS IAM access key for S3 file uploads. |
| `AWS_SECRET_ACCESS_KEY` | ⬜ | — | AWS IAM secret key for S3 file uploads. |
| `AWS_REGION` | ⬜ | `us-east-1` | AWS region where the S3 bucket is hosted. |
| `AWS_S3_BUCKET` | ⬜ | — | Name of the S3 bucket used to store listing images. |
| `ADMIN_PASSWORD` | ✅ prod | — | Password for the seeded admin account (`admin@3relite.com`). **Must be set to a strong value before running `prisma db seed` in production.** Defaults to a weak fallback if unset (a warning is printed). |

### Frontend (`frontend/.env.local` — copy from `frontend/.env.example`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:5000` | Public URL of the backend API. Must be set to the deployed backend URL on hosted platforms. |

### Docker Compose (`.env` at repo root — optional overrides)

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `marketplace` | PostgreSQL superuser name. |
| `POSTGRES_PASSWORD` | `marketplace_secret` | PostgreSQL superuser password. |
| `POSTGRES_DB` | `marketplace_db` | PostgreSQL database name. |
| `JWT_SECRET` | — | Passed through to the backend container (required). |
| `JWT_REFRESH_SECRET` | — | Passed through to the backend container (required). |
| `JWT_EXPIRES_IN` | `15m` | Passed through to the backend container. |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Passed through to the backend container. |
| `CORS_ORIGIN` | `http://localhost:3000` | Passed through to the backend container. |
| `AWS_ACCESS_KEY_ID` | — | Passed through to the backend container. |
| `AWS_SECRET_ACCESS_KEY` | — | Passed through to the backend container. |
| `AWS_REGION` | `us-east-1` | Passed through to the backend container. |
| `AWS_S3_BUCKET` | — | Passed through to the backend container. |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Passed through to the backend container. |
| `RATE_LIMIT_MAX` | `100` | Passed through to the backend container. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Passed through to the frontend container. |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login (JWT + refresh token) |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/listings` | Browse listings (filters: q, category, location, country, price, condition, sort, page) |
| POST | `/api/listings` | Create listing (auth) |
| GET | `/api/listings/:id` | Get listing detail |
| PUT | `/api/listings/:id` | Update listing (owner/admin) |
| POST | `/api/listings/:id/favorite` | Toggle favorite |
| GET | `/api/users/me` | My profile |
| GET | `/api/categories` | All categories |
| POST | `/api/messages` | Send message |
| GET | `/api/admin/stats` | Admin dashboard stats |

## Features

- 🌍 **Multi-country**: UAE (AED) and Uganda (UGX) markets
- 🔍 **Search & Filters**: Full-text search, category, location, price range, condition
- 📱 **Responsive**: Mobile-first Tailwind CSS design
- 🔐 **Auth**: JWT with auto-refresh, role-based access (BUYER, SELLER, ADMIN)
- ❤️ **Favorites**: Save listings for later
- 💬 **Messaging**: Contact sellers + WhatsApp deep link
- 🚩 **Reports**: Report inappropriate listings
- ⭐ **Reviews**: Rate sellers
- 🛡️ **Security**: Helmet, rate limiting, CORS, bcrypt passwords
- 📊 **Admin Panel**: User management, listing moderation, reports
