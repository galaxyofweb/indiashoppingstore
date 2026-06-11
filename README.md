# 🛍️ IndiaShoppingStore.com

**Production-ready luxury e-commerce platform** built with Next.js 14, TypeScript, Tailwind CSS, PostgreSQL & Prisma.

---

## 🗂️ Project Structure

```
indiashopping/
├── prisma/
│   └── schema.prisma          # Full DB schema (18+ models)
├── scripts/
│   └── seed.ts                # DB seed with sample data
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── layout.tsx         # Root layout — fonts, SEO, providers
│   │   ├── page.tsx           # Homepage
│   │   ├── loading.tsx        # Global loading skeleton
│   │   ├── not-found.tsx      # 404 page
│   │   ├── sitemap.ts         # Dynamic sitemap (100K+ products)
│   │   ├── robots.ts          # SEO robots config
│   │   ├── login/             # Login — email, OTP, social
│   │   ├── register/          # Registration with referral
│   │   ├── shop/              # Shop — category, filter, search
│   │   ├── products/[slug]/   # Product detail page
│   │   ├── checkout/          # One-page checkout + success
│   │   ├── account/           # Orders, wishlist, profile
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # All API routes
│   │       ├── auth/          # NextAuth, register, OTP
│   │       ├── products/      # Product CRUD + listing
│   │       ├── search/        # AI-powered search
│   │       ├── orders/        # Order management
│   │       ├── payments/      # Razorpay + Stripe
│   │       ├── webhooks/      # Payment webhooks
│   │       ├── coupons/       # Coupon validation
│   │       └── reviews/       # Review system
│   ├── components/
│   │   ├── layout/            # Header, Footer, Providers
│   │   ├── home/              # All homepage sections
│   │   ├── product/           # Cards, gallery, info, grid
│   │   ├── cart/              # Cart drawer
│   │   ├── shared/            # Breadcrumbs, search modal
│   │   └── admin/             # Admin components
│   ├── lib/
│   │   ├── db/prisma.ts       # DB client singleton
│   │   ├── auth/options.ts    # NextAuth config
│   │   ├── payments/razorpay.ts # Razorpay integration
│   │   ├── email/index.ts     # Email templates
│   │   └── cache/redis.ts     # Redis caching + rate limit
│   ├── store/index.ts         # Zustand — cart, wishlist, UI
│   ├── types/index.ts         # Full TypeScript types
│   ├── utils/
│   │   ├── cn.ts              # Tailwind class merger
│   │   └── gst.ts             # GST calculations
│   ├── hooks/useDebounce.ts   # Reusable hooks
│   └── styles/globals.css     # Global CSS with design tokens
├── tailwind.config.ts         # Luxury design system
├── next.config.js             # Next.js config + security headers
├── tsconfig.json              # TypeScript config
└── .env.example               # All environment variables
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

**Required for basic setup:**
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random 32+ char string
- `NEXTAUTH_URL` — Your domain (http://localhost:3000 for dev)

**Required for payments:**
- `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

### 3. Set Up Database
```bash
# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Admin Access
```
URL:      http://localhost:3000/admin
Email:    admin@indiashoppingstore.com
Password: Admin@123456
```

---

## 🚀 Production Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... all other variables
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t indiashopping .
docker run -p 3000:3000 --env-file .env.local indiashopping
```

### Database (Supabase / Neon / Railway)

**Supabase (Free tier):**
1. Create project at supabase.com
2. Copy connection string to `DATABASE_URL`
3. Run `npm run db:migrate:deploy`

**Neon (Serverless PostgreSQL):**
1. Create at neon.tech
2. Use pooled connection for `DATABASE_URL`
3. Use direct connection for `DIRECT_URL`

### Redis (Upstash)

1. Create free Redis at upstash.com
2. Copy `REDIS_URL` to environment

---

## 💳 Payment Setup

### Razorpay
1. Create account at razorpay.com
2. Dashboard → Settings → API Keys
3. Copy Key ID and Secret to `.env.local`
4. Set webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
5. Enable events: `payment.captured`, `payment.failed`, `refund.processed`

