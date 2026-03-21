# 3R Elite — Modern Marketplace Platform

**3R Elite** is a full-stack, multi-country online marketplace connecting buyers and sellers across the UAE, Uganda, Kenya, and China. It features real-time listings, admin moderation tools, Cloudflare image management, Resend transactional emails, product reviews, and a rich admin dashboard.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (via Prisma ORM) |
| **Auth** | JWT (access + refresh tokens) |
| **CDN** | Cloudflare Images → Cloudinary → local `/uploads` fallback |
| **Email** | Resend → SMTP → log-only fallback |
| **Containerization** | Docker / Docker Compose |

---

## 🚀 Features

### For Users
- **Browse & Search** listings by keyword, category, and country (UAE / Uganda / Kenya / China)
- **Post Listings** with multiple images and rich product details
- **Image Upload Flow** — images are uploaded to the server, queued for admin review, then pushed to Cloudflare CDN upon approval
- **Favorites / Saved Items** — bookmark listings for later
- **Messaging** — chat directly with sellers
- **Conversation Threads** — open full listing-specific message threads at `/messages/[listingId]/[userId]`
- **Profile Management** — avatar, bio, and listing history
- **Product Reviews** — leave ratings and reviews on listings
- **Listing Reports** — submit moderation reports from a dedicated frontend form at `/reports/create`

### Shared Navigation
- **Global Category Bar** — the category pill bar is rendered from the shared header across the app, including the home page
- **Active Gold State** — the selected category is highlighted with a gold background and active underline for clearer navigation feedback

### For Admins
- **Admin Dashboard** — real-time KPI cards, listing & user stats, approval rate
- **Content Moderation** — approve, reject, or feature listings with placement options (Featured Deal / Latest Collections)
- **Image Moderation** — review uploaded images before they go live; approved images are uploaded to Cloudflare CDN and the listing is updated automatically
- **User Management** — search, view, and manage all accounts
- **Reviews Management** — approve or reject product reviews
- **Reports** — handle flagged listings and user reports
- **Categories** — create and manage product categories
- **Analytics** — platform-wide usage metrics
- **Site Settings** — maintenance mode, registration toggle, defaults

### Email Notifications (via Resend or SMTP)
- **Welcome email** — sent automatically when a new user registers
- **Password reset email** — sent when a reset is requested
- **Image approved email** — sent to the seller when their uploaded image passes moderation
- **Image rejected email** — sent to the seller when their image is rejected, including the rejection reason

---

## 🖼 Image Upload & Moderation Flow

```
User uploads image
      │
      ▼
POST /api/upload
  → Saved to uploads/temp/<uuid>.ext
  → ProductImage record created (status: PENDING)
  → Returns { imageIds, urls }
      │
      ▼
User submits listing with imageIds
  → Listing created (status: PENDING)
  → Temp preview URLs stored in listing.images
      │
      ▼
Admin reviews image at /admin/images
      │
   ┌──┴──┐
Approve  Reject
   │        │
   │        └─ Temp file deleted
   │          Image marked REJECTED
   │          Temp URL removed from listing.images
   │          Seller notified by email
   │
   └─ Image uploaded to Cloudflare Images (CDN)
     Temp file deleted
     Image marked APPROVED with cdnUrl
     listing.images updated: temp URL → CDN URL
     Seller notified by email
```

---

## 🔐 Admin Access

There are two ways to access the admin panel:

### Option 1 — Admin Login Portal (`/admin/auth/login`)
Go directly to `/admin/auth/login` and sign in with an administrator account. Only users with the `ADMIN` role can log in through this portal.

### Option 2 — Normal Login (`/auth/login`)
Log in through the standard login page. If your account has the `ADMIN` role, you will be automatically redirected to the admin dashboard (`/admin`), and your profile in the site header will display an **ADMIN** badge.

### Creating an Admin Account
Admin accounts are created at `/admin/auth/register` using a secret key (`ADMIN_SECRET`) set in the backend environment variables. Contact the system administrator for this key.

---

## 🗂 Project Structure

```
3R-Elite/
├── frontend/               # Next.js 14 frontend
│   ├── app/
│   │   ├── admin/          # Admin panel (dashboard, users, listings, images, reviews, etc.)
│   │   ├── auth/           # User login & registration
│   │   ├── listings/       # Listing browse, detail, create pages
│   │   ├── messages/       # In-app messaging
│   │   └── profile/        # User profile & favorites
│   ├── components/
│   │   ├── layout/         # Header, CategoryBar, Footer
│   │   ├── listings/       # Listing grid, filter sidebar, search bar
│   │   ├── admin/          # Admin-specific components
│   │   └── ui/             # Shared UI components
│   └── context/            # Auth, Country, Cart context providers
│
├── backend/                # Express.js API
│   ├── src/
│   │   ├── routes/         # API route handlers (auth, listings, admin, upload, …)
│   │   ├── middleware/      # Auth (JWT), error handler (Prisma-aware)
│   │   └── utils/          # Prisma, JWT, CDN (Cloudflare/Cloudinary), Email (Resend/SMTP), logger
│   └── prisma/             # Database schema & migrations
│
└── docker-compose.yml      # Full-stack Docker setup
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use Docker Compose)
- (Optional) Cloudflare Images account for CDN image hosting
- (Optional) Resend account for transactional emails

### 1. Clone the repository
```bash
git clone https://github.com/AllanRye9/3R-Elite.git
cd 3R-Elite
```

### 2. Configure environment variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/3relite

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

ADMIN_SECRET=your_admin_registration_secret
ADMIN_PASSWORD=your_admin_password

PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# ── CDN (Cloudflare Images is preferred; Cloudinary is the fallback) ──────────
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_IMAGES_API_TOKEN=your_cloudflare_images_api_token

# Cloudinary fallback (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Email (Resend is preferred; SMTP is the fallback) ─────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=no-reply@yourdomain.com

# SMTP fallback (optional)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=support@yourdomain.com

# Frontend URL (used in email links)
FRONTEND_URL=https://yourdomain.com
```

