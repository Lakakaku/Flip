-- ============================================================================
-- SWEDISH MARKETPLACE FLIPPING PLATFORM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This schema supports the hierarchical unlock system and price database
-- requirements specified in CLAUDE.md and TASKS.md Phase 0.2
-- 
-- CRITICAL REQUIREMENTS:
-- - Must support 50,000+ price records before Phase 2
-- - Implements hierarchical access (Gold > Silver > Freemium)
-- - Optimized for deal detection and notification queries
-- - Row Level Security (RLS) on all tables
-- - Strategic indexes for performance (<100ms queries)
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity searches
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- ============================================================================
-- USERS TABLE - Core user management with subscription tiers
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication (integrates with Supabase Auth)
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    
    -- Profile information
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    
    -- Subscription and access control
    subscription_tier TEXT NOT NULL DEFAULT 'freemium' 
        CHECK (subscription_tier IN ('freemium', 'silver', 'gold')),
    subscription_starts_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- User preferences
    preferred_language TEXT DEFAULT 'sv',
    timezone TEXT DEFAULT 'Europe/Stockholm',
    
    -- Location settings for deal detection
    location_city TEXT,
    location_region TEXT,
    max_distance_km INTEGER DEFAULT 50,
    
    -- Usage tracking
    last_login_at TIMESTAMPTZ,
    notification_count INTEGER DEFAULT 0,
    unlock_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PRODUCT_PRICES TABLE - Historical price data (CRITICAL: Must have 50K+ records)
-- ============================================================================

CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Product identification
    product_id TEXT NOT NULL, -- External marketplace product ID
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT,
    model TEXT,
    
    -- Pricing data
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- If item was reduced
    currency TEXT NOT NULL DEFAULT 'SEK',
    
    -- Market data
    marketplace TEXT NOT NULL CHECK (marketplace IN ('tradera', 'blocket', 'facebook', 'sellpy', 'plick')),
    marketplace_url TEXT NOT NULL UNIQUE, -- Prevents duplicate scraping
    
    -- Item condition and details
    condition TEXT CHECK (condition IN ('new', 'very_good', 'good', 'fair', 'poor')),
    item_age_months INTEGER,
    defects TEXT[],
    
    -- Location data
    seller_location TEXT,
    seller_region TEXT,
    shipping_cost DECIMAL(8,2),
    pickup_available BOOLEAN DEFAULT FALSE,
    
    -- Sales data (for sold items)
    sold_at TIMESTAMPTZ,
    sold_price DECIMAL(10,2),
    bid_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Data quality and confidence
    confidence_score DECIMAL(3,2) DEFAULT 0.8, -- 0.0 to 1.0
    data_source TEXT NOT NULL DEFAULT 'scraper',
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Image data
    image_urls TEXT[],
    primary_image_url TEXT,
    
    -- Timestamps
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    listing_created_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PRICE_STATISTICS TABLE - Cached calculations for performance
-- ============================================================================

CREATE TABLE price_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Grouping criteria
    category TEXT NOT NULL,
    subcategory TEXT,
    condition TEXT,
    marketplace TEXT,
    region TEXT,
    
    -- Statistical data
    avg_price DECIMAL(10,2),
    median_price DECIMAL(10,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    std_deviation DECIMAL(10,2),
    
    -- Percentiles for deal detection
    percentile_25 DECIMAL(10,2),
    percentile_75 DECIMAL(10,2),
    percentile_90 DECIMAL(10,2),
    
    -- Sample data
    sample_count INTEGER NOT NULL,
    last_sample_date TIMESTAMPTZ,
    
    -- Time period
    time_period TEXT NOT NULL DEFAULT 'all_time', -- 'last_7d', 'last_30d', 'last_90d', 'all_time'
    
    -- Cache management
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours'),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(category, subcategory, condition, marketplace, region, time_period)
);

