-- ============================================================================
-- SEED 002: Sample Development Data
-- ============================================================================
-- Sample data for development and testing of the Swedish marketplace platform
-- This data helps developers test features before the price database is complete
-- ============================================================================

-- Sample categories for development
INSERT INTO system_settings (key, value, description, data_type, is_public) VALUES
('sample_categories', '[
    "electronics",
    "clothing",
    "home_garden",
    "sports_recreation",
    "vehicles",
    "books_media",
    "collectibles",
    "tools",
    "furniture",
    "toys_games"
]', 'Sample product categories for development', 'json', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Sample price data (small set for development testing)
-- Note: In production, this will be replaced by scraped data
INSERT INTO product_prices (
    product_id, title, category, marketplace, price, marketplace_url,
    condition, seller_location, seller_region, confidence_score, 
    data_source, created_at
) VALUES
-- Electronics samples
('dev_001', 'iPhone 13 Pro 256GB Blå', 'electronics', 'tradera', 8500.00, 'https://tradera.com/dev/001', 
 'very_good', 'Stockholm', 'Stockholm', 0.9, 'seed', NOW() - INTERVAL '5 days'),
('dev_002', 'Samsung Galaxy S21 128GB', 'electronics', 'blocket', 6200.00, 'https://blocket.se/dev/002',
 'good', 'Göteborg', 'Västra Götaland', 0.8, 'seed', NOW() - INTERVAL '3 days'),
('dev_003', 'iPad Air 64GB WiFi', 'electronics', 'tradera', 4800.00, 'https://tradera.com/dev/003',
 'very_good', 'Malmö', 'Skåne', 0.85, 'seed', NOW() - INTERVAL '7 days'),
('dev_004', 'MacBook Air M1 256GB', 'electronics', 'blocket', 9500.00, 'https://blocket.se/dev/004',
 'good', 'Stockholm', 'Stockholm', 0.9, 'seed', NOW() - INTERVAL '2 days'),
('dev_005', 'AirPods Pro 2nd Gen', 'electronics', 'tradera', 1800.00, 'https://tradera.com/dev/005',
 'new', 'Uppsala', 'Uppsala', 0.95, 'seed', NOW() - INTERVAL '1 day'),

-- Clothing samples  
('dev_006', 'Canada Goose Jacka Herr L', 'clothing', 'blocket', 3200.00, 'https://blocket.se/dev/006',
 'very_good', 'Stockholm', 'Stockholm', 0.8, 'seed', NOW() - INTERVAL '4 days'),
('dev_007', 'Nike Air Max 90 Stl 42', 'clothing', 'tradera', 850.00, 'https://tradera.com/dev/007',
 'good', 'Göteborg', 'Västra Götaland', 0.75, 'seed', NOW() - INTERVAL '6 days'),

-- Tools samples
('dev_008', 'Bosch GSR 120 Skruvdragare', 'tools', 'blocket', 450.00, 'https://blocket.se/dev/008',
 'good', 'Linköping', 'Östergötland', 0.85, 'seed', NOW() - INTERVAL '8 days'),
('dev_009', 'Makita DHP484 Borr/Skruvdragare', 'tools', 'tradera', 1250.00, 'https://tradera.com/dev/009',
 'very_good', 'Växjö', 'Kronoberg', 0.9, 'seed', NOW() - INTERVAL '2 days'),

-- Furniture samples
('dev_010', 'IKEA Karlby Bänkskiva 186cm', 'furniture', 'blocket', 800.00, 'https://blocket.se/dev/010',
 'good', 'Stockholm', 'Stockholm', 0.8, 'seed', NOW() - INTERVAL '5 days')

ON CONFLICT (marketplace_url) DO NOTHING;

