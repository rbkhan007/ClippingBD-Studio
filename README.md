# ClippingBD Studio | Professional Image & Video Editing Services Platform

**ClippingBD Studio** is an enterprise-grade SaaS platform for professional image editing, clipping path services, video editing, and AI-powered content solutions. Trusted by 10,000+ clients worldwide with 50M+ images processed.

---

## Latest Updates

### v5.0 - Portfolio & Team Images Fixed (April 2026)

- **Portfolio Images** - Before/After images display in full ratio with `object-contain`
- **Team Page** - Profile images display in natural aspect ratio
- **Service Categories** - All service pages show separate category tabs
- **Clipping Path Page** - Shows Image Editing, Specialized, E-commerce categories
- **Navigation Fixed** - All links use `handleNavigate()` for SPA navigation
- **Clipboard Fallback** - Fixed `navigator.clipboard` errors in Dev console
- **Clean Repository** - Removed unused files, proper `.gitignore`, `.env.example`
- **Studio Live Demos** - Added 3 live demo templates on /studio page

---

## Why Choose ClippingBD Studio?

| Feature | Details |
|---------|---------|
| **Turnaround** | 24-hour standard delivery, 12-hour Express, 6-hour Nitro |
| **Quality Guarantee** | Unlimited revisions until you're satisfied |
| **Pricing** | Starting at $0.20/image for clipping path |
| **Volume Discounts** | Up to 57% off for bulk orders (1000+ images) |
| **24/7 Support** | Round-the-clock assistance via WhatsApp, chat, email |
| **Secure & Confidential** | NDA signing, encrypted file transfer |
| **Global Reach** | 120+ countries served |

---

## Contact Information

| Method | Details |
|--------|---------|
| **Email** | info@clippingbd.com |
| **WhatsApp** | +880 1749 616724 |
| **Phone** | +880 1749 616724 |
| **Location** | Chirirbandar, Dinajpur, Bangladesh |
| **Hours** | 24/7 Operations |

---

## Table of Contents

