# ClippingBD Studio - Production Deployment Guide

## Pre-Deployment Checklist

### Environment Variables
Set these in your hosting platform (Vercel/Railway/DigitalOcean):

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Authentication (REQUIRED - Change in production!)
JWT_SECRET=<32+ random characters, e.g., openssl rand -base64 32>
NEXTAUTH_SECRET=<32+ random characters>

# CORS - Add your production domains
ALLOWED_ORIGINS=https://clippingbd.com,https://admin.clippingbd.com

# Node environment
NODE_ENV=production

# Optional: Payment Gateways (configure in Admin UI after deploy)
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# PAYPAL_CLIENT_ID=...
# PAYPAL_CLIENT_SECRET=...

# Optional: Email (for verification, notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

### Security Notes
- **CRITICAL**: Change `JWT_SECRET` before deploying. The default will cause app to crash in production.
- Use HTTPS only (automatic on Vercel)
- Enable database SSL connection (add `?sslmode=require` to DATABASE_URL)

---

## Build & Deploy

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy (automatic on push to main)

### Railway / DigitalOcean
```bash
# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Build
npm run build

# Start
npm start
```

---

## Post-Deployment Steps

### 1. Admin Account
Login with default admin (change password immediately):
```
Email: admin@clippingbd.com
Password: password123
```

### 2. Configure Payment Gateways
Navigate to **Admin → Payments**
- Add Stripe credentials (test mode first)
- Add PayPal credentials
- Enable desired gateways

### 3. Configure WhatsApp
Navigate to **Admin → Settings → Site Information**
- Enter WhatsApp number (E.164 format: +1234567890)
- Save - floating button appears automatically

### 4. Review CMS Content
Navigate to **Admin → CMS**
- Update hero section, services, features
- Add team members, testimonials, FAQs
- Configure pricing tiers

### 5. Set Up Webhooks (Stripe)
In Stripe Dashboard → Developers → Webhooks:
- Endpoint: `https://yourdomain.com/api/payments/webhooks/stripe`
- Events to subscribe:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `checkout.session.completed`

### 6. Test User Flows
- Client: Place test order
- Editor: Accept task, submit work
- QA: Review and approve/reject
- Admin: Manage users, settings, view analytics

---

## Monitoring & Maintenance

### Health Monitoring
- Health endpoint: `GET /api/health`
- Check response: `{ status: "healthy", ... }`
- Set up uptime monitoring (UptimeRobot, Pingdom)

### Database
- Prisma Studio: `npx prisma studio` (local only)
- Regular backups (Supabase/Postgres provider handles this)
- Connection pooling configured via Prisma

### Logs
- Vercel: Built-in log streaming
- Self-hosted: Use `pm2 logs` or journalctl

### Rate Limiting
- In-memory store (per instance)
- For multi-instance: Use Redis store (replace `Map` with Redis)
- Current limits are conservative - adjust in `src/lib/rate-limit.ts`

---

## Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Regenerate Prisma
npx prisma generate
```

### Database Errors
```bash
# Push schema changes
npx prisma db push

# Seed data (if needed)
npx prisma db seed
```

### Authentication Issues
- Verify `JWT_SECRET` is set and not default
- Check cookies are being set (`auth_session`)
- Verify middleware is running (file must be `src/middleware.ts`)

### Missing Routes
- All API routes are under `src/app/api/`
- Middleware protects routes based on `publicRoutes` array
- Check browser console for 404s

### WhatsApp Button Not Showing
- Admin must set number in CMS Settings
- Clear cache and reload
- Check console for fetch errors to `/api/cms/settings`

---

## Performance Tuning

### Caching
- Public pages: ISR with revalidate 60s-1h (configurable per route)
- Static assets: 1 year cache (immutable)
- API responses: Set `Cache-Control` headers

### Database
- Add indexes for frequently queried fields (already done)
- Use `select` to limit fields (already implemented)
- Connection pooling via Prisma

### Image Optimization
- Use `next/image` for all images
- Store images in Supabase Storage or S3
- Enable WebP conversion (Next.js does this automatically)

---

## Security Hardening

### Completed
- ✅ JWT secret validation (enforced)
- ✅ Rate limiting on sensitive endpoints
- ✅ File upload validation (type, size, extension)
- ✅ CORS configuration
- ✅ CSRF protection via SameSite cookies
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Role-based access control
- ✅ SQL injection prevention (Prisma parameterized)

### Recommended Additional
- [ ] Add reCAPTCHA to auth endpoints
- [ ] Implement email verification flow
- [ ] Add audit logging for admin actions
- [ ] Set up intrusion detection (fail2ban)
- [ ] Enable database SSL verification
- [ ] Implement backup rotation

---

## Support

For issues or questions:
- GitHub Issues: [your-repo]
- Email: support@clippingbd.com

---

Last Updated: 2026-04-27
