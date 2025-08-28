# DEVELOPMENT.md - Step-by-Step Development Guide

## Day-by-Day Development Plan

### Before You Start

- [ ] Install Node.js (v18+), Git, and VS Code/Cursor
- [ ] Set up GitHub account
- [ ] Create Supabase account (free)
- [ ] Create Vercel account (free)
- [ ] Create Discord Developer account (free)
- [ ] Install Ollama locally (for free AI testing)

---

## Week 1: Foundation & Price Database

### Day 1-2: Project Setup

```bash
# Initialize project
npx create-next-app@latest flipping-platform --typescript --tailwind --app
cd flipping-platform

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
npm install cheerio axios zod react-hook-form
npm install @radix-ui/react-* shadcn-ui

# Initialize git
git init
git add .
git commit -m "Initial setup"
```

**Supabase Setup:**

1. Go to supabase.com → New Project
2. Copy SQL from ARCHITECTURE.md database schema
3. Run in SQL Editor
4. Copy environment variables to .env.local

### Day 3-7: CRITICAL - Price Database

**⚠️ DO NOT PROCEED WITHOUT COMPLETING THIS**

```javascript
// lib/scrapers/price-database-builder.js
// This MUST run first and collect 50,000+ price points

const requirements = {
  electronics: 15000,
  fashion: 10000,
  furniture: 5000,
  vehicles: 8000,
  other: 5000
};

// Run this script continuously until requirements met
npm run scrape:prices
```

**Daily Checklist:**

- [ ] Morning: Check scraper health
- [ ] Noon: Validate data quality
- [ ] Evening: Check progress toward 50k goal
- [ ] Before sleep: Ensure scrapers still running

### Day 8-9: Active Scrapers

Only after price database is complete:

```javascript
// Now we can build deal-finding scrapers
- Implement Blocket scraper
- Implement Tradera scraper
- Test with real searches
```

---

## Week 2: Core Features

### Day 10-11: AI & Profit Calculation

```javascript
// Use FREE alternatives only
- TensorFlow.js for image analysis
- Ollama for text processing
- No OpenAI API yet!
```

### Day 12-14: User Interface

```javascript
// Build core pages
- Dashboard
- Notifications list
- Unlock flow
- User settings
```

### Day 15: Discord Integration

```javascript
// Set up bot (FREE)
- Create Discord app
- Implement commands
- Test notifications
```

### Day 16: Testing & Polish

```javascript
// Final development day
- Fix all critical bugs
- Ensure price database complete
- Test all user flows
```

---

## Week 3: Beta & Launch

### Day 17-20: Beta Testing

**NOW you can start spending money (carefully)**

- Recruit 10-20 beta testers
- Limited OpenAI API usage ($20-50)
- Keep everything else free

### Day 21+: Soft Launch

**Upgrade to paid services only after paying customers**

- Migrate to Supabase Pro
- Migrate to Vercel Pro
- Enable real payment processing

---

## Critical Checkpoints

### Before Day 8

✅ Price database has 50,000+ records

```sql
SELECT COUNT(*) FROM product_prices;
-- Must return >= 50000
```

### Before Day 16

✅ All core features working in mock mode
✅ No paid services activated
✅ All tests passing

### Before Beta

✅ Legal documents ready
✅ GDPR compliance implemented
✅ Admin panel functional

### Before Launch

✅ Payment system tested
✅ Monitoring set up
✅ Backup system active

---

## Common Issues & Solutions

### "Scraper got blocked"

```javascript
// Immediately:
1. Stop scraper
2. Rotate proxy
3. Clear cookies
4. Wait 1 hour
5. Resume with 2x delays
```

### "Price database insufficient"

```javascript
// Do NOT proceed with features
// Continue scraping until 50k+ records
// This is non-negotiable
```

### "Running out of time"

```javascript
// Priority order (cannot skip):
1. Price database (50k+)
2. User auth
3. Basic scrapers
4. Notification system
5. Payment (mock)

// Can postpone:
- FlipSquad
- AutoLister
- PriceSetter
- FliCademy content
```

### "Costs too high"

```javascript
// During development (Days 1-16):
- Use ONLY free tiers
- Mock all payments
- Use local AI (Ollama)
- Free Discord bot

// During beta (Days 17-20):
- Max $50 for OpenAI testing
- Everything else stays free

// Only at launch:
- Activate paid services
```

---

## Testing Strategy

### Local Testing

```bash
# Always run before committing
npm run lint
npm run type-check
npm run test

# Check price database
npm run db:validate
```

### Scraper Testing

```bash
# Test individual scrapers
npm run test:scraper blocket
npm run test:scraper tradera

# Monitor success rate
npm run scraper:stats
```

### User Flow Testing

1. Register new account
2. Select niche
3. Receive notification
4. Attempt unlock
5. Verify access control

---

## Deployment Checklist

### First Deployment (Day 1)

- [ ] Connect GitHub to Vercel
- [ ] Deploy to Vercel (free)
- [ ] Verify deployment works
- [ ] Keep in development mode

### Beta Deployment (Day 17)

- [ ] Enable limited API access
- [ ] Invite beta testers
- [ ] Monitor everything
- [ ] Keep payments mocked

### Production Deployment (Day 21+)

- [ ] Migrate to paid tiers
- [ ] Enable Swish payments
- [ ] Full monitoring active
- [ ] Support system ready

---

## Remember

1. **No features without price database**
2. **No paid services until launch**
3. **Accuracy over speed**
4. **Test everything locally first**
5. **Monitor scraper health constantly**

The price database is everything. Without it, the entire platform fails.