### Cashfree (Alternative)
1. Create account at cashfree.com
2. Copy App ID and Secret Key to `.env.local`

---

## 📧 Email Setup

### Gmail (Development)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password  # Google App Password
```

### Production (Recommended)
- **AWS SES** — Cost-effective at scale
- **SendGrid** — Easy setup, free tier available
- **Resend** — Modern developer-friendly option

---

## 🖼️ Image CDN (Cloudinary)

1. Create free account at cloudinary.com
2. Copy Cloud Name, API Key, API Secret to `.env.local`
3. All product images upload automatically

---

## 🔍 SEO Features

- ✅ Dynamic sitemap (supports 100K+ products)
- ✅ Robots.txt
- ✅ Open Graph & Twitter cards
- ✅ JSON-LD structured data (Product, Organization, Website, Breadcrumb)
- ✅ Canonical URLs
- ✅ Meta titles & descriptions
- ✅ Core Web Vitals optimized
- ✅ Image optimization (WebP/AVIF)

---

## 🏗️ Architecture Decisions

| Concern | Solution |
|---|---|
| Database | PostgreSQL via Prisma ORM |
| Authentication | NextAuth.js (Google, Facebook, Credentials, OTP) |
| State Management | Zustand (cart, wishlist, UI) |
| Caching | Redis (product lists, search, rate limiting) |
| Payments | Razorpay (primary), Stripe (international), COD |
| Images | Cloudinary CDN |
| Email | Nodemailer with custom HTML templates |
| SMS / WhatsApp | Twilio |
| Search | PostgreSQL full-text + Redis cache |
| Animations | Framer Motion |

---

## 📊 Database Schema Overview

| Model | Purpose |
|---|---|
| User | Customers, admins, vendors, affiliates |
| Product | Catalog with variants, attributes |
| Category | Hierarchical (unlimited depth) |
| Brand | Product brands |
| Order | Full order lifecycle |
| OrderItem | Line items with GST |
| Payment | Multi-provider payment records |
| Cart | Persistent cart (user + guest) |
| Wishlist | Saved products |
| Review | Verified purchase reviews |
| Coupon | Flexible discount engine |
| LoyaltyTransaction | Points ledger |
| AffiliateProfile | Affiliate program |
| VendorProfile | Multi-vendor marketplace ready |
| BlogPost | Content marketing |
| Banner | Homepage/promotional banners |
| Notification | In-app notifications |
| SearchQuery | Search analytics |
| SiteSetting | Runtime configuration |

---

## 🔐 Security Features

- ✅ HTTPS enforced
- ✅ CSP headers
- ✅ X-Frame-Options: DENY
- ✅ Rate limiting (Redis) on auth & OTP
- ✅ Razorpay webhook signature verification
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ JWT with short expiry
- ✅ Input validation (Zod)
- ✅ SQL injection prevention (Prisma)
- ✅ CSRF protection (NextAuth)

---

## 🇮🇳 India-Specific Features

- ✅ GST calculation (CGST, SGST, IGST)
- ✅ HSN codes on products
- ✅ UPI payment support
- ✅ Cash on Delivery
- ✅ INR formatting (Indian number system)
- ✅ Indian states dropdown
- ✅ 10-digit mobile validation
- ✅ 6-digit pincode validation
- ✅ OTP login (email + SMS)
- ✅ WhatsApp integration ready (Twilio)
- ✅ Shiprocket / Delhivery shipping ready
- ✅ GST invoice generation ready

---

## 📱 Performance

- First Contentful Paint: < 1.2s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Image optimization: WebP/AVIF + lazy loading
- Redis caching on all product list/search endpoints
- Static generation for marketing pages
- ISR (Incremental Static Regeneration) for product pages

---

## 🛠️ Available Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npm run typecheck        # TypeScript check
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema (dev)
npm run db:migrate       # Run migrations (dev)
npm run db:migrate:deploy# Run migrations (production)
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

---

## 📞 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: dev@indiashoppingstore.com

---

*Built with ❤️ for India's growing e-commerce ecosystem*
