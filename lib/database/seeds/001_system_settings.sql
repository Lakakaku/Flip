-- ============================================================================
-- SEED 001: System Settings
-- ============================================================================
-- Basic system configuration and settings for the Swedish marketplace platform
-- ============================================================================

-- Basic system configuration
INSERT INTO system_settings (key, value, description, data_type, is_public) VALUES
('platform_name', 'FlipSverige', 'Platform display name', 'string', true),
('platform_version', '1.0.0', 'Current platform version', 'string', true),
('maintenance_mode', 'false', 'Enable maintenance mode', 'boolean', false),
('max_notifications_per_user', '1000', 'Maximum notifications per user', 'integer', false),

-- Price database settings
('price_db_min_records', '50000', 'Minimum price records required for operation', 'integer', false),
('price_cache_ttl_hours', '2', 'Price statistics cache TTL in hours', 'integer', false),
('confidence_score_threshold', '0.7', 'Minimum confidence score for deals', 'decimal', false),

-- Scraping configuration
('scraping_delay_min_ms', '2000', 'Minimum delay between scraper requests', 'integer', false),
('scraping_delay_max_ms', '5000', 'Maximum delay between scraper requests', 'integer', false),
('scraping_max_retries', '3', 'Maximum retry attempts for failed requests', 'integer', false),
('scraping_timeout_ms', '30000', 'Request timeout in milliseconds', 'integer', false),

-- Notification settings
('notification_batch_size', '100', 'Number of notifications to process per batch', 'integer', false),
('notification_retry_hours', '24', 'Hours to retry failed notifications', 'integer', false),

-- Subscription tier limits
('freemium_max_notifications', '5', 'Max notifications for freemium tier', 'integer', false),
('silver_max_notifications', '50', 'Max notifications for silver tier', 'integer', false),
('gold_max_notifications', '-1', 'Max notifications for gold tier (-1 = unlimited)', 'integer', false),

-- Unlock pricing (in SEK)
('freemium_unlock_percentage', '10', 'Unlock cost percentage for freemium users', 'decimal', false),
('silver_unlock_percentage', '5', 'Unlock cost percentage for silver users', 'decimal', false),
('gold_unlock_percentage', '5', 'Unlock cost percentage for gold users', 'decimal', false),

-- Deal detection thresholds
('min_profit_amount', '50', 'Minimum profit amount in SEK to create notification', 'decimal', false),
('min_profit_percentage', '15', 'Minimum profit percentage to create notification', 'decimal', false),
('high_value_threshold', '500', 'Profit threshold for high-value deals (Gold tier)', 'decimal', false),
('medium_value_threshold', '200', 'Profit threshold for medium-value deals (Silver tier)', 'decimal', false),

-- Regional settings
('default_country', 'Sweden', 'Default country for the platform', 'string', true),
('default_currency', 'SEK', 'Default currency', 'string', true),
('default_language', 'sv', 'Default language code', 'string', true),
('default_timezone', 'Europe/Stockholm', 'Default timezone', 'string', true),

-- Marketplace settings
('enabled_marketplaces', '["tradera", "blocket"]', 'List of enabled marketplaces', 'json', true),
('marketplace_weights', '{"tradera": 1.0, "blocket": 0.9, "facebook": 0.8}', 'Confidence weights for marketplaces', 'json', false),

-- Feature flags
('feature_discord_notifications', 'true', 'Enable Discord notifications', 'boolean', true),
('feature_flipsquads', 'true', 'Enable FlipSquad feature', 'boolean', true),
('feature_autolister', 'true', 'Enable AutoLister feature', 'boolean', true),
('feature_price_setter', 'false', 'Enable PriceSetter feature (future)', 'boolean', true),

-- API rate limits
('api_rate_limit_per_minute', '60', 'API requests per minute per user', 'integer', false),
('api_rate_limit_per_hour', '1000', 'API requests per hour per user', 'integer', false),

-- Image processing
('max_image_size_mb', '10', 'Maximum image upload size in MB', 'integer', false),
('max_images_per_listing', '8', 'Maximum images per listing', 'integer', false),

-- Performance settings
('query_timeout_ms', '10000', 'Database query timeout in milliseconds', 'integer', false),
('max_concurrent_scrapers', '5', 'Maximum concurrent scraper instances', 'integer', false),

-- Support and contact
('support_email', 'support@flipsverige.se', 'Support contact email', 'string', true),
('contact_discord', 'https://discord.gg/flipsverige', 'Discord server invite', 'string', true)

ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();