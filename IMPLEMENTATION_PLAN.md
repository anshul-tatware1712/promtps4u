# Prompts4U - Phase 1 Implementation Plan

## Context

Prompts4U is a developer marketplace for AI prompts that generate production-ready UI components. Users browse, preview, and copy prompts optimized for Claude Code, Cursor, OpenRouter, and other AI coding tools.

**Current State:** Both frontend (Next.js) and backend (NestJS) are freshly scaffolded with default boilerplate code. No database, authentication, or business logic implemented yet.

**Goal:** Build a complete Phase 1 MVP with authentication, marketplace, payments, and prompt copying functionality.

---

## Problem Statement

Developers using AI coding tools struggle to write effective prompts for UI components. Prompts4U solves this by providing pre-crafted, high-quality prompts that instantly generate production-ready UI when pasted into AI tools.

**Phase 1 Launch Requirements:**
- Landing page with conversion-focused design
- Marketplace with search, filtering, and preview
- Authentication (OAuth + Email OTP)
- Free vs Pro tier system ($20/mo)
- Razorpay payment integration
- 30-50 high quality prompts seeded

---

## Tech Stack (Latest & Production-Ready)

### Frontend
| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 4 |
| UI Components | shadcn/ui |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query |
| Icons | Lucide React |
| Auth | NextAuth v5 |

### Backend
| Category | Technology |
|----------|------------|
| Framework | NestJS 11 |
| HTTP Adapter | Fastify |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache | Redis (optional for sessions) |
| Email | Resend |
| Payments | Razorpay |
| Validation | class-validator + class-transformer |

### Infrastructure
| Service | Provider |
|---------|----------|
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| Database | Neon (Serverless PostgreSQL) |
| Email | Resend |
| Payments | Razorpay |

---

## Code Architecture Principles

### Frontend Architecture

**1. Component Separation Pattern**
- **Container Components** (`containers/`) - Business logic, data fetching, state management
- **Presentational Components** (`components/`) - Pure UI, props-driven, reusable
- **Compound Components** - For complex UI patterns (e.g., `<Form>`, `<FormField>`)

**2. File Organization**
```
app/
├── (marketing)/           # Route group for public pages
│   ├── layout.tsx         # Marketing layout with Navbar/Footer
│   ├── page.tsx           # Landing page (container)
│   └── marketplace/
│       └── page.tsx       # Marketplace page (container)
├── (auth)/
│   └── login/
│       └── page.tsx       # Login page (container)
├── (dashboard)/
│   └── dashboard/
│       └── page.tsx       # Dashboard page (container)
└── api/                   # API routes (if needed)
```

**3. Component File Structure**
```
components/
├── ui/                    # shadcn primitives (Button, Card, etc.)
├── common/                # Shared components
│   ├── navbar/
│   │   ├── navbar.tsx           # Presentational
│   │   ├── navbar-container.tsx # Container with auth state
│   │   ├── navbar-items.tsx     # Sub-components
│   │   └── index.ts             # Barrel export
│   └── footer/
├── marketing/
│   ├── hero-section/
│   │   ├── hero-section.tsx
│   │   ├── hero-content.tsx
│   │   └── index.ts
│   ├── how-it-works/
│   ├── component-preview/
│   └── pricing-section/
├── marketplace/
│   ├── category-sidebar/
│   ├── search-bar/
│   ├── component-card/
│   │   ├── component-card.tsx
│   │   ├── component-card.types.ts
│   │   └── index.ts
│   └── component-grid/
├── auth/
│   ├── oauth-buttons/
│   ├── otp-form/
│   └── login-form/
└── payment/
    ├── upgrade-modal/
    └── razorpay-button/
```

**4. Types & Interfaces (Separate Files)**
```
types/
├── api.ts                 # API response/request types
├── component.ts           # Component-related types
├── user.ts                # User entity types
├── payment.ts             # Payment types
└── index.ts               # Barrel export
```

