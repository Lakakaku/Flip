# FlipFinder Folder Structure

This document outlines the complete folder structure created for the Swedish marketplace flipping platform.

## Directory Structure

```
/Users/lucasjenner/flip/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── deals/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── analytics/
│   │   ├── settings/
│   │   ├── flipsquads/
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── listings/
│   │   ├── prices/
│   │   ├── notifications/
│   │   ├── users/
│   │   ├── analytics/
│   │   ├── webhooks/
│   │   └── health/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   │   ├── button.tsx
│   │   └── index.ts
│   ├── features/                # Feature-specific components
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── index.ts
│   │   ├── deals/
│   │   ├── notifications/
│   │   └── analytics/
│   ├── layout/                  # Layout components
│   ├── forms/                   # Form components
│   └── index.ts
├── lib/                         # Core business logic
│   ├── utils/                   # Utility functions
│   │   └── index.ts            # CN function, formatters, helpers
│   ├── config/                  # Configuration
│   │   └── index.ts            # App config, environment settings
│   ├── ai/                      # AI services
│   │   └── index.ts            # Product analysis, price prediction
│   ├── database/                # Database operations
│   │   └── index.ts            # Database service, queries
│   ├── scrapers/                # Web scraping
│   │   └── index.ts            # Marketplace scrapers
│   ├── payments/                # Payment processing
│   │   └── index.ts            # Stripe integration, subscriptions
│   ├── notifications/           # Notification system
│   │   └── index.ts            # Discord, email notifications
│   ├── auth/                    # Authentication
│   │   └── index.ts            # Auth service, session management
│   ├── validators/              # Input validation
│   │   └── index.ts            # Zod schemas, validation functions
│   └── index.ts                 # Barrel export
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts             # Authentication hook
│   ├── use-deals.ts            # Deals management hook
│   ├── use-debounce.ts         # Debounce utility hook
│   └── index.ts                # Hook exports
├── types/                       # TypeScript definitions
│   └── index.ts                # Comprehensive type definitions
├── public/                      # Static assets
│   ├── icons/                  # App icons
│   ├── images/                 # Images
│   ├── logos/                  # Brand logos
│   ├── docs/                   # Documentation assets
│   ├── manifest.json           # PWA manifest
│   └── robots.txt              # SEO robots file
├── scripts/                     # Build and utility scripts
├── tools/                       # Development tools
└── Configuration files
```

## Key Features

### 1. Next.js 14 App Router Structure
- **Route Groups**: `(auth)` and `(dashboard)` for organized routing
- **Layout Files**: Dedicated layouts for auth and dashboard sections
- **API Routes**: Organized by feature (auth, listings, prices, etc.)

### 2. Component Organization
- **UI Components**: Reusable base components with consistent styling
- **Feature Components**: Organized by application features
- **Layout Components**: Header, sidebar, footer, navigation
- **Form Components**: Reusable form elements

### 3. Business Logic (lib/)
- **AI Services**: Product analysis and price prediction
- **Database**: Centralized database operations
- **Scrapers**: Marketplace scraping with stealth measures
- **Payments**: Subscription and transaction handling
- **Notifications**: Multi-channel notification system
- **Validators**: Zod schemas for input validation

### 4. Type Safety
- Comprehensive TypeScript definitions
- Form validation schemas
- API response types
- Database entity types

### 5. Custom Hooks
- Authentication state management
- Deal fetching and filtering
- Utility hooks (debounce, local storage)

### 6. Static Assets
- Organized public directory
- PWA manifest for mobile support
- SEO optimization files

## Critical Implementation Notes

### 1. Price Database Dependency
All deal-finding features are designed to check database completeness before operation:
```typescript
// Example from use-deals.ts
const response = await fetch('/api/deals');
if (!response.ok) {
  throw new Error('Price database not complete');
}
```

### 2. Development vs Production
- Mock services active in development
- Free tier services during initial development
- Production services activated after launch

### 3. Stealth Scraping Architecture
- Rate limiting built into scraper base class
- User agent rotation
- Proxy support infrastructure
- Human-like delay patterns

### 4. Subscription Tier Access
- Hierarchical access control
- Feature unlocking based on subscription
- Notification limits by tier

## Next Steps

1. **Database Schema**: Implement actual database operations
2. **Authentication**: Integrate Supabase auth
3. **Scraper Implementation**: Build marketplace-specific scrapers
4. **UI Components**: Implement remaining UI components
5. **API Endpoints**: Complete API route implementations

## Dependencies Added

- `clsx` and `tailwind-merge`: Utility for conditional CSS classes
- `zod`: Schema validation library

This structure provides a solid foundation for the Swedish marketplace flipping platform, following Next.js 14 conventions while supporting the specific requirements of scraping, AI analysis, and subscription-based access control.