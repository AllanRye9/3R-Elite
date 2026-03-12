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
| File Storage | AWS S3 (optional) |

## Project Structure

```
├── frontend/              # Next.js 14 app (port 3000)
│   ├── app/               # App Router pages
│   ├── components/        # UI components
│   ├── context/           # React context (auth, country)
│   ├── lib/               # API client, types, utilities
│   └── Dockerfile
├── backend/               # Express API (port 5000)
│   ├── src/               # TypeScript source
│   ├── prisma/            # Schema + migrations
│   ├── docker-entrypoint.sh
│   └── Dockerfile
├── docker-compose.yml
├── .env.example           # Docker Compose env vars template
└── .gitignore
```

## Quick Start with Docker

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone and configure

```bash
git clone <repo-url>
cd 3R-Elite

# Create your local env file from the example
cp .env.example .env

# (Optional) Edit .env to customise JWT secrets and other settings.
# The defaults work for local development.
```

### 2. Start all services

```bash
docker-compose up -d
```

Docker Compose will start:
- **PostgreSQL** (port 5432) — database
- **Redis** (port 6379) — cache
- **Backend API** (port 5000) — Express API with automatic DB migration on startup
- **Frontend** (port 3000) — Next.js app

### 3. Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health check | http://localhost:5000/health |

### 4. Seed the database (optional)

To populate the database with sample categories and an admin user:

```bash
docker-compose exec backend npx prisma db seed
```

Default admin account: `admin@3relite.com` / password set via `ADMIN_PASSWORD` env var (defaults to `Admin123!` if unset).

### Stopping

```bash
docker-compose down          # Stop containers (data is preserved in volumes)
docker-compose down -v       # Stop containers AND delete all data volumes
```

## Local Development (without Docker)

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
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
# Create .env.local with the backend URL
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000' > .env.local
npm install
npm run dev
```

## Environment Variables

### Docker Compose (`.env` at repo root — copy from `.env.example`)

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `marketplace` | PostgreSQL superuser name. |
| `POSTGRES_PASSWORD` | `marketplace_secret` | PostgreSQL superuser password. |
| `POSTGRES_DB` | `marketplace_db` | PostgreSQL database name. |
| `JWT_SECRET` | *(insecure default)* | Signs JWT access tokens. **Change in production.** |
| `JWT_REFRESH_SECRET` | *(insecure default)* | Signs JWT refresh tokens. **Change in production.** |
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime. |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime. |
| `CORS_ORIGIN` | `http://localhost:3000` | Comma-separated list of allowed CORS origins for the backend (e.g. `https://app.example.com,https://app2.example.com`). |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Browser-accessible backend API URL (baked into the frontend image at build time). |
| `AWS_ACCESS_KEY_ID` | *(empty)* | AWS key for S3 image uploads (optional). |
| `AWS_SECRET_ACCESS_KEY` | *(empty)* | AWS secret for S3 image uploads (optional). |
| `AWS_REGION` | `us-east-1` | AWS region. |
| `AWS_S3_BUCKET` | *(empty)* | S3 bucket name. |

### Backend only (`backend/.env` — copy from `backend/.env.example`)

See `backend/.env.example` for the full list, including `DATABASE_URL`, `REDIS_URL`, `PORT`, `NODE_ENV`, etc.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (returns JWT + refresh token) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (invalidates refresh token) |
| GET | `/api/listings` | Browse listings (filters: q, category, location, country, price, condition, sort, page) |
| POST | `/api/listings` | Create listing (auth required) |
| GET | `/api/listings/:id` | Get listing detail |
| PUT | `/api/listings/:id` | Update listing (owner or admin) |
| POST | `/api/listings/:id/favorite` | Toggle favorite |
| GET | `/api/users/me` | My profile |
| GET | `/api/categories` | All categories |
| POST | `/api/messages` | Send a message |
| GET | `/api/admin/stats` | Admin dashboard stats |

## Features

- 🌍 **Multi-country**: UAE (AED) and Uganda (UGX) markets
- 🔍 **Search & Filters**: Full-text search, category, location, price range, condition
- 📱 **Responsive**: Mobile-first Tailwind CSS design
- 🔐 **Auth**: JWT with auto-refresh, role-based access (BUYER, SELLER, ADMIN)
- ❤️ **Favorites**: Save listings for later
- 💬 **Messaging**: Contact sellers
- 🚩 **Reports**: Report inappropriate listings
- ⭐ **Reviews**: Rate sellers
- 🛡️ **Security**: Helmet, rate limiting, CORS, bcrypt passwords
- 📊 **Admin Panel**: User management, listing moderation, reports