**5. Custom Hooks (Separate Folder)**
```
hooks/
├── use-copy-prompt.ts
├── use-auth.ts
├── use-subscription.ts
├── use-toast.ts
└── index.ts
```

**6. Services / API Layer**
```
lib/
├── api/
│   ├── client.ts          # Axios/fetch instance
│   ├── auth.ts            # Auth API calls
│   ├── components.ts      # Components API calls
│   └── payments.ts        # Payments API calls
├── utils.ts               # cn(), formatters
└── constants.ts           # App constants
```

**7. State Management**
```
store/
├── auth-store.ts          # Zustand auth store
├── ui-store.ts            # UI state (modals, sidebar)
└── index.ts
```

### Backend Architecture

**1. Module Structure (Loose Coupling)**
```
modules/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── login-otp.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── interfaces/
│   │   └── jwt-payload.interface.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   ├── entities/
│   └── interfaces/
├── components/
├── payments/
└── copy-tracking/
```

**2. Service Layer Pattern**
- **Controller** - HTTP handling, validation, response formatting
- **Service** - Business logic, database operations
- **Repository** (optional) - Data access abstraction for loose coupling
- **DTOs** - Request/Response data transfer objects
- **Entities** - Database models
- **Interfaces** - Type contracts

**3. Common Patterns**
- Use `@nestjs/config` for environment variables
- Use `class-validator` decorators on DTOs
- Use `class-transformer` for serialization
- Implement `OnModuleInit` for setup logic
- Use `@nestjs/event-emitter` for cross-module events

---

## Monorepo Structure

```
prompts4u/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── app/                      # App Router pages
│   │   ├── components/               # All React components
│   │   │   ├── ui/                   # shadcn primitives
│   │   │   ├── common/               # Shared components
│   │   │   ├── marketing/            # Landing page components
│   │   │   ├── marketplace/          # Marketplace components
│   │   │   ├── auth/                 # Auth components
│   │   │   └── payment/              # Payment components
│   │   ├── containers/               # Container components (business logic)
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities, API client
│   │   ├── store/                    # Zustand stores
│   │   ├── types/                    # TypeScript types/interfaces
│   │   ├── styles/                   # Global styles
│   │   └── config/                   # App configuration
│   │
│   └── api/                          # NestJS + Fastify backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/               # Shared utilities
│       │   │   ├── decorators/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── filters/
│       │   │   └── pipes/
│       │   ├── config/               # App configuration
│       │   └── modules/              # Feature modules
│       │       ├── auth/
│       │       ├── users/
│       │       ├── components/
│       │       ├── payments/
│       │       └── copy-tracking/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── test/
│
├── packages/
│   └── types/                        # Shared TypeScript types
│       ├── src/
│       │   ├── user.ts
│       │   ├── component.ts
│       │   ├── payment.ts
│       │   └── index.ts
│       └── package.json
│
├── .env.example
├── turbo.json                        # Turborepo config (optional)
├── pnpm-workspace.yaml
└── package.json                      # Root package.json
```

---

## Setup Commands

```bash
# Initialize shadcn in frontend
cd prompts4u-frontend
npx shadcn@latest init

# Add required shadcn components
npx shadcn@latest add button card badge input form dialog sonner toast
npx shadcn@latest add select dropdown-menu avatar separator skeleton
npx shadcn@latest add sheet scroll-area tabs label switch
```

### shadcn Skills Reference

The project uses shadcn/ui skills for component generation. Key patterns:

**Component Configuration:**
```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "hooks": "@/hooks"
  }
}
```

