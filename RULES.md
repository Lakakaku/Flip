# RULES.md - Development Guidelines & Best Practices

## Critical Rules - NEVER VIOLATE

### Rule 1: Price Database First

- **NEVER** implement deal-finding features without a complete price database
- **NEVER** send notifications without confident price data (confidence > 0.6)
- **NEVER** estimate profits without real market data
- **MINIMUM** 50,000 price points required before any user-facing features
- **ALWAYS** validate price data quality before using it

### Rule 2: Stealth Scraping

- **NEVER** scrape faster than 1 request per 2-5 seconds per platform
- **ALWAYS** use random delays between requests (2-10 seconds)
- **ALWAYS** rotate user agents and use proxy rotation
- **NEVER** scrape unnecessary data (only user niches + price database)
- **ALWAYS** implement exponential backoff on errors

### Rule 3: Cost Control During Development

- **Days 1-16**: Use ONLY free tiers (Supabase free, Vercel hobby, local AI)
- **NEVER** use OpenAI API during initial development
- **ALWAYS** use mock payment systems until production
- **ALWAYS** use Discord for notifications (free) during development
- **ONLY** upgrade to paid tiers when you have paying customers

### Rule 4: Data Security

- **ALWAYS** encrypt user platform credentials
- **NEVER** log sensitive information
- **ALWAYS** use environment variables for secrets
- **NEVER** commit credentials to git
- **ALWAYS** implement GDPR compliance from start

### Rule 5: Hierarchical Access

- **Freemium** unlocks remain visible to Silver and Gold
- **Silver** unlocks hide listing from ALL Freemium and other Silver users
- **Gold** unlocks hide listing from EVERYONE
- **NEVER** remove access from users who already unlocked
- **ALWAYS** preserve existing unlock access

## Development Best Practices

### Code Organization

```
/app              # Next.js app router pages
/components       # Reusable UI components
/lib              # Core business logic
  /ai            # AI and ML functions
  /scrapers      # Web scraping logic
  /payments      # Payment processing
  /notifications # Notification system
  /database      # Database queries
/hooks           # Custom React hooks
/types           # TypeScript definitions
/utils           # Utility functions
```

### Database Queries

- **ALWAYS** use prepared statements
- **ALWAYS** implement proper indexing
- **NEVER** use SELECT \* in production
- **ALWAYS** limit query results
- **IMPLEMENT** connection pooling

### Error Handling

```typescript
// ALWAYS wrap risky operations
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', { error, context });
  return { success: false, error: error.message };
}
```

### Scraping Patterns

```typescript
// ALWAYS implement these patterns
class Scraper {
  async scrape() {
    // 1. Check rate limits
    await this.checkRateLimit();

    // 2. Random delay
    await this.randomDelay(2000, 5000);

    // 3. Rotate identity
    this.rotateUserAgent();
    this.rotateProxy();

    // 4. Try with exponential backoff
    return await this.withRetry(async () => {
      // Actual scraping logic
    });
  }
}
```

### AI Integration Rules

```typescript
// Development: Use FREE alternatives
if (process.env.NODE_ENV === 'development') {
  // Use TensorFlow.js, Ollama, or mock responses
  return await this.localAIAnalysis(data);
}

// Production: Use paid APIs sparingly
return await this.openAIAnalysis(data);
```

### Testing Requirements

- **Unit tests** for all profit calculations
- **Integration tests** for payment flows
- **Load tests** for scrapers
- **Manual testing** for UI flows
- **Beta testing** with real users before launch

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `test/*` - Experimental code

### Commit Messages

```
feat: Add price database validation
fix: Correct profit calculation for auctions
chore: Update dependencies
docs: Add API documentation
test: Add scraper integration tests
refactor: Optimize database queries
```

### Pre-commit Checklist

- [ ] No hardcoded credentials
- [ ] All tests passing
- [ ] Linting passes
- [ ] Types are correct
- [ ] Documentation updated

## Performance Guidelines

### Frontend

- **Lazy load** all heavy components
- **Use suspense** for data fetching
- **Implement** virtual scrolling for long lists
- **Optimize** images with next/image
- **Cache** API responses appropriately

### Backend

- **Index** all frequently queried columns
- **Paginate** all list endpoints
- **Cache** price statistics for 2 hours
- **Queue** heavy operations
- **Rate limit** all public endpoints

### Database

```sql
-- ALWAYS create these indexes
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_prices_product ON product_prices(product_name);
```

## Monitoring & Logging

### What to Log

- All errors with full context
- Successful payment transactions
- Failed scraping attempts
- User unlock actions
- System health metrics

### What NOT to Log

- User passwords or credentials
- Full credit card numbers
- Personal identification numbers
- Detailed scraping patterns
- Internal system architecture

## Security Checklist

### Authentication

- [ ] Implement proper session management
- [ ] Use secure password hashing (bcrypt)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add 2FA for admin accounts
- [ ] Log all authentication attempts

### Data Protection

- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS everywhere
- [ ] Implement CSRF protection
- [ ] Sanitize all user inputs
- [ ] Validate all API inputs

### Platform Credentials

- [ ] Encrypt with user-specific keys
- [ ] Never log in plaintext
- [ ] Implement secure key rotation
- [ ] Use separate encryption for each platform
- [ ] Allow users to revoke access

## Launch Checklist

### Before Beta

- [ ] Price database has 50,000+ points
- [ ] All scrapers tested and working
- [ ] Mock payment system functional
- [ ] Basic UI complete and responsive
- [ ] Authentication working properly

### Before Soft Launch

- [ ] Migrate to paid hosting tiers
- [ ] Set up real payment processing
- [ ] Complete security audit
- [ ] Implement monitoring and alerts
- [ ] Prepare customer support system

### Before Full Launch

- [ ] Load testing completed
- [ ] Backup systems in place
- [ ] Legal documents ready
- [ ] Marketing materials prepared
- [ ] Team trained on support

## Emergency Procedures

### If Scrapers Get Blocked

1. Stop affected scraper immediately
2. Rotate to new proxy pool
3. Increase delays by 2x
4. Implement new stealth measures
5. Resume gradually with monitoring

### If Price Database Corrupted

1. Stop all notifications immediately
2. Restore from latest backup
3. Validate data integrity
4. Rebuild affected segments
5. Resume only after validation

### If Payment System Fails

1. Log all failed transactions
2. Switch to manual processing
3. Notify affected users
4. Process refunds if needed
5. Document for reconciliation

## Support Priorities

### P0 - Critical (Fix immediately)

- Payment system down
- Data breach suspected
- All scrapers blocked
- Database corruption
- Site completely down

### P1 - High (Fix within 2 hours)

- Login system broken
- Notifications not sending
- Individual scraper down
- Price calculations wrong
- Major UI bug

### P2 - Medium (Fix within 24 hours)

- Minor UI issues
- Performance degradation
- Non-critical features broken
- Documentation errors

### P3 - Low (Fix within week)

- Enhancement requests
- Minor text changes
- Style improvements
- Nice-to-have features

## Remember

**The price database is the foundation of everything. Without accurate price data, the entire platform fails. Never compromise on data quality for speed.**
