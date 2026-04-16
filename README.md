# ClippingBD Studio

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Prisma-6.x-2d3748?style=for-the-badge" alt="Prisma">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

> Professional Image & Video Editing Services Platform - Enterprise-grade SaaS for clipping path, photo retouching, video editing, and AI-powered content solutions.

---

## Overview

ClippingBD Studio is a comprehensive full-stack web application built with Next.js 16, Supabase PostgreSQL, and Prisma ORM. It provides a complete platform for managing image editing services, order processing, task assignment, and content management with real-time updates.

### Key Highlights

- **10,000+** Clients Worldwide
- **50M+** Images Processed
- **120+** Countries Served
- **24/7** Operations

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16, React 18, TypeScript |
| **Backend** | Next.js API Routes, Prisma 6 |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | JWT with HTTP-only cookies |
| **Realtime** | Supabase Realtime Subscriptions |
| **Storage** | Supabase Storage + Local Fallback |
| **UI Components** | Radix UI + Shadcn/ui (57 components) |
| **Styling** | Tailwind CSS + Framer Motion |
| **3D Graphics** | React Three Fiber + Three.js |
| **State Management** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Deployment** | Vercel, Docker |

---

## Features

### Core Platform
- Multi-role access control (Admin, Developer, QA, Editor, Client, Guest)
- Complete order management with status tracking
- Task queue system for editors
- Quality assurance workflow
- Real-time chat and notifications
- Wallet and payment integration

### Content Management
- Dynamic CMS with 13+ content tables
- Real-time content updates via Supabase
- Hero sections, statistics, features, services
- Portfolio management with before/after images
- Team profiles and testimonials
- FAQ and pricing tiers

### Technical
- Server-side rendering with Next.js App Router
- Type-safe database operations with Prisma
- Responsive design for all breakpoints
- 3D interactive hero section
- API rate limiting and security headers

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/rbkhan007/ClippingBD-Studio.git
cd ClippingBD-Studio

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with demo data
npm run db:seed

# Seed CMS content
npm run db:seed:cms

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Configuration

### Development (.env)

```env
DATABASE_URL="file:./db/dev.db"
JWT_SECRET="your-dev-secret-key-min-32-characters"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000"
NODE_ENV="development"
```

### Production (.env)

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[user]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[user]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Auth
JWT_SECRET="your-production-jwt-secret-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# CORS
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
NODE_ENV="production"
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
| `npm run studio` | Open Prisma Studio |

---

## Demo Accounts

After seeding, use these credentials to test different roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clippingbd.com | password123 |
| Developer | developer@clippingbd.com | password123 |
| Client | client@example.com | password123 |
| Editor | editor1@clippingbd.com | password123 |
| QA | qa@clippingbd.com | password123 |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### CMS (Public)
- `GET /api/cms/hero` - Hero section
- `GET /api/cms/statistics` - Statistics
- `GET /api/cms/features` - Features
- `GET /api/cms/services` - Services
- `GET /api/cms/testimonials` - Testimonials
- `GET /api/cms/portfolio` - Portfolio items
- `GET /api/cms/team` - Team members

### Business
- `GET/POST /api/orders` - Orders
- `GET/POST /api/tasks` - Tasks
- `GET/POST /api/chat/*` - Chat
- `GET /api/notifications` - Notifications

### Admin
- `GET/POST /api/admin/*` - Admin operations

---

## Database Schema

### Core Models
- **User** - Multi-role user accounts
- **Service** - Available services with pricing
- **Order** - Client orders with tracking
- **Task** - Editor job assignments

### CMS Models
- **CmsHero**, **CmsStatistic**, **CmsFeature**
- **CmsService**, **CmsTestimonial**, **CmsPortfolioItem**
- **CmsTeamMember**, **CmsFaq**, **CmsPricingTier**

### Business Models
- **Transaction**, **SupportTicket**, **ChatRoom**
- **Asset**, **Notification**

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   └── [routes]           # Public pages
├── components/
│   ├── layout/            # Navbar, Footer, Sidebar
│   ├── ui/                # 57 Shadcn/ui components
│   ├── three/             # 3D scene components
│   └── zones/             # Feature zones by role
├── hooks/                 # Custom React hooks
│   └── realtime/          # Real-time subscriptions
├── lib/                   # Core utilities
├── store/                 # Zustand state stores
└── types/                 # TypeScript definitions
```

---

## Supabase Setup (Production)

1. **Database**: Enable Connection Pooling (port 6543)
2. **API**: Get project URL and anon key
3. **Realtime**: Enable on CMS tables
4. **Storage**: Create buckets (assets, avatars, deliverables)
5. **RLS**: Configure Row Level Security policies

---

## Build Status

| Check | Status |
|-------|--------|
| TypeScript | ✅ 0 errors |
| Production Build | ✅ 79 pages |
| API Routes | ✅ 50+ endpoints |
| Database | ✅ PostgreSQL + Prisma |
| Realtime | ✅ Supabase |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - Copyright 2024-2026 ClippingBD Studio

---

## Contact

| Method | Details |
|--------|---------|
| Email | info@clippingbd.com |
| WhatsApp | +880 1749 616724 |
| Location | Chirirbandar, Dinajpur, Bangladesh |

---

<p align="center">Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and React Three Fiber</p>

<p align="center">
  <a href="https://vercel.com">
    <img src="https://vercelbadge.vercel.app/api/rbkhan007/ClippingBD-Studio" alt="Deploy with Vercel">
  </a>
</p>