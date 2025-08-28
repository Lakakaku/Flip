-- ============================================================================
-- MIGRATION 002: Row Level Security (RLS) Policies
-- ============================================================================
-- Implements comprehensive RLS policies for the hierarchical unlock system
-- and user data isolation as required by the Swedish marketplace platform
-- 
-- Run order: 002
-- Dependencies: 001_initial_schema.sql
-- ============================================================================

-- Enable RLS on all tables
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

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth.uid() = auth_id);

-- Users can update their own profile (not subscription tier - that's controlled by payments)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = auth_id)
    WITH CHECK (
        auth.uid() = auth_id AND
        -- Prevent users from changing their own subscription tier
        subscription_tier = OLD.subscription_tier AND
        -- Prevent users from modifying system fields
        id = OLD.id AND
        auth_id = OLD.auth_id AND
        created_at = OLD.created_at
    );

-- Service role can manage all users (for admin operations)
CREATE POLICY "Service role can manage users" ON users
    FOR ALL
    USING (
        COALESCE(current_setting('role', true), '') = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- ============================================================================
-- PRODUCT_PRICES TABLE POLICIES  
-- ============================================================================

-- Public read access for price database (needed for deal detection)
-- This is critical for the platform to function
CREATE POLICY "Public read access to product prices" ON product_prices
    FOR SELECT
    TO public
    USING (true);

-- Only service role can insert/update price data (from scrapers)
CREATE POLICY "Service role can manage product prices" ON product_prices
    FOR ALL
    USING (
        COALESCE(current_setting('role', true), '') = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- ============================================================================
-- PRICE_STATISTICS TABLE POLICIES
-- ============================================================================

-- Public read access to cached statistics (needed for deal detection)
CREATE POLICY "Public read access to price statistics" ON price_statistics
    FOR SELECT
    TO public
    USING (true);

-- Only service role can manage statistics
CREATE POLICY "Service role can manage price statistics" ON price_statistics
    FOR ALL
    USING (
        COALESCE(current_setting('role', true), '') = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- ============================================================================
-- LISTINGS TABLE POLICIES
-- ============================================================================

-- Public read access to active listings (needed for deal detection)
CREATE POLICY "Public read access to active listings" ON listings
    FOR SELECT
    TO public
    USING (status = 'active');

-- Only service role can manage listings (from scrapers and deal detection)
CREATE POLICY "Service role can manage listings" ON listings
    FOR ALL
    USING (
        COALESCE(current_setting('role', true), '') = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES - HIERARCHICAL ACCESS SYSTEM
-- ============================================================================

-- Users can read their own notifications with tier-based access control
CREATE POLICY "Users can view own notifications with tier access" ON notifications
    FOR SELECT
    USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        (
            -- User can see unlocked notifications
            is_unlocked = true OR
            -- User can see notifications for their tier or lower
            CASE 
                WHEN tier_required = 'freemium' THEN true
                WHEN tier_required = 'silver' THEN (
                    SELECT subscription_tier IN ('silver', 'gold') 
                    FROM users WHERE auth_id = auth.uid()
                )
                WHEN tier_required = 'gold' THEN (
                    SELECT subscription_tier = 'gold' 
                    FROM users WHERE auth_id = auth.uid()
                )
                ELSE false
            END
        )
    );

-- Users can update their own notifications (mark as read, archive)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
    WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        -- Users can only update read/archive status, not content
        type = OLD.type AND
        title = OLD.title AND
        message = OLD.message AND
        listing_id = OLD.listing_id AND
        tier_required = OLD.tier_required
    );

-- Service role can manage all notifications
CREATE POLICY "Service role can manage notifications" ON notifications
    FOR ALL
    USING (
        COALESCE(current_setting('role', true), '') = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- ============================================================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Users can read their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT
    USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Service role can manage all transactions (for payment processing)
CREATE POLICY "Service role can manage transactions" ON transactions
    FOR ALL
    USING (
        COALESCE(current_setting('role', true), '') = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- ============================================================================
-- FLIPSQUADS TABLE POLICIES (Gold Tier Feature)
-- ============================================================================

-- Public can read public squads, members can read their squads
CREATE POLICY "FlipSquad read access" ON flipsquads
    FOR SELECT
    USING (
        squad_type = 'public' OR
        EXISTS (
            SELECT 1 FROM flipsquad_members fm
            JOIN users u ON u.id = fm.user_id
            WHERE fm.flipsquad_id = flipsquads.id
            AND u.auth_id = auth.uid()
            AND fm.status = 'active'
        )
    );

-- Only Gold tier users can create squads
CREATE POLICY "Gold users can create FlipSquads" ON flipsquads
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND subscription_tier = 'gold'
            AND is_active = true
        ) AND
        created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Squad founders and admins can update squads
CREATE POLICY "Squad admins can update FlipSquads" ON flipsquads
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM flipsquad_members fm
            JOIN users u ON u.id = fm.user_id
            WHERE fm.flipsquad_id = flipsquads.id
            AND u.auth_id = auth.uid()
            AND fm.role IN ('founder', 'admin')
            AND fm.status = 'active'
        )
    );

-- ============================================================================
-- FLIPSQUAD_MEMBERS TABLE POLICIES
-- ============================================================================

-- Members can read their own squad memberships
CREATE POLICY "Members can view FlipSquad memberships" ON flipsquad_members
    FOR SELECT
    USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM flipsquad_members fm2
            JOIN users u ON u.id = fm2.user_id
            WHERE fm2.flipsquad_id = flipsquad_members.flipsquad_id
            AND u.auth_id = auth.uid()
            AND fm2.status = 'active'
        )
    );

