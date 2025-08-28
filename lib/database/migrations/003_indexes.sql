-- ============================================================================
-- MIGRATION 003: Performance Indexes
-- ============================================================================
-- Creates strategic indexes for optimal query performance (<100ms target)
-- Specifically designed for the Swedish marketplace flipping platform workload
-- 
-- Run order: 003
-- Dependencies: 001_initial_schema.sql, 002_rls_policies.sql
-- ============================================================================

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Primary authentication lookup (CRITICAL - used on every request)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Email lookup for authentication
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);

-- Subscription tier filtering (used for access control)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier) WHERE is_active = true;

-- Active users with location data (for deal targeting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location_active 
ON users(location_city, location_region) 
WHERE is_active = true;

-- Last login tracking (for user engagement analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login 
ON users(last_login_at DESC) 
WHERE is_active = true;

-- ============================================================================
-- PRODUCT_PRICES TABLE INDEXES - CRITICAL FOR 50K+ RECORDS
-- ============================================================================

-- MOST CRITICAL INDEX: Category + price for deal detection
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_category_price 
ON product_prices(category, price, created_at DESC);

-- Marketplace + category combination (for platform-specific analysis)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_marketplace_category 
ON product_prices(marketplace, category, created_at DESC);

-- Title similarity search (using trigram for fuzzy matching)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_title_trgm 
ON product_prices USING gin(title gin_trgm_ops);

-- Brand + model lookup (for specific product matching)  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_brand_model 
ON product_prices(brand, model) 
WHERE brand IS NOT NULL AND model IS NOT NULL;

-- Condition-based price analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_condition_price 
ON product_prices(condition, category, price) 
WHERE condition IS NOT NULL;

-- Marketplace URL uniqueness and lookup
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_marketplace_url 
ON product_prices(marketplace_url);

-- Time-based queries (for recent price trends)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_created_at 
ON product_prices(created_at DESC);

-- Sold items analysis (for actual market data)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_sold_items 
ON product_prices(sold_at DESC, category, sold_price) 
WHERE sold_at IS NOT NULL;

-- Location-based price analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_location 
ON product_prices(seller_region, category, price) 
WHERE seller_region IS NOT NULL;

-- High confidence data for reliable statistics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_high_confidence 
ON product_prices(category, price, created_at DESC) 
WHERE confidence_score >= 0.8;

-- ============================================================================
-- PRICE_STATISTICS TABLE INDEXES - For cached query performance
-- ============================================================================

-- Primary lookup for statistics (category-based)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_price_stats_lookup 
ON price_statistics(category, subcategory, condition, marketplace, region, time_period);

-- Cache expiration cleanup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_stats_expires 
ON price_statistics(expires_at) 
WHERE expires_at < NOW();

-- Time period analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_stats_time_period 
ON price_statistics(time_period, category, updated_at DESC);

-- ============================================================================
-- LISTINGS TABLE INDEXES - Active deal detection
-- ============================================================================

-- Active listings for deal detection (MOST CRITICAL)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_active_deals 
ON listings(status, profit_potential DESC, confidence_score DESC, created_at DESC) 
WHERE status = 'active';

-- Marketplace + category active listings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_marketplace_category 
ON listings(marketplace, category, created_at DESC) 
WHERE status = 'active';

-- Location-based deal filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_location_active 
ON listings(region, location, profit_potential DESC) 
WHERE status = 'active';

-- Auction end time monitoring (for urgent notifications)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_auction_ending 
ON listings(ends_at ASC, is_auction) 
WHERE is_auction = true AND status = 'active' AND ends_at IS NOT NULL;

-- Notification tier requirement
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_notification_tier 
ON listings(notification_tier_required, profit_potential DESC) 
WHERE status = 'active' AND notification_sent = false;

-- Last check time (for scraper scheduling)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_last_checked 
ON listings(last_checked_at ASC) 
WHERE status = 'active';

-- ============================================================================
-- NOTIFICATIONS TABLE INDEXES - User experience critical
-- ============================================================================

-- User's notifications (MOST CRITICAL - accessed on every page load)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at DESC);

-- User notifications by tier and unlock status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_tier_unlock 
ON notifications(user_id, tier_required, is_unlocked, created_at DESC);

-- Unread notifications count (for badges)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_unread_count 
ON notifications(user_id, is_read) 
WHERE is_read = false;

-- Notification delivery status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_delivery 
ON notifications(delivery_status, scheduled_for ASC) 
WHERE delivery_status IN ('pending', 'failed');

-- Deal-specific notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_deal_reference 
ON notifications(listing_id, type) 
WHERE listing_id IS NOT NULL;

-- Priority and urgency for notification ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_priority_urgency 
ON notifications(user_id, priority, urgency_score DESC, created_at DESC) 
WHERE is_read = false;

-- ============================================================================
-- TRANSACTIONS TABLE INDEXES - Payment processing
-- ============================================================================

-- User transaction history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_history 
ON transactions(user_id, created_at DESC);

-- Transaction status processing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_status 
ON transactions(status, created_at ASC) 
WHERE status IN ('pending', 'failed');

-- Notification unlock transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_notification_unlock 
ON transactions(notification_id, type) 
WHERE type = 'unlock' AND notification_id IS NOT NULL;

-- Payment method analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_payment_method 
ON transactions(payment_method, status, created_at DESC) 
WHERE payment_method IS NOT NULL;

-- ============================================================================
-- FLIPSQUADS TABLE INDEXES - Team collaboration (Gold feature)
-- ============================================================================

-- Public squad discovery
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flipsquads_public_active 
ON flipsquads(squad_type, is_active, member_count DESC) 
WHERE squad_type = 'public' AND is_active = true;

-- Squad performance ranking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flipsquads_performance 
ON flipsquads(total_profit_made DESC, total_deals_found DESC) 
WHERE is_active = true;

-- Region-based squad search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flipsquads_regions 
ON flipsquads USING gin(focus_regions) 
WHERE is_active = true;

-- Category-based squad search  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flipsquads_categories 
ON flipsquads USING gin(focus_categories) 
WHERE is_active = true;

-- ============================================================================
-- FLIPSQUAD_MEMBERS TABLE INDEXES
-- ============================================================================

-- Squad membership lookup (for access control)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_flipsquad_members_unique 
ON flipsquad_members(flipsquad_id, user_id);

-- User's squads
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flipsquad_members_user 
ON flipsquad_members(user_id, status, joined_at DESC) 
WHERE status = 'active';

-- Squad member list with performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flipsquad_members_performance 
ON flipsquad_members(flipsquad_id, reputation_score DESC, deals_contributed DESC) 
WHERE status = 'active';

-- Squad admin lookup (for management operations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flipsquad_members_admins 
ON flipsquad_members(flipsquad_id, role, status) 
WHERE role IN ('founder', 'admin') AND status = 'active';

-- ============================================================================
-- USER_LISTINGS TABLE INDEXES - AutoLister (Gold feature)
-- ============================================================================

-- User's listings management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_listings_user_status 
ON user_listings(user_id, status, created_at DESC);

-- Published listings tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_listings_published 
ON user_listings(status, created_at DESC) 
WHERE status = 'published';

-- Platform publishing lookup (for cross-posting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_listings_platforms 
ON user_listings USING gin(published_on);

-- Price range analysis for user's listings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_listings_price_category 
ON user_listings(category, asking_price DESC) 
WHERE status IN ('published', 'sold');

-- ============================================================================
-- SYSTEM_SETTINGS TABLE INDEXES
-- ============================================================================

-- Settings key lookup (primary access pattern)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_system_settings_key 
ON system_settings(key);

-- Public settings access
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_settings_public 
ON system_settings(is_public, key) 
WHERE is_public = true;

-- ============================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ============================================================================

-- Deal detection mega-query (price + location + category + time)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deal_detection_composite 
ON product_prices(category, seller_region, price, created_at DESC) 
WHERE confidence_score >= 0.7;

-- User notification dashboard query
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_dashboard_composite 
ON notifications(user_id, is_read, tier_required, priority, created_at DESC);

-- Marketplace performance analysis  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_analysis_composite 
ON product_prices(marketplace, category, sold_at DESC, sold_price) 
WHERE sold_at IS NOT NULL;

-- Squad discovery with location and category preferences
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_squad_discovery_composite 
ON flipsquads(squad_type, is_active, member_count DESC, created_at DESC) 
WHERE squad_type = 'public' AND is_active = true;

-- ============================================================================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- ============================================================================

-- Only active, high-value deals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_high_value_active_deals 
ON listings(profit_potential DESC, confidence_score DESC, created_at DESC) 
WHERE status = 'active' AND profit_potential >= 100 AND confidence_score >= 0.8;

-- Only unread, high-priority notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_urgent_unread_notifications 
ON notifications(user_id, urgency_score DESC, created_at DESC) 
WHERE is_read = false AND priority IN ('high', 'urgent');

-- Only successful, recent transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_successful_recent_transactions 
ON transactions(user_id, amount DESC, created_at DESC) 
WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days';

-- ============================================================================
-- MAINTENANCE AND CLEANUP INDEXES
-- ============================================================================

-- Expired cache cleanup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cleanup_expired_cache 
ON price_statistics(expires_at) 
WHERE expires_at < NOW();

-- Old notification cleanup (for archiving)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cleanup_old_notifications 
ON notifications(created_at ASC, is_archived) 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Ended listings cleanup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cleanup_ended_listings 
ON listings(status, updated_at ASC) 
WHERE status IN ('ended', 'sold', 'removed') AND updated_at < NOW() - INTERVAL '7 days';

-- Record this migration
INSERT INTO schema_migrations (version, name) 
VALUES ('003', 'indexes') 
ON CONFLICT (version) DO NOTHING;