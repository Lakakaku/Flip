// Core platform types
export interface User {
  id: string;
  email: string;
  subscription_tier: "freemium" | "silver" | "gold";
  created_at: string;
  updated_at: string;
  niches: string[];
  location?: string;
  notification_preferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  discord_enabled: boolean;
  discord_user_id?: string;
  email_enabled: boolean;
  sms_enabled?: boolean;
  min_profit_margin: number;
  max_distance?: number;
}

export interface ProductPrice {
  id: string;
  title: string;
  price: number;
  platform: MarketplacePlatform;
  category: string;
  condition?: string;
  sold_date: string;
  location?: string;
  image_urls?: string[];
  seller_info?: SellerInfo;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  platform: MarketplacePlatform;
  url: string;
  image_urls: string[];
  location?: string;
  seller_info: SellerInfo;
  estimated_profit: number;
  confidence_score: number;
  category: string;
  condition?: string;
  discovered_at: string;
  expires_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  listing_id: string;
  unlocked: boolean;
  unlock_price?: number;
  created_at: string;
  profit_estimate: number;
  confidence_score: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  notification_id?: string;
  amount: number;
  type: "unlock" | "subscription" | "refund";
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method: "swish" | "card" | "other";
  created_at: string;
  processed_at?: string;
}

export interface FlipSquad {
  id: string;
  name: string;
  description: string;
  max_members: number;
  current_members: number;
  profit_split_method: "equal" | "contribution" | "custom";
  created_by: string;
  created_at: string;
}

export interface UserListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  platforms: MarketplacePlatform[];
  status: "draft" | "published" | "sold" | "archived";
  created_at: string;
  sold_at?: string;
  sold_price?: number;
}

// Supporting types
export type MarketplacePlatform =
  | "tradera"
  | "blocket"
  | "facebook"
  | "sellpy"
  | "plick";

export interface SellerInfo {
  id?: string;
  name?: string;
  rating?: number;
  location?: string;
  member_since?: string;
}

export interface PriceStatistics {
  mean: number;
  median: number;
  mode?: number;
  std_dev: number;
  percentile_25: number;
  percentile_75: number;
  sample_size: number;
  confidence: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    page?: number;
    total?: number;
    limit?: number;
  };
}

// Error types
export class FlipPlatformError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "FlipPlatformError";
  }
}

// Scraper types
export interface ScraperConfig {
  platform: MarketplacePlatform;
  delay_min: number;
  delay_max: number;
  concurrent_requests: number;
  retry_attempts: number;
  proxy_enabled: boolean;
  user_agent_rotation: boolean;
}

export interface ScrapingJob {
  id: string;
  platform: MarketplacePlatform;
  url: string;
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  error_message?: string;
  items_found: number;
}