- [Why Choose ClippingBD Studio?](#why-choose-clippingbd-studio)
- [Services We Offer](#services-we-offer)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [npm Scripts](#npm-scripts)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Pages Overview](#pages-overview)
- [User Roles](#user-roles)
- [Demo Accounts](#demo-accounts)
- [Build Status](#build-status)
- [Roadmap](#roadmap)

---

## Services We Offer

### Image Editing Services
- **Clipping Path** - Hand-drawn vector paths for precise cutouts ($0.20/image)
- **Background Removal** - AI-powered background removal ($0.15/image)
- **Image Masking** - Advanced masking for complex images ($0.50/image)
- **Color Correction** - Professional color grading ($0.20/image)
- **Photo Retouching** - Professional retouching services ($0.35/image)
- **Ghost Mannequin** - E-commerce product photography ($1.00/image)

### Video Editing Services
- **Cinematic Editing** - Hollywood-quality edits ($22-45/video)
- **Motion Graphics** - Custom animations
- **Color Grading** - Professional color correction
- **VFX** - Visual effects

### AI Services
- **Auto Background Removal** - AI-powered batch processing
- **Smart Resize** - Intelligent image scaling
- **Auto Masking** - AI-assisted edge detection

### Web Development
- **Landing Pages** - $500 - $1,200
- **Custom Website** - $2,500+ (Next.js/React)
- **E-commerce Platform** - $3,500+
- **Monthly Support** - $200/month

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Role Access** | ADMIN, EDITOR, QA, CLIENT, DEVELOPER, GUEST roles |
| **Dynamic CMS** | Edit all homepage content via Prisma Studio |
| **3D Hero Section** | Interactive React Three Fiber scene |
| **Real-time Dashboard** | Live KPI tracking |
| **Wallet System** | Add funds, payments, transactions |
| **Order Management** | Full CRUD with status tracking |
| **Task Queue** | Editor job board, task claiming |
| **Review System** | Client reviews, ratings |
| **Support Tickets** | Help desk system |
| **File Upload** | Asset management |
| **Real-time Chat** | Messaging system |
| **Realtime Indicator** | Shows SQLite/Supabase connection status |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Auth** | Custom JWT with cookies |
| **Realtime** | Supabase Realtime subscriptions |
| **Storage** | Supabase Storage + Local fallback |
| **UI** | Radix UI + Shadcn/ui (57 components) |
| **Styling** | Tailwind CSS + Framer Motion |
| **3D Graphics** | React Three Fiber + Three.js |
| **State** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Payments** | Stripe + PayPal ready |

---

## Supabase Configuration (Production)

### Database Connection
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### Supabase Settings
1. Enable **Connection Pooling** on port 6543
2. Create service role key for admin operations
3. Enable **Realtime** on required tables:
   - `cms_hero`, `cms_statistics`, `cms_features`
   - `cms_services`, `cms_pricing_tiers`, `cms_testimonials`
   - `cms_portfolio_items`, `cms_team_members`, `cms_faqs`
4. Configure **Row Level Security (RLS)** policies
5. Set up **Storage** buckets: `assets`, `avatars`, `deliverables`, `source-files`

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/clippingbd/studio.git
cd studio

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

### Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint (needs migration to v9) |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed database with demo users and data |
| `npm run db:seed:cms` | Seed CMS tables with content |
| `npm run db:seed:static` | Seed static content data |
| `npm run studio` | Open Prisma Studio (port 5556) |

---

## Demo Accounts

After seeding, use these accounts to test different roles:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@clippingbd.com | password123 |
| **Developer** | dev@clippingbd.com | password123 |
| **Client** | client@example.com | password123 |
| **Editor** | editor1@clippingbd.com | password123 |
| **QA** | qa@clippingbd.com | password123 |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Public CMS API
- `GET /api/cms/hero` - Get hero section data
- `GET /api/cms/statistics` - Get statistics
- `GET /api/cms/features` - Get features
- `GET /api/cms/services` - Get services
- `GET /api/cms/testimonials` - Get testimonials
- `GET /api/cms/portfolio` - Get portfolio items
- `GET /api/cms/team` - Get team members
- `GET /api/cms/faqs` - Get FAQs
- `GET /api/cms/pricing-tiers` - Get pricing tiers
- `GET /api/cms/partners` - Get partners
- `GET /api/cms/social-links` - Get social links
- `GET /api/cms/contact-info` - Get contact info
- `GET /api/cms/settings` - Get global settings

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders` - Update order
- `DELETE /api/orders` - Delete order

### Admin
- `GET /api/admin/crud` - Generic CRUD operations
- `GET /api/admin/users` - List users
- `GET /api/admin/statistics` - Dashboard statistics
- `GET /api/admin/settings` - System settings

### Users (Admin)
- `GET /api/users` - List all users
- `PUT /api/users` - Update user role/status
- `DELETE /api/users` - Delete user

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Submit review

### Contact
- `POST /api/contact` - Submit contact form

---

## Database Models

The application uses Prisma with SQLite for local development. Key models include:

### Core Models
- **User** - Multi-role user accounts
- **Service** - Available services with pricing
- **Order** - Client orders with tracking
- **Task** - Editor job assignments
- **QAReview** - Quality assurance reviews

### CMS Models (Dynamic Content)
- **CmsHero** - Homepage hero section
- **CmsStatistic** - Statistics/counters
- **CmsFeature** - Feature highlights
- **CmsService** - Service listings
- **CmsTestimonial** - Customer testimonials
- **CmsPortfolioItem** - Portfolio before/after images
- **CmsTeamMember** - Team profiles
- **CmsFaq** - Frequently asked questions
- **CmsPricingTier** - Pricing plans
- **CmsPartner** - Partner/client logos
- **CmsSocialLink** - Social media links
- **CmsContactInfo** - Contact details
- **CmsGlobalSettings** - Site-wide settings

### Business Models
- **Transaction** - Financial records
- **SupportTicket** - Help desk tickets
- **ChatRoom/ChatMessage** - Messaging
- **Asset** - File uploads
- **Notification** - User notifications

---

## Pages Overview

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage with 3D hero, services, testimonials |
| `/services` | All services overview |
| `/services/clipping-path` | Clipping path service details |
| `/services/image` | Image editing services |
| `/services/video` | Video editing services |
| `/services/ai` | AI-powered services |
| `/services/web` | Web development services |
| `/pricing` | Pricing calculator & plans |
| `/portfolio` | Before/after gallery |
| `/team` | Team members |
| `/contact` | Contact form & locations |
| `/studio` | Public gallery |

### Auth Pages
| Route | Description |
|-------|-------------|
| `/auth` | Login/Signup |
| `/auth/forgot-password` | Password recovery |
| `/auth/reset-password` | Password reset |

### Client Dashboard
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview & stats |
| `/orders` | Order management |
| `/billing` | Wallet & payments |
| `/support` | Help tickets |

### Admin Dashboard
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Analytics overview |
| `/admin/users` | User CRM |
| `/admin/orders` | Order management |
| `/admin/cms` | Content management |
| `/admin/settings` | System configuration |

---

## User Roles & Features

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all features, CMS editing |
| **DEVELOPER** | Admin + system config, env vars, logs |
| **QA** | Review queue, approve/reject submissions |
| **EDITOR** | Job board, task completion, earnings |
| **CLIENT** | Orders, billing, support |
| **GUEST** | Public pages only |

---

## Build Status

| Check | Status |
|-------|--------|
| **TypeScript** | ✅ 0 errors |
| **Production Build** | ✅ 79 pages compiled |
| **Authentication** | ✅ All routes protected |
| **API Routes** | ✅ 50+ endpoints |
| **3D Scene** | ✅ React Three Fiber working |
| **CMS System** | ✅ 13 dynamic tables |
| **Database** | ✅ SQLite + Prisma |
| **Responsive Design** | ✅ All breakpoints |
| **Portfolio Images** | ✅ Full ratio with object-contain |
| **Team Images** | ✅ Natural aspect ratio display |
| **Service Tabs** | ✅ Separate category buttons |
| **Navigation** | ✅ SPA navigation with handleNavigate |
| **Clipboard** | ✅ Fallback for non-secure contexts |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (admin, auth, cms, etc.)
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Dashboard
│   ├── services/          # Service detail pages
│   └── [routes]           # Public pages
├── components/
│   ├── layout/            # Navbar, Footer, Sidebar
│   ├── providers/         # Theme, Redux providers
│   ├── three/             # 3D scene components
│   ├── ui/                # 57 Shadcn/ui components
│   └── zones/             # Feature zones by role
│       ├── admin/
│       ├── client/
│       ├── editor/
│       ├── public/        # Homepage, Services, etc.
│       └── qa/
├── config/                # Navigation config
├── data/                  # Static data files
├── hooks/                 # Custom React hooks
│   └── realtime/         # Real-time data hooks
├── lib/                   # Core libraries
│   ├── db.ts             # Prisma singleton
│   └── supabase/         # Supabase client
├── store/                 # Zustand stores
│   ├── app-store.ts     # Main state
│   └── app-settings.ts  # Theme settings
└── types/                 # TypeScript definitions
```

---

## Roadmap

### In Progress
- [x] Dynamic CMS system
- [x] 3D hero section
- [x] Real-time data hooks

### Planned Features
- [ ] Email notifications
- [ ] Stripe payment integration
- [ ] WebSocket real-time updates
- [ ] Mobile app (React Native)
- [ ] AI-powered auto-clipping
- [ ] Bulk order processing
- [ ] Team collaboration
- [ ] API rate limiting dashboard
- [ ] ESLint v9 migration

---

## License

MIT License - Copyright 2024-2026 ClippingBD Studio

---

## Team

| Member | Role |
|--------|------|
| **Belal Sarker** | Founder & Admin |
| **Rakibul Hasan** | Lead Developer & Designer |

---

**Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and React Three Fiber**
#   C l i p p i n g B D - S t u d i o  
 