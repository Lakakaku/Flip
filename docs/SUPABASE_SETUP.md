# SUPABASE SETUP GUIDE - Swedish Marketplace Flipping Platform

This document provides complete instructions for setting up Supabase for the Swedish marketplace flipping platform. This setup is **CRITICAL** and must be completed before any other functionality can be implemented.

## Prerequisites

- Free Supabase account (supabase.com)
- Access to project environment variables
- Basic understanding of SQL and PostgreSQL

## Phase 0.2 Requirements

This setup fulfills the following critical requirements from TASKS.md Phase 0.2:
- ✅ Free-tier Supabase project creation
- ✅ Complete database schema implementation
- ✅ Row Level Security (RLS) policies
- ✅ Performance-optimized database indexes
- ✅ TypeScript client integration

## Step 1: Create Free Supabase Project

### 1.1 Account Setup
1. Visit [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project" on the dashboard
3. Choose the following settings:
   - **Project Name**: `flip-platform-dev` (for development)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: `Europe (eu-central-1)` (closest to Sweden)
   - **Pricing Plan**: Free ($0/month)

### 1.2 Project Configuration
4. Wait for project initialization (2-3 minutes)
5. Navigate to Project Settings → API
6. Copy the following values (you'll need these for environment variables):
   - **Project URL**: `https://[project-ref].supabase.co`
   - **API Keys**:
     - `anon` key (public key)
     - `service_role` key (private key - keep secure!)

### 1.3 Database Access
7. Navigate to SQL Editor in your Supabase dashboard
8. You'll use this to run the database schema and migration scripts

## Step 2: Environment Variables Setup

Create or update your `.env.local` file with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=eyJhbG[your-service-role-key]

# Database Configuration  
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Environment
NODE_ENV=development
```

**CRITICAL SECURITY NOTE**: 
- Never commit service role keys to version control
- The anon key is safe for client-side use
- Add `.env.local` to your `.gitignore`

## Step 3: Database Schema Implementation

### 3.1 Run Initial Schema
1. Open Supabase SQL Editor
2. Copy and paste the complete schema from `/lib/database/schema.sql`
3. Execute the schema (creates all tables, indexes, and RLS policies)

### 3.2 Verify Schema
Run this query to verify all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- `users`
- `product_prices`
- `listings`
- `notifications` 
- `transactions`
- `flipsquads`
- `flipsquad_members`
- `user_listings`
- `price_statistics`

## Step 4: Row Level Security (RLS) Verification

### 4.1 Check RLS Status
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = t` (true).

### 4.2 Test RLS Policies
The setup includes policies for:
- User data isolation (users can only see their own data)
- Subscription tier access controls
- Hierarchical unlock system (Gold > Silver > Freemium)
- Public read access for product prices (needed for deal detection)

## Step 5: Performance Optimization

### 5.1 Verify Indexes
```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Critical indexes include:
- `idx_product_prices_category_price` - For deal detection queries
- `idx_product_prices_created_at` - For time-based queries
- `idx_listings_marketplace_created` - For marketplace scraping
- `idx_notifications_user_created` - For user notifications
- `idx_users_email` - For authentication
- `idx_users_subscription_tier` - For access control

### 5.2 Performance Test
```sql
-- Test price database query performance (should be <100ms)
EXPLAIN ANALYZE 
SELECT AVG(price), COUNT(*) 
FROM product_prices 
WHERE category = 'electronics' 
AND created_at > NOW() - INTERVAL '30 days';
```

## Step 6: Authentication Setup

### 6.1 Configure Auth Settings
1. Navigate to Authentication → Settings
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`
   - **Email Templates**: Customize if needed (optional for development)

### 6.2 User Registration Settings
- **Enable email confirmations**: OFF (for development ease)
- **Enable phone confirmations**: OFF
- **Email auth**: ON
- **Phone auth**: OFF (not needed for MVP)

## Step 7: Realtime Setup (For Notifications)

### 7.1 Enable Realtime
1. Navigate to Database → Replication
2. Enable realtime for these tables:
   - `notifications` (for real-time notification updates)
   - `listings` (for real-time deal updates)
   - `flipsquad_members` (for team collaboration)

### 7.2 Test Realtime Connection
```javascript
// Test in browser console after client setup
const { data, error } = await supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications'
  }, (payload) => {
    console.log('New notification:', payload);
  })
  .subscribe();
```

## Step 8: Testing and Validation

### 8.1 Database Connection Test
Run in your application:
```bash
npm run dev
```
Visit `http://localhost:3000/api/health` - should show database connection status.

### 8.2 Critical Validation Checklist
- [ ] All 9 required tables created
- [ ] RLS enabled on all tables  
- [ ] All indexes created successfully
- [ ] Environment variables configured
- [ ] Authentication working
- [ ] Realtime subscriptions active
- [ ] API health check passes

### 8.3 Price Database Preparation
**CRITICAL**: Before implementing any deal-finding features, verify:
```sql
SELECT COUNT(*) FROM product_prices;
-- Must return 50,000+ before Phase 2 can begin
```

## Step 9: Development vs Production

### 9.1 Free Tier Limits (Development)
- **Database Size**: 500MB (sufficient for 500K+ price records)
- **Monthly Active Users**: 50,000 (far exceeds development needs)
- **Database Requests**: 100GB egress (more than enough)
- **Realtime Connections**: 200 concurrent (perfect for development)
- **API Requests**: 2.5 million per month

### 9.2 Production Migration (Future)
When moving to production:
- Upgrade to Pro Plan ($25/month)
- Update environment variables
- Run production migrations
- Enable backups and monitoring

## Step 10: Security Best Practices

### 10.1 Development Security
- Use RLS policies even in development
- Never log sensitive data
- Rotate keys if compromised
- Use environment variables for all secrets

### 10.2 Database Security
- All user operations go through RLS
- No direct database access from frontend
- Service role key only used in API routes
- Input validation on all operations

## Troubleshooting Common Issues

### Issue: "relation does not exist"
**Solution**: Re-run the schema creation script in SQL Editor

### Issue: "RLS policy violation"  
**Solution**: Check that user is authenticated and policies are correct

### Issue: "Database connection failed"
**Solution**: Verify environment variables and project URL

### Issue: "Slow query performance"
**Solution**: Check that indexes are created and analyze query plans

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Project CLAUDE.md](./CLAUDE.md) for project-specific requirements
- [Project TASKS.md](./TASKS.md) for implementation phases

## Next Steps

After completing this setup:
1. Mark Phase 0.2 as complete in TASKS.md
2. Proceed to Phase 0.3 (Authentication System)
3. **Do NOT proceed to Phase 1** until price database has 50,000+ records

---

**Remember**: This database setup is the foundation of the entire platform. Without proper implementation, no other features will work correctly. Take time to verify each step thoroughly.