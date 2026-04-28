# ClippingBD Studio - Developer Guide

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (Supabase)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/clippingbd-studio.git
cd clippingbd-studio

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed initial data
npm run db:seed:cms
npm run db:seed:static
```

### Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma studio        # Open Prisma GUI
npx prisma migrate dev # Run migrations
npm run db:seed:cms    # Seed CMS data
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed-cms.ts     # CMS seed data
│   └── seed-static-data.ts
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── api/       # API routes
│   │   └── [...zones]/ # Page zones
│   ├── components/    # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities
│   └── data/         # Static data
└── public/           # Static assets
```

## API Routes

### Public Routes
- `/api/services` - List services
- `/api/portfolio` - List portfolio items
- `/api/cms/*` - CMS content (read)
- `/api/contact` - Submit contact

### Protected Routes
- `/api/orders` - Order CRUD
- `/api/tasks` - Task management
- `/api/transactions` - Wallet transactions

### Admin Routes
- `/api/admin/*` - All admin CRUD
- `/api/admin/cms/*` - CMS management

## Database

### Tables
- `users` - User accounts
- `orders` - Client orders
- `tasks` - Editor tasks
- `transactions` - Wallet transactions
- `cms_*` - CMS content tables

### Seed Data
Run seeds to populate initial CMS content:
```bash
npm run db:seed:cms
```

## Deployment

### Vercel
1. Connect repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy branch `main`

### Supabase
- Database hosted on Supabase
- Realtime subscriptions enabled
- Storage buckets configured

## Common Issues

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Prisma Errors
```bash
# Regenerate client
npx prisma generate
npx prisma db push
```

### Auth Errors
- Check JWT_SECRET in .env
- Verify NEXTAUTH_URL matches deployment URL