**Required UI Components from shadcn:**
- `Button` - All CTAs, copy buttons
- `Card` - Component cards, pricing cards
- `Badge` - Category badges, tier badges
- `Input` - Email input, search input
- `Form` - OTP form, login forms
- `Dialog` - Modals (login, upgrade, preview)
- `Sonner/Toast` - Notifications
- `Select` - Category filter, sort dropdown
- `DropdownMenu` - User menu
- `Avatar` - User avatar in navbar
- `Separator` - Visual dividers
- `Skeleton` - Loading states
- `Sheet` - Mobile sidebar
- `Tabs` - Auth method switching
- `Label` - Form labels
- `Switch` - Toggle options

---

## TypeScript Types & Interfaces

### Frontend Types (`apps/web/types/`)

```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: 'github' | 'google' | 'email';
  subscriptionStatus: 'free' | 'active' | 'cancelled';
  subscriptionEnd?: string;
}

export interface Session {
  user: User;
  expires: string;
}

// types/component.ts
export interface Component {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ComponentCategory;
  tier: 'free' | 'paid';
  promptContent: string;
  previewImageUrl?: string;
  previewCode?: string;
  tags: string[];
  copyCount: number;
  createdAt: string;
}

export type ComponentCategory =
  | 'header'
  | 'hero'
  | 'pricing'
  | 'testimonials'
  | 'about'
  | 'features'
  | 'footer'
  | 'cta'
  | 'faq';

// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// types/payment.ts
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface PaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
}

// types/index.ts (Barrel export)
export * from './user';
export * from './component';
export * from './api';
export * from './payment';
```

---

## Database Schema

```prisma
model User {
  id                 String    @id @default(cuid())
  email              String    @unique
  name               String?
  avatar             String?
  provider           String    // 'github' | 'google' | 'email'
  providerId         String?
  subscriptionStatus String    @default("free") // 'free' | 'active' | 'cancelled'
  subscriptionId     String?
  subscriptionEnd    DateTime?
  createdAt          DateTime  @default(now())
  copies             CopyLog[]
}

model Component {
  id               String    @id @default(cuid())
  slug             String    @unique
  name             String
  description      String
  category         String    // 'header' | 'hero' | 'pricing' | etc.
  tier             String    @default("free") // 'free' | 'paid'
  promptContent    String    @db.Text
  previewImageUrl  String?
  previewCode      String?   @db.Text
  tags             String[]
  copyCount        Int       @default(0)
  createdAt        DateTime  @default(now())
  copies           CopyLog[]
}

model CopyLog {
  id          String    @id @default(cuid())
  userId      String
  componentId String
  copiedAt    DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id])
  component   Component @relation(fields: [componentId], references: [id])
}

model OtpCode {
  id        String   @id @default(cuid())
  email     String
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/marketplace` | Browse + filter component prompts |
| `/marketplace/[slug]` | Single prompt detail (optional Phase 1) |
| `/login` | Auth page (GitHub, Google, Email OTP) |
| `/pricing` | Pricing page (optional, or section on landing) |
| `/dashboard` | Post-login: saved prompts, subscription status |

---

## Landing Page Sections (in order)

1. **Hero** — headline, subheadline, CTA ("Browse Components"), short animated preview
2. **How It Works** — 3 steps: Browse → Copy Prompt → Paste into Claude Code / Cursor
3. **Component Preview Grid** — teaser of 6 components (blurred/locked for non-users)
4. **Pricing Section** — Free tier vs $20/mo paid
5. **Footer**

---

## Marketplace Page

**Layout:**
- **Left sidebar (desktop) / Drawer (mobile):** Categories
  - Headers / Navbars
  - Hero Sections
  - Pricing
  - Testimonials
  - About / Team
  - Features
  - Footer
  - CTA Sections
  - FAQ

- **Top bar:** Search input (client-side filter by name/tag), Sort (Newest / Popular)
- **Main grid:** Component cards

### Copy Button Logic (frontend state machine)

```
Click "Copy Prompt"
  → Is user logged in?
    No → Redirect to /login?next=/marketplace
    Yes → Is component free?
      Yes → Copy to clipboard ✅ + toast "Prompt copied!"
      No → Is user subscribed?
        Yes → Copy to clipboard ✅
        No → Show upgrade modal → "Unlock All Prompts — $20/mo" → CTA to Razorpay
```

