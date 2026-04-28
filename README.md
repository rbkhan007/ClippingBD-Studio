# ClippingBD Studio

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Prisma-6.x-2d3748?style=for-the-badge" alt="Prisma">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

> Complete Enterprise SAAS Platform for Image & Video Editing Services - Production Ready

---

## Overview

ClippingBD Studio is a fully-featured enterprise SAAS platform built with Next.js 16, Supabase PostgreSQL, and Prisma ORM. It provides a complete solution for image editing businesses with multi-role access, order management, task workflows, real-time updates, and comprehensive admin controls.

### Key Highlights

- **10,000+** Clients Worldwide
- **50M+** Images Processed  
- **120+** Countries Served
- **24/7** Operations
- **Production Ready** on Vercel (76 routes)
- **OAuth Ready** Google/GitHub login
- **All Roles Available** Client, Editor, QA on signup

---

## User Roles & Signup

### Signup Flow
| Role | Signup Status | Description |
|------|-------------|-------------|
| **CLIENT** | Auto-approved | Can login immediately after signup |
| **EDITOR** | Pending approval | Must wait for admin approval |
| **QA** | Pending approval | Must wait for admin approval |

### Role Permissions
| Role | Permissions |
|------|-------------|
| **ADMIN** | Full platform access, user management, CMS, payments, reports |
| **DEVELOPER** | Admin + system config, environment variables, logs, database |
| **QA** | Review queue, approve/reject submissions, quality control |
| **EDITOR** | Job board, task claiming, earnings tracking, profile |
| **CLIENT** | Orders, billing, support tickets, file uploads, reviews |
| **GUEST** | Public pages only, limited viewing |

### Order Management System
- Create orders with file uploads
- Order status tracking (PENDING → IN_PROGRESS → QA → COMPLETED)
- Priority levels (STANDARD, EXPRESS, NITRO)
- Automatic assignment to editors
- Delivery file management
- Order history and reordering

### Task Management
- Editor job board with claim system
- Task status workflow (PENDING → IN_PROGRESS → SUBMITTED → APPROVED)
- Deadline tracking with auto-escalation
- Performance metrics per editor
- Task rejection with reasons

### Quality Assurance (QA)
- Two-stage review process
- Approval/rejection with feedback
- Client revision requests
- QA metrics and statistics

### Financial System
- Wallet system for clients
- Transaction history
- Payment gateway integration (Stripe, PayPal ready)
- Order pricing with quantity discounts
- Payout management for editors