-- ============================================================================
-- LISTINGS TABLE - Active deals and opportunities
-- ============================================================================

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- External references
    product_price_id UUID REFERENCES product_prices(id),
    marketplace_id TEXT NOT NULL, -- External ID
    marketplace TEXT NOT NULL,
    
    -- Deal detection data
    current_price DECIMAL(10,2) NOT NULL,
    market_value DECIMAL(10,2), -- Estimated value from price database
    profit_potential DECIMAL(10,2), -- Calculated profit opportunity
    profit_percentage DECIMAL(5,2), -- Percentage profit
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    
    -- Listing details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    condition TEXT,
    
    -- Location and logistics
    location TEXT,
    region TEXT,
    shipping_cost DECIMAL(8,2),
    pickup_available BOOLEAN DEFAULT FALSE,
    
    -- Time sensitivity
    ends_at TIMESTAMPTZ, -- For auctions
    is_auction BOOLEAN DEFAULT FALSE,
    current_bid_count INTEGER DEFAULT 0,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'ended', 'sold', 'removed', 'flagged')),
    
    -- Notification tracking
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_tier_required TEXT DEFAULT 'freemium'
        CHECK (notification_tier_required IN ('freemium', 'silver', 'gold')),
    
    -- Images
    image_urls TEXT[],
    primary_image_url TEXT,
    
    -- Timestamps
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS TABLE - User notifications with hierarchical access
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User reference
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    type TEXT NOT NULL CHECK (type IN ('deal', 'price_drop', 'auction_ending', 'system', 'flipsquad')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Deal reference (if applicable)
    listing_id UUID REFERENCES listings(id),
    
    -- Access control and hierarchical unlocks
    tier_required TEXT NOT NULL DEFAULT 'freemium'
        CHECK (tier_required IN ('freemium', 'silver', 'gold')),
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    unlock_cost DECIMAL(8,2), -- Cost paid to unlock (based on tier)
    
    -- Priority and urgency
    priority TEXT NOT NULL DEFAULT 'normal' 
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    urgency_score INTEGER DEFAULT 50, -- 0-100
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    
    -- Delivery tracking
    delivery_status TEXT DEFAULT 'pending'
        CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
    delivery_method TEXT[] DEFAULT '{}', -- ['web', 'discord', 'email', 'sms']
    
    -- Timestamps
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRANSACTIONS TABLE - Payment and unlock tracking
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User reference
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction details
    type TEXT NOT NULL CHECK (type IN ('unlock', 'subscription', 'refund')),
    amount DECIMAL(8,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'SEK',
    
    -- Payment method
    payment_method TEXT CHECK (payment_method IN ('swish', 'card', 'mock')),
    payment_reference TEXT, -- External payment ID
    
    -- Transaction content
    notification_id UUID REFERENCES notifications(id), -- For unlock transactions
    description TEXT NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Processing details
    processed_at TIMESTAMPTZ,
    failure_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FLIPSQUADS TABLE - Team collaboration (Gold tier feature)
-- ============================================================================

CREATE TABLE flipsquads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Squad details
    name TEXT NOT NULL,
    description TEXT,
    squad_type TEXT DEFAULT 'public' CHECK (squad_type IN ('public', 'private', 'invite_only')),
    
    -- Configuration
    max_members INTEGER DEFAULT 5,
    min_profit_share DECIMAL(5,2) DEFAULT 0.10, -- Minimum 10% profit sharing
    
    -- Location focus
    focus_regions TEXT[],
    focus_categories TEXT[],
    
    -- Squad stats
    member_count INTEGER DEFAULT 0,
    total_deals_found INTEGER DEFAULT 0,
    total_profit_made DECIMAL(12,2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Leadership
    created_by UUID NOT NULL REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FLIPSQUAD_MEMBERS TABLE - Squad membership tracking
-- ============================================================================

CREATE TABLE flipsquad_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    flipsquad_id UUID NOT NULL REFERENCES flipsquads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Membership details
    role TEXT NOT NULL DEFAULT 'member' 
        CHECK (role IN ('member', 'moderator', 'admin', 'founder')),
    
    -- Performance tracking
    deals_contributed INTEGER DEFAULT 0,
    profit_earned DECIMAL(10,2) DEFAULT 0,
    reputation_score INTEGER DEFAULT 50, -- 0-100
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
    
    -- Timestamps
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(flipsquad_id, user_id)
);

-- ============================================================================
-- USER_LISTINGS TABLE - AutoLister feature (Gold tier)
-- ============================================================================

CREATE TABLE user_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Owner
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Product details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    
    -- Pricing
    asking_price DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2), -- Reserve/minimum acceptable price
    currency TEXT NOT NULL DEFAULT 'SEK',
    
    -- Platform publishing
    published_on TEXT[] DEFAULT '{}', -- ['tradera', 'blocket', 'facebook']
    platform_ids JSONB DEFAULT '{}', -- {"tradera": "123", "blocket": "456"}
    
    -- Location
    pickup_location TEXT,
    shipping_available BOOLEAN DEFAULT TRUE,
    shipping_cost DECIMAL(8,2),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'sold', 'expired', 'removed')),
    
    -- Performance tracking
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    sold_price DECIMAL(10,2),
    sold_at TIMESTAMPTZ,
    
    -- Images
    image_urls TEXT[],
    primary_image_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM SETTINGS TABLE - Application configuration
-- ============================================================================

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Setting identification
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    
    -- Type information
    data_type TEXT NOT NULL DEFAULT 'string'
        CHECK (data_type IN ('string', 'integer', 'decimal', 'boolean', 'json')),
    
    -- Access control
    is_public BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flipsquads ENABLE ROW LEVEL SECURITY;
ALTER TABLE flipsquad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;