-- Users can join squads (if Gold tier)
CREATE POLICY "Gold users can join FlipSquads" ON flipsquad_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND subscription_tier = 'gold'
            AND is_active = true
        ) AND
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Squad admins can manage memberships
CREATE POLICY "Squad admins can manage members" ON flipsquad_members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM flipsquad_members fm
            JOIN users u ON u.id = fm.user_id
            WHERE fm.flipsquad_id = flipsquad_members.flipsquad_id
            AND u.auth_id = auth.uid()
            AND fm.role IN ('founder', 'admin')
            AND fm.status = 'active'
        )
    );

-- ============================================================================
-- USER_LISTINGS TABLE POLICIES (AutoLister - Gold Feature)
-- ============================================================================

-- Users can manage their own listings (Gold tier only)
CREATE POLICY "Gold users can manage own listings" ON user_listings
    FOR ALL
    USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND subscription_tier = 'gold'
            AND is_active = true
        )
    );

-- ============================================================================
-- SYSTEM_SETTINGS TABLE POLICIES
-- ============================================================================

-- Public can read public settings
CREATE POLICY "Public can read public settings" ON system_settings
    FOR SELECT
    USING (is_public = true);

-- Only service role can manage system settings
CREATE POLICY "Service role can manage system settings" ON system_settings
    FOR ALL
    USING (
        COALESCE(current_setting('role', true), '') = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- ============================================================================
-- HELPER FUNCTIONS FOR POLICY ENFORCEMENT
-- ============================================================================

-- Function to check if user has required subscription tier
CREATE OR REPLACE FUNCTION user_has_tier(required_tier TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid()
        AND is_active = true
        AND subscription_tier = 
            CASE required_tier
                WHEN 'freemium' THEN subscription_tier -- Any tier can access freemium content
                WHEN 'silver' THEN 
                    CASE WHEN subscription_tier IN ('silver', 'gold') THEN subscription_tier ELSE 'invalid' END
                WHEN 'gold' THEN 
                    CASE WHEN subscription_tier = 'gold' THEN subscription_tier ELSE 'invalid' END
                ELSE 'invalid'
            END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's subscription tier
CREATE OR REPLACE FUNCTION get_user_tier()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT subscription_tier
        FROM users
        WHERE auth_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can unlock notifications
CREATE OR REPLACE FUNCTION can_unlock_notification(notification_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier TEXT;
    required_tier TEXT;
    user_active BOOLEAN;
BEGIN
    -- Get user's current tier and active status
    SELECT subscription_tier, is_active INTO user_tier, user_active
    FROM users 
    WHERE auth_id = auth.uid();
    
    -- User must be active
    IF NOT user_active THEN
        RETURN false;
    END IF;
    
    -- Get notification's required tier
    SELECT tier_required INTO required_tier
    FROM notifications
    WHERE id = notification_id;
    
    -- Check tier hierarchy
    RETURN CASE
        WHEN required_tier = 'freemium' THEN true -- All tiers can unlock freemium
        WHEN required_tier = 'silver' THEN user_tier IN ('silver', 'gold')
        WHEN required_tier = 'gold' THEN user_tier = 'gold'
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record this migration
INSERT INTO schema_migrations (version, name) 
VALUES ('002', 'rls_policies') 
ON CONFLICT (version) DO NOTHING;