### Support System
- Ticket creation and tracking
- Priority levels (LOW, MEDIUM, HIGH, URGENT)
- Status workflow (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
- Admin response management
- Client support dashboard

### Real-time Features
- **Notifications** - Instant alerts for orders, tasks, messages
- **Chat** - Real-time messaging between users
- **CMS Updates** - Auto-refresh when content changes
- **Live Dashboard** - Real-time KPI updates
- **Connection Status** - Shows Supabase connection (dev only)

### Content Management (CMS)
- Hero section management
- Statistics/counters
- Feature highlights
- Service listings with pricing
- Testimonials with ratings
- Portfolio before/after images
- Team member profiles
- FAQs management
- Pricing tiers
- Partner logos
- Social media links
- Contact information
- Global settings

### API Endpoints (60+)
- Authentication: `/api/auth/*` (login, signup, logout, oauth, callback, forgot-password, reset-password)
- Users: `/api/users` (CRUD for admin)
- Orders: `/api/orders` (full management)
- Tasks: `/api/tasks` (assignment and tracking)
- Chat: `/api/chat/*` (rooms and messages)
- Notifications: `/api/notifications`
- Reviews: `/api/reviews`
- CMS: `/api/cms/*` (all content tables)
- Admin: `/api/admin/*` (comprehensive admin APIs)
- Public: `/api/services`, `/api/portfolio`, `/api/team`, `/api/contact`

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma 6 |
| **Auth** | JWT + HTTP-only cookies |
| **Realtime** | Supabase Realtime |
| **Storage** | Supabase Storage + Local fallback |
| **UI** | Radix UI + Shadcn/ui (57 components) |
| **Styling** | Tailwind CSS + Framer Motion |
| **3D** | React Three Fiber + Three.js |
| **State** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Payments** | Stripe + PayPal ready |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (production)

### Quick Setup
```bash
# Clone
git clone https://github.com/rbkhan007/ClippingBD-Studio.git
cd ClippingBD-Studio

# Install
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed demo data
npm run db:seed
npm run db:seed:cms

# Start development
npm run dev
```

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clippingbd.com | password123 |
| Developer | developer@clippingbd.com | password123 |
| Client | client@example.com | password123 |
| Editor | editor1@clippingbd.com | password123 |
| QA | qa@clippingbd.com | password123 |

---

## Environment Variables

### Production (.env)
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"

# Auth
JWT_SECRET="your-secure-jwt-secret-at-least-32-characters"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
NODE_ENV="production"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe (optional)
# STRIPE_SECRET_KEY=""
# STRIPE_PUBLISHABLE_KEY=""
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed demo data |
| `npm run db:seed:cms` | Seed CMS content |

---

## Database Schema (20+ Tables)

### Core Tables
- `User` - Multi-role user accounts
- `Service` - Available services
- `Order` - Client orders
- `Task` - Editor tasks
- `Transaction` - Financial records

### CMS Tables
- `CmsHero`, `CmsStatistic`, `CmsFeature`
- `CmsService`, `CmsTestimonial`, `CmsPortfolioItem`
- `CmsTeamMember`, `CmsFaq`, `CmsPricingTier`
- `CmsPartner`, `CmsSocialLink`, `CmsContactInfo`

### Business Tables
- `SupportTicket`, `ChatRoom`, `ChatMessage`
- `Notification`, `Asset`, `PaymentGateway`

---

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (50+ endpoints)
│   ├── auth/              # Auth pages
│   └── [routes]          # Public pages
├── components/
│   ├── layout/            # Navbar, Footer, Sidebar, AdminSidebar
│   ├── ui/                # 57 Shadcn/ui components
│   ├── three/             # 3D scene
│   └── zones/             # Feature zones by role
│       ├── admin/         # AdminDashboard, AdminUsers, AdminCMS
│       ├── client/        # Client dashboard
│       ├── editor/        # Editor job board
│       ├── qa/            # QA review queue
│       └── public/        # HomePage, Services, Portfolio
├── hooks/
│   └── realtime/         # Realtime subscriptions
├── lib/                   # Utilities
│   ├── db.ts             # Prisma client
│   └── supabase/          # Supabase client
├── store/                 # Zustand stores
└── types/                 # TypeScript definitions
```

---

## Supabase Setup (Production)

1. **Create Project** - supabase.com
2. **Database** - Enable Connection Pooling (port 6543)
3. **API** - Get URL and anon key
4. **Realtime** - Enable on tables:
   - `notifications`
   - `chat_messages`
   - `orders`, `tasks`
   - All `cms_*` tables
5. **Storage** - Create buckets:
   - `assets` - General files
   - `avatars` - User avatars
   - `deliverables` - Completed work
   - `source-files` - Original uploads
6. **RLS** - Configure Row Level Security

### OAuth Setup (Google/GitHub)
1. Go to **Supabase Dashboard → Authentication → Providers**
2. Enable **Google** or **GitHub**
3. Enter your OAuth credentials:
   - Google: Client ID and Client Secret from Google Cloud Console
   - GitHub: Client ID and Client Secret from GitHub Developer Settings
4. Add redirect URL in OAuth provider:
   - `https://[your-project].supabase.com/auth/v1/callback`
5. Add environment variables:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

---

## Vercel Deployment

1. Import project on Vercel
2. Add environment variables (see below)
3. Deploy

**IMPORTANT: Environment Variables on Vercel**

The `.env` file is NOT automatically read on Vercel. You must add these manually in Vercel Project Settings → Environment Variables:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres
JWT_SECRET=your-secure-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://clippingbdstudio.vercel.app
NEXT_PUBLIC_APP_URL=https://clippingbdstudio.vercel.app
ALLOWED_ORIGINS=https://clippingbdstudio.vercel.app,https://www.clippingbdstudio.com
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth Providers (optional - enable in Supabase Dashboard)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
```

**Also Enable Supabase Realtime:**
- Supabase Dashboard → Database → Realtime
- Enable for: `chat_message`, `chat_room`, `chat_room_participant`, `notification`, `orders`, `tasks`, all `cms_*` tables

**Build Output:** 76 routes compiled successfully

---

## Build Status

| Check | Status |
|-------|--------|
| TypeScript | ✅ 0 errors |
| Production Build | ✅ 76 pages |
| API Routes | ✅ 60+ endpoints |
| Database | ✅ PostgreSQL + Prisma |
| Realtime | ✅ Supabase |
| Auth | ✅ JWT + Cookies + OAuth |
| Role Signup | ✅ CLIENT auto-approved, EDITOR/QA pending |
| Admin CRM | ✅ Full management |
| CMS | ✅ 13 tables |

---

## Recent Updates

```
2ce7121 fix: properly handle all user roles in signup flow
e464388 config: update .env files with production credentials
6efa7e2 docs: add .env.example template for easy Vercel deployment
954df91 fix: improve OAuth callback error handling
e7fc27e fix: auto-approve new clients on signup (ACTIVE status)
40e90b1 feat: add Supabase OAuth for Google/GitHub sign-in buttons
d48f0e7 perf: optimize CMS data loading with parallel fetch, caching
09bba86 fix: theme toggle now uses next-themes properly, default dark
```

---

## Security Features

- JWT authentication with HTTP-only cookies
- Role-based access control (RBAC)
- API rate limiting
- CORS configuration
- Security headers (X-Frame-Options, CSP, etc.)
- Password hashing with bcrypt
- SQL injection protection via Prisma

---

## Roadmap

- [x] Multi-role user management
- [x] Order & task workflows
- [x] Real-time notifications
- [x] CMS with 13+ tables
- [x] Wallet & transactions
- [x] Support tickets
- [x] Admin dashboard with CRM
- [-] Email notifications (SendGrid/Resend) - API ready, needs integration
- [-] Stripe payment integration - Webhooks ready, needs keys

---

## License

MIT License - Copyright 2024-2026 ClippingBD Studio

---

## Support

- Email: info@clippingbd.com
- WhatsApp: +880 1749 616724

---

<p align="center">Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and React Three Fiber</p>

<p align="center">
  <a href="https://vercel.com">
    <img src="https://vercelbadge.vercel.app/api/rbkhan007/ClippingBD-Studio" alt="Deploy with Vercel">
  </a>
</p>