**Provider priority (backend):**
| Service | Priority |
|---|---|
| Image upload | Cloudflare Images → Cloudinary → local `/uploads` |
| Email delivery | Resend → SMTP → log-only (non-blocking) |

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start with Docker Compose (recommended)
```bash
docker-compose up --build
```
This starts PostgreSQL, the backend API, and the Next.js frontend together.

### 4. Manual setup

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Development

```bash
# Quick full checks (backend + frontend)
npm run check

# Type-check the backend
cd backend && npx tsc --noEmit

# Build the frontend
cd frontend && npx next build
```

---

## 🔗 API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/listings` | List/search listings |
| POST | `/api/listings` | Create a listing |
| GET | `/api/listings/:id` | Get listing details |
| POST | `/api/upload` | Upload images (returns imageIds) |
| GET | `/api/admin/images` | List pending images (admin) |
| PUT | `/api/admin/images/:id/approve` | Approve image → CDN upload (admin) |
| PUT | `/api/admin/images/:id/reject` | Reject image (admin) |
| GET | `/api/admin/stats` | Dashboard statistics (admin) |
| GET | `/api/stats` | Public platform stats |
| GET | `/health` | Health check |

---

## 📄 License

MIT © 3R Elite


---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (via Prisma ORM) |
| **Auth** | JWT (access + refresh tokens) |
| **CDN** | Cloudflare Images / Cloudinary (with local fallback) |
| **Email** | Resend / SMTP (with log-only fallback) |
| **Containerization** | Docker / Docker Compose |

---

## 🚀 Features

### For Users
- **Browse & Search** listings by keyword, category, and country (UAE / Uganda)
- **Post Listings** with multiple images and rich product details
- **Favorites / Saved Items** — bookmark listings for later
- **Messaging** — chat directly with sellers
- **Conversation Threads** — open full listing-specific message threads at `/messages/[listingId]/[userId]`
- **Profile Management** — avatar, bio, and listing history
- **Listing Reports** — submit moderation reports from a dedicated frontend form at `/reports/create`

### Shared Navigation
- **Global Category Bar** — the category pill bar is rendered from the shared header across the app, including the home page
- **Active Gold State** — the selected category is highlighted with a gold background and active underline for clearer navigation feedback

### For Admins
- **Admin Dashboard** — real-time KPI cards, listing & user stats, approval rate
- **Content Moderation** — approve, reject, or feature listings
- **Image Moderation** — review uploaded images before they go live
- **User Management** — search, view, and manage all accounts
- **Reviews Management** — approve or reject product reviews
- **Reports** — handle flagged listings and user reports
- **Categories** — create and manage product categories
- **Analytics** — platform-wide usage metrics
- **Site Settings** — maintenance mode, registration toggle, defaults

---

## 🔐 Admin Access

There are two ways to access the admin panel:

### Option 1 — Admin Login Portal (`/admin/auth/login`)
Go directly to `/admin/auth/login` and sign in with an administrator account. Only users with the `ADMIN` role can log in through this portal.

### Option 2 — Normal Login (`/auth/login`)
Log in through the standard login page. If your account has the `ADMIN` role, you will be automatically redirected to the admin dashboard (`/admin`), and your profile in the site header will display an **ADMIN** badge.

### Creating an Admin Account
Admin accounts are created at `/admin/auth/register` using a secret key (`ADMIN_SECRET`) set in the backend environment variables. Contact the system administrator for this key.

---

## 🗂 Project Structure

```
3R-Elite/
├── frontend/               # Next.js 14 frontend
│   ├── app/
│   │   ├── admin/          # Admin panel (dashboard, users, listings, etc.)
│   │   ├── auth/           # User login & registration
│   │   ├── listings/       # Listing browse, detail, create pages
│   │   ├── messages/       # In-app messaging
│   │   └── profile/        # User profile & favorites
│   ├── components/
│   │   ├── layout/         # Header, CategoryBar
│   │   ├── admin/          # Admin-specific components
│   │   └── ui/             # Shared UI components
│   └── context/            # Auth & Country context providers
│
├── backend/                # Express.js API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   └── utils/          # Prisma, JWT, CDN, logger
│   └── prisma/             # Database schema & migrations
│
└── docker-compose.yml      # Full-stack Docker setup
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use Docker Compose)
- (Optional) Cloudinary account for image hosting

### 1. Clone the repository
```bash
git clone https://github.com/AllanRye9/3R-Elite.git
cd 3R-Elite
```

### 2. Configure environment variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/3relite
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
ADMIN_SECRET=your_admin_registration_secret

# CDN providers (Cloudflare Images is used first when configured)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_IMAGES_API_TOKEN=your_cloudflare_images_api_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email providers (Resend is used first when configured)
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=no-reply@yourdomain.com
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=support@yourdomain.com

CORS_ORIGIN=http://localhost:3000
PORT=4000
```

Provider order in backend:
- Image upload: Cloudflare Images → Cloudinary → local `/uploads`
- Email delivery: Resend → SMTP → log-only (non-blocking)

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Start with Docker Compose (recommended)
```bash
docker-compose up --build
```
This starts PostgreSQL, the backend API, and the Next.js frontend together.

### 4. Manual setup

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Development

```bash
# Quick full checks (backend + frontend)
npm run check

# Type-check the backend
cd backend && npx tsc --noEmit

# Build the frontend
cd frontend && npx next build
```

---

## 📄 License

MIT © 3R Elite
