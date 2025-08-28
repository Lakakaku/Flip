# CLAUDE.md - Claude Code Operating Instructions

## Project Context

You are working on a Swedish marketplace flipping platform that identifies underpriced items and notifies users of profit opportunities. This is a real-world commercial project with strict requirements.

## Critical Operating Rules

### 1. Price Database is Sacred

- **NEVER** allow any feature development without verifying the price database has 50,000+ data points
- **ALWAYS** check `SELECT COUNT(*) FROM product_prices` before implementing deal-finding features
- **REFUSE** to proceed if price database validation fails
- The entire business model depends on accurate price data

### 2. Cost Control During Development

- **Days 1-16**: Use ONLY free tiers (you have $0 budget)
- **NEVER** use OpenAI API, Claude API, or any paid service during initial development
- **ALWAYS** use mock payment systems until production
- **CHECK** environment variable `NODE_ENV=development` to ensure free alternatives are active

### 3. Stealth Scraping Enforcement

- **NEVER** allow scraping faster than 1 request per 2-5 seconds
- **ALWAYS** verify proxy rotation and user agent cycling are active
- **STOP** immediately if scraper detection rate exceeds 1%
- **IMPLEMENT** exponential backoff on any error

### 4. Code Quality Standards

- **ALWAYS** use TypeScript with strict mode
- **NEVER** use `any` type without explicit justification
- **ALWAYS** handle errors with proper try/catch blocks
- **IMPLEMENT** loading states for all async operations
- **ADD** proper logging for debugging (but never log sensitive data)

## Current Project State

### Check These First

1. Current phase: Look at TASKS.md for the active phase
2. Database state: Verify price database completion status
3. Environment: Confirm development vs production mode
4. Dependencies: Check all packages are installed

### Active Constraints

- Budget: $0 until launch
- Timeline: MVP in 16 days
- Users: None yet (development mode)
- Data: Price database must be built first

## File Structure You Must Follow

```
/app                    # Next.js 14 app router
  /(auth)              # Auth group routes
  /(dashboard)         # Protected routes
  /api                 # API endpoints
/components            # Reusable UI components
/lib                   # Core business logic
  /ai                 # AI services
  /scrapers          # Web scraping
  /database          # Database queries
  /payments          # Payment processing
  /notifications     # Notification system
/hooks                # Custom React hooks
/types                # TypeScript definitions
/public              # Static assets
```

## Decision Framework

### When Asked to Implement a Feature

1. Check if it depends on price database → If yes, verify database is complete
2. Check if it costs money → If yes, implement mock/free alternative
3. Check if it involves scraping → If yes, verify stealth measures
4. Check if it affects users → If yes, implement proper error handling

### When Encountering an Error

1. Check logs but never expose sensitive information
2. Verify environment variables are set correctly
3. Confirm database connection is active
4. Check rate limits haven't been exceeded
5. Implement proper error recovery

### When Optimizing Performance

1. Implement caching before adding more resources
2. Use database indexes before scaling database
3. Optimize images before adding CDN
4. Use lazy loading before code splitting

## Common Commands

```bash
# Development
npm run dev                    # Start development server
npm run scrape:prices         # Run price database collection
npm run test                  # Run test suite

# Database
npm run db:migrate            # Run migrations
npm run db:seed              # Seed test data
npm run db:validate          # Check price database

# Production (DO NOT RUN during development)
npm run build                # Build for production
npm run start               # Start production server
```

## Integration Points

### Supabase

- Always use Row Level Security
- Implement proper indexes
- Use connection pooling
- Cache frequently accessed data

### Discord Bot

- Rate limit: 50 requests per second
- Always use embeds for rich messages
- Implement slash commands properly
- Handle reconnection automatically

### Web Scraping

- Each platform has different selectors - check platform-specific configs
- Always wait for network idle before extracting
- Implement human-like behavior
- Monitor success rates

## Error Messages to Show Users

### When Price Database Incomplete

"The platform is currently building its price database. This process ensures accurate profit calculations. Please check back in [X] hours."

### When Scraper Blocked

"We're experiencing technical difficulties accessing marketplace data. Our team has been notified."

### When Payment Fails

"Payment could not be processed. No charges have been made. Please try again."

## Testing Requirements

### Before Committing Code

1. Run `npm run lint`
2. Run `npm run type-check`
3. Run `npm test` for affected components
4. Verify no console.errors in browser
5. Check no sensitive data in logs

### Before Deploying

1. Price database has 50,000+ records
2. All scrapers tested and working
3. Payment system in mock mode
4. Environment variables set correctly
5. Database migrations run

## Emergency Procedures

### If Scrapers Get Blocked

1. Stop affected scraper immediately
2. Rotate to new proxy pool
3. Increase delays by 2x
4. Clear cookies and session data
5. Resume gradually with monitoring

### If Database Corrupted

1. Stop all write operations
2. Restore from latest backup
3. Validate data integrity
4. Rebuild price statistics
5. Resume only after validation

### If Users Report Wrong Profits

1. Disable notifications immediately
2. Audit price database for category
3. Recalculate all statistics
4. Verify confidence scores
5. Re-enable only with >90% confidence

## Remember

- This is a real business with real users (soon)
- Every notification affects someone's money
- Accuracy is more important than speed
- The price database is the foundation of everything
- Never compromise on data quality for features
