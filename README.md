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
├── frontend/          # Next.js 14 app (port 3000)
├── backend/           # Express API (port 5000)
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
npm install
# Create frontend/.env.local with: NEXT_PUBLIC_API_URL=http://localhost:5000
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
- Health check: http://localhost:5000/health

## Environment Variables

### Backend (`backend/.env`)
See `backend/.env.example` for all required variables. Key vars:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Token signing secrets
- `REDIS_URL` — Redis connection URL
- `AWS_*` — AWS S3 credentials for file uploads

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

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
