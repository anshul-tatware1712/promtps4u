# Prompts4U - Phase 1 Implementation

## Overview

Prompts4U is a developer marketplace for AI prompts that generate production-ready UI components. Users browse, preview, and copy prompts optimized for Claude Code, Cursor, OpenRouter, and other AI coding tools.

## Repository Structure

This is a **single monorepo** - all code is tracked in one git repository.

```
prompts4u.dev/
├── .git/                 # Single git repository
├── .gitignore            # Root gitignore
├── GIT_STRUCTURE.md      # Guide for git workflow
├── prompts4u-frontend/   # Next.js 15 frontend
├── prompts4u-backend/    # NestJS backend
└── packages/types/       # Shared TypeScript types
```

All git commands are run from the root directory. See [GIT_STRUCTURE.md](./GIT_STRUCTURE.md) for detailed workflow guide.

**Remote:** https://github.com/anshul-tatware1712/promtps4u.git

## Project Structure

```
prompts4u/
├── prompts4u-frontend/     # Next.js 15 frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API client
│   ├── types/              # TypeScript types
│   └── .env.example        # Environment variables
│
├── prompts4u-backend/      # NestJS backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication (OTP + OAuth)
│   │   │   ├── users/      # User management
│   │   │   ├── components/ # Component CRUD
│   │   │   ├── payments/   # Razorpay integration
│   │   │   └── copy-tracking/ # Copy tracking
│   │   └── common/         # Shared utilities
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed script with 30 prompts
│   └── .env.example        # Environment variables
│
└── packages/
    └── types/              # Shared TypeScript types
```

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript 5**
- **TailwindCSS 4**
- **shadcn/ui** for components
- **TanStack Query** for data fetching
- **Axios** for API calls
- **Sonner** for toast notifications

### Backend
- **NestJS 11** with Fastify
- **Prisma 5** ORM
- **PostgreSQL** (Neon)
- **JWT** for authentication
- **class-validator** for DTO validation
- **Resend** for email (OTP)
- **Razorpay** for payments

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon or local)
- npm or pnpm

### Backend Setup

1. Navigate to backend directory:
```bash
cd prompts4u-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update environment variables in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/prompts4u
JWT_SECRET=your-secret-key
RESEND_API_KEY=your-resend-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
FRONTEND_URL=http://localhost:3000
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Run database migrations:
```bash
npx prisma migrate dev --name init
```

7. Seed the database:
```bash
npm run prisma:seed
```

8. Start development server:
```bash
npm run start:dev
```

Backend will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd prompts4u-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update environment variables:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
```

5. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Features Implemented

### Backend
- [x] Authentication module (OTP + OAuth callback)
- [x] Users module with subscription management
- [x] Components module (CRUD + copy tracking)
- [x] Payments module (Razorpay integration)
- [x] Copy tracking module
- [x] Database schema with 4 models
- [x] Seed script with 30+ prompts

### Frontend
- [x] Landing page (5 sections)
  - Hero with animated preview
  - How It Works (3 steps)
  - Component Preview Grid
  - Pricing Section
- [x] Marketplace page
  - Category sidebar
  - Search functionality
  - Sort by newest/popular
  - Component cards with copy/preview
- [x] Login page
  - Email OTP flow
  - OAuth buttons (GitHub/Google)
- [x] Dashboard page
  - Account info
  - Subscription status
  - Recent copies
- [x] Layout components (Navbar, Footer)
- [x] Auth context and hooks
- [x] Copy prompt functionality with paywall
- [x] Upgrade modal

## API Endpoints

### Auth
- `POST /auth/email/send-otp` - Send OTP to email
- `POST /auth/email/verify-otp` - Verify OTP and login
- `POST /auth/oauth/callback` - OAuth callback handler
- `GET /auth/me` - Get current user (protected)

### Users
- `GET /users/me` - Get user profile (protected)
- `GET /users/subscription` - Get subscription status (protected)
- `POST /users/profile` - Update profile (protected)
- `POST /users/subscription` - Update subscription (protected)

### Components
- `GET /components` - List components (paginated, filterable)
- `GET /components/:id` - Get component by ID
- `GET /components/slug/:slug` - Get component by slug
- `POST /components` - Create component (admin)
- `POST /components/:id/copy` - Copy component (protected)
- `DELETE /components/:id` - Delete component (admin)

### Payments
- `POST /payments/create-order` - Create Razorpay order (protected)
- `POST /payments/verify` - Verify payment signature (protected)
- `POST /payments/webhook` - Razorpay webhook handler

## Database Schema

### User
- id, email, name, avatar
- provider, providerId
- subscriptionStatus, subscriptionId, subscriptionEnd
- createdAt

### Component
- id, slug, name, description
- category, tier (free/paid)
- promptContent, previewImageUrl, previewCode
- tags[], copyCount
- createdAt

### CopyLog
- id, userId, componentId
- copiedAt

### OtpCode
- id, email, code, expiresAt
- used, createdAt

## Development Notes

### Running Locally
1. Start backend: `npm run start:dev` in prompts4u-backend
2. Start frontend: `npm run dev` in prompts4u-frontend
3. Both should run concurrently

### Testing Payments
- Use Razorpay test credentials
- Test card: 4111 1111 1111 1111
- Any future date and CVV

### Email (OTP)
- In development, OTP is logged to console if no RESEND_API_KEY
- Add Resend API key for production email sending

## Next Steps (Post Phase 1)

- [ ] Add OAuth flow completion (GitHub/Google)
- [ ] Admin dashboard for managing prompts
- [ ] Component preview images
- [ ] Enhanced search with filters
- [ ] User saved prompts history
- [ ] Analytics integration
- [ ] Production deployment

## Troubleshooting

### Prisma Errors
If you see schema errors, run:
```bash
npx prisma generate
npx prisma migrate reset
```

### Port Already in Use
Backend uses port 3001, frontend uses 3000. Change in config if needed.

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```