-- Sample price statistics (normally calculated from real data)
INSERT INTO price_statistics (
    category, condition, avg_price, median_price, min_price, max_price,
    percentile_25, percentile_75, percentile_90, sample_count, 
    time_period, expires_at
) VALUES
('electronics', 'very_good', 5500.00, 4800.00, 1800.00, 12000.00, 3200.00, 8500.00, 10200.00, 250, 'last_30d', NOW() + INTERVAL '2 hours'),
('electronics', 'good', 4200.00, 3800.00, 1200.00, 9500.00, 2500.00, 6200.00, 8000.00, 180, 'last_30d', NOW() + INTERVAL '2 hours'),
('clothing', 'very_good', 1800.00, 1500.00, 300.00, 5000.00, 800.00, 2500.00, 3800.00, 120, 'last_30d', NOW() + INTERVAL '2 hours'),
('tools', 'good', 750.00, 650.00, 200.00, 2500.00, 450.00, 1000.00, 1500.00, 85, 'last_30d', NOW() + INTERVAL '2 hours'),
('furniture', 'good', 1200.00, 900.00, 200.00, 4500.00, 500.00, 1500.00, 2800.00, 95, 'last_30d', NOW() + INTERVAL '2 hours')

ON CONFLICT (category, subcategory, condition, marketplace, region, time_period) DO NOTHING;

-- Sample listings (active deals for testing)
INSERT INTO listings (
    marketplace_id, marketplace, title, category, current_price, market_value,
    profit_potential, profit_percentage, confidence_score, status,
    notification_tier_required, location, region
) VALUES
-- High-value deal (Gold tier)
('listing_001', 'tradera', 'iPhone 14 Pro 512GB Defekt Skärm', 'electronics', 3500.00, 8000.00, 
 4500.00, 128.57, 0.85, 'active', 'gold', 'Stockholm', 'Stockholm'),

-- Medium-value deal (Silver tier)  
('listing_002', 'blocket', 'Dyson V11 Dammsugare Ej Testad', 'home_garden', 1800.00, 3500.00,
 1700.00, 94.44, 0.75, 'active', 'silver', 'Malmö', 'Skåne'),

-- Low-value deal (Freemium tier)
('listing_003', 'tradera', 'Nike Skor Storlek 43 Slitna', 'clothing', 200.00, 800.00,
 600.00, 300.00, 0.6, 'active', 'freemium', 'Göteborg', 'Västra Götaland'),

-- Time-sensitive auction
('listing_004', 'tradera', 'MacBook Pro 16" 2021 Batteri Problem', 'electronics', 6000.00, 12000.00,
 6000.00, 100.00, 0.8, 'active', 'gold', 'Uppsala', 'Uppsala'),

-- Another freemium deal
('listing_005', 'blocket', 'IKEA Skrivbord Linnmon Vit', 'furniture', 150.00, 400.00,
 250.00, 166.67, 0.7, 'active', 'freemium', 'Linköping', 'Östergötland')

ON CONFLICT (marketplace_id, marketplace) DO NOTHING;

-- Update listings with auction info for testing
UPDATE listings 
SET is_auction = true, 
    ends_at = NOW() + INTERVAL '2 hours',
    current_bid_count = 3
WHERE marketplace_id = 'listing_004';

-- Sample development users (for testing purposes only)
-- Note: These will be created when users actually register
INSERT INTO system_settings (key, value, description, data_type, is_public) VALUES
('sample_user_emails', '[
    "dev.freemium@example.com",
    "dev.silver@example.com", 
    "dev.gold@example.com",
    "admin@example.com"
]', 'Sample user emails for development testing', 'json', false)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Development API keys and tokens (mock data)
INSERT INTO system_settings (key, value, description, data_type, is_public, is_encrypted) VALUES
('dev_discord_webhook', 'https://discord.com/api/webhooks/dev/test', 'Development Discord webhook', 'string', false, true),
('dev_email_api_key', 'dev_email_key_12345', 'Development email API key', 'string', false, true),
('dev_sms_api_key', 'dev_sms_key_67890', 'Development SMS API key', 'string', false, true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;