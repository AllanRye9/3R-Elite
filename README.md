# 3R Elite — Modern Marketplace Platform

**3R Elite** is a full-stack, multi-country online marketplace built for buyers and sellers in the UAE and Uganda. It features real-time listings, admin moderation tools, image management, reviews, and a rich admin dashboard.

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