---

## Backend — NestJS + Fastify Modules

### 1. Auth Module

| Endpoint | Description |
|----------|-------------|
| `POST /auth/email/send-otp` | Validates email, generates 6-digit OTP, stores in DB with 10min TTL, sends via Resend |
| `POST /auth/email/verify-otp` | Validates OTP, creates/returns user + JWT session |
| `POST /auth/oauth/callback` | OAuth callback to upsert user record (GitHub/Google) |

**Auth Details:**
- OAuth handled via NextAuth v5 on frontend
- JWT access token (15min) + Refresh token (7d) pattern

### 2. Users Module

| Endpoint | Description |
|----------|-------------|
| `GET /users/me` | Returns profile + subscription status |

**User model:** id, email, name, avatar, provider, providerId, subscriptionStatus, subscriptionId, subscriptionEnd, createdAt

### 3. Components Module (the core content)

| Endpoint | Description |
|----------|-------------|
| `GET /components` | Paginated, filterable list (query: category, search, tier, page, limit) |
| `GET /components/:id` | Single component detail |
| `POST /components` | Admin only: create prompt |
| `POST /components/:id/copy` | Authenticated, logs copy event, increments copyCount |

**Component model:** id, slug, name, description, category, tier (free | paid), promptContent, previewImageUrl, previewCode, tags[], copyCount, createdAt

**Access control middleware:** If tier === 'paid' and user is not subscribed → return 403 with `{ code: 'SUBSCRIPTION_REQUIRED' }`

### 4. Payments Module (Razorpay)

| Endpoint | Description |
|----------|-------------|
| `POST /payments/create-order` | Creates Razorpay order for $20/mo plan, returns orderId |
| `POST /payments/verify` | Verifies Razorpay signature, activates subscription on user record |
| `POST /payments/webhook` | Razorpay webhook for subscription renewals/cancellations |

**On successful payment:** set user.subscriptionStatus = 'active', store subscriptionId, set subscriptionEndDate

---

## Auth Architecture

```
Frontend (NextAuth v5)
  ├── GitHub Provider  ──→ callback hits /auth/oauth/callback on API
  ├── Google Provider  ──→ same
  └── Custom Email OTP ──→
        1. POST /auth/email/send-otp  {email}
        2. User enters OTP
        3. POST /auth/email/verify-otp {email, otp}
        4. API returns JWT
        5. NextAuth stores session

Session stored in: HTTP-only cookie (JWT)
API guards: BearerAuthGuard on all protected routes
```

---

## Payment Flow

```
User clicks "Upgrade"
  → Frontend: POST /payments/create-order
  → Backend returns { orderId, amount, currency }
  → Frontend opens Razorpay checkout modal
  → User pays
  → Razorpay calls frontend success handler
  → Frontend: POST /payments/verify { orderId, paymentId, signature }
  → Backend verifies HMAC signature
  → Backend sets user.subscriptionStatus = 'active'
  → Frontend redirects to /marketplace (now unlocked)
```

---

## Environment Variables

### Frontend (.env)
```
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=
```

### Backend (.env)
```
DATABASE_URL=
JWT_SECRET=
RESEND_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
FRONTEND_URL=
```

---

## Implementation Phases

### Phase 1A: Foundation (Days 1-3)
- [ ] Setup monorepo structure (apps/web, apps/api, packages/types)
- [ ] Setup Prisma with Neon database
- [ ] Create database schema & run migrations
- [ ] Setup NestJS Fastify adapter
- [ ] Configure NextAuth v5 with providers
- [ ] Setup Resend for OTP emails
- [ ] Configure Razorpay test mode

### Phase 1B: Backend Core (Days 4-7)
- [ ] Auth module (OTP + OAuth callback)
- [ ] Users module with subscription management
- [ ] Components module (CRUD)
- [ ] Payments module with webhook
- [ ] Copy tracking module
- [ ] Seed script for 30-50 prompts

### Phase 1C: Frontend Core (Days 8-14)
- [ ] Setup shadcn/ui
- [ ] Create layout (Navbar, Footer)
- [ ] Build Landing page (5 sections)
- [ ] Build Marketplace page with sidebar + search
- [ ] Create ComponentCard component
- [ ] Login page with OAuth + OTP forms
- [ ] Copy prompt functionality with state machine

### Phase 1D: Payments & Polish (Days 15-17)
- [ ] Upgrade modal
- [ ] Razorpay checkout integration
- [ ] Payment verification flow
- [ ] Subscription restriction enforcement
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications

### Phase 1E: Launch Prep (Days 18-20)
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Configure production env vars
- [ ] Switch Razorpay to live mode
- [ ] Add analytics (PostHog/Plausible)
- [ ] Final testing
- [ ] Launch!

---

## Security Considerations

1. **Never trust frontend for subscription checks** - All access control on backend
2. **JWT in httpOnly cookies** - Not localStorage (handled by NextAuth)
3. **Webhook signature verification** - Validate Razorpay HMAC signatures
4. **Rate limiting on OTP** - Prevent abuse (10min TTL, one-time use)
5. **CORS configuration** - Allow only frontend domain
6. **Input validation** - Zod on frontend, class-validator on backend
7. **SQL injection prevention** - Prisma handles this

---

## Verification & Testing

### Backend Testing
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Test auth flow manually
curl -X POST http://localhost:3001/auth/email/send-otp -d '{"email":"test@example.com"}'

# Test component access
curl http://localhost:3001/components
```

### Frontend Testing
```bash
# Run linting
npm run lint

# Build for production
npm run build

# Test copy flow
# 1. Start dev server
# 2. Navigate to /marketplace
# 3. Click copy on free component → should copy
# 4. Click copy on paid component (not logged in) → redirect to /login
# 5. Click copy on paid component (free user) → upgrade modal
```

### E2E Flow
1. Visit landing page → browse components
2. Login with GitHub
3. Copy free component → success
4. Try paid component → upgrade
5. Complete Razorpay test payment
6. Copy paid component → success

---

## Files to Create/Modify

### Backend (New Files)
```
apps/api/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── common/
│   │   ├── decorators/public.decorator.ts
│   │   └── guards/bearer-auth.guard.ts
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── components/
│       ├── payments/
│       └── copy-tracking/
```

### Frontend (New Files)
```
apps/web/
├── components/ui/           # shadcn components
├── components/common/
├── components/marketing/
├── components/marketplace/
├── components/auth/
├── components/payment/
├── containers/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   └── (dashboard)/
├── lib/api.ts
├── hooks/
├── store/
└── types/
```

---

## Notes & Considerations

1. **Latest tech stack** - Next.js 15, NextAuth v5, React Hook Form, Zod
2. **Monorepo setup** - Shared types package for consistency
3. **$20/mo subscription** - Recurring revenue model
4. **30-50 prompts for launch** - Quality over quantity
5. **NextAuth v5** - Unified auth session management
6. **Redis optional** - Can use DB for OTP storage in Phase 1
7. **shadcn/ui** - All UI components from shadcn, use MCP/skills for generation
8. **Clean code** - Separate container/presentation layers, small focused files

---

## Phase 1 Launch Checklist

- [ ] Landing page (all 5 sections)
- [ ] Marketplace with category sidebar + search
- [ ] Component cards with preview images
- [ ] Copy button with full auth/paywall gate
- [ ] Login page (GitHub + Google + Email OTP)
- [ ] Razorpay payment flow
- [ ] Admin: simple way to add prompts (can be seed script for Phase 1)
- [ ] 30–50 high quality prompts seeded across all categories
- [ ] Mobile responsive
