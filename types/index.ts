// Core platform types
export type User = {
  id: string;
  email: string;
  subscription_tier: 'freemium' | 'silver' | 'gold';
  created_at: string;
  updated_at: string;
  niches: string[];
  location?: string;
  notification_preferences?: NotificationPreferences;
};

export type NotificationPreferences = {
  discord_enabled: boolean;
  discord_user_id?: string;
  email_enabled: boolean;
  sms_enabled?: boolean;
  min_profit_margin: number;
  max_distance?: number;
};

export type ProductPrice = {
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
};

export type Listing = {
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
};

export type Notification = {
  id: string;
  user_id: string;
  listing_id: string;
  unlocked: boolean;
  unlock_price?: number;
  created_at: string;
  profit_estimate: number;
  confidence_score: number;
};

export type Transaction = {
  id: string;
  user_id: string;
  notification_id?: string;
  amount: number;
  type: 'unlock' | 'subscription' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'swish' | 'card' | 'other';
  created_at: string;
  processed_at?: string;
};

export type FlipSquad = {
  id: string;
  name: string;
  description: string;
  max_members: number;
  current_members: number;
  profit_split_method: 'equal' | 'contribution' | 'custom';
  created_by: string;
  created_at: string;
};

export type UserListing = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  platforms: MarketplacePlatform[];
  status: 'draft' | 'published' | 'sold' | 'archived';
  created_at: string;
  sold_at?: string;
  sold_price?: number;
};

// Supporting types
export type MarketplacePlatform =
  | 'tradera'
  | 'blocket'
  | 'facebook'
  | 'sellpy'
  | 'plick';

export type SellerInfo = {
  id?: string;
  name?: string;
  rating?: number;
  location?: string;
  member_since?: string;
};

export type PriceStatistics = {
  mean: number;
  median: number;
  mode?: number;
  std_dev: number;
  percentile_25: number;
  percentile_75: number;
  sample_size: number;
  confidence: number;
};

// API Response types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    page?: number;
    total?: number;
    limit?: number;
  };
};

// Error types
export class FlipPlatformError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'FlipPlatformError';
  }
}

// Scraper types
export type ScraperConfig = {
  platform: MarketplacePlatform;
  delay_min: number;
  delay_max: number;
  concurrent_requests: number;
  retry_attempts: number;
  proxy_enabled: boolean;
  user_agent_rotation: boolean;
};

export type ScrapingJob = {
  id: string;
  platform: MarketplacePlatform;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  error_message?: string;
  items_found: number;
};

// Component prop types
export interface ComponentBaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  confirmPassword: string;
  agreedToTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

// Dashboard types
export interface DashboardStats {
  totalDeals: number;
  totalProfit: number;
  successRate: number;
  activeNotifications: number;
}

// Subscription types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxNotifications: number;
  isPopular?: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan | null;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

// Analytics types
export interface AnalyticsData {
  period: string;
  dealsSeen: number;
  dealsUnlocked: number;
  averageProfit: number;
  topCategories: Array<{
    category: string;
    count: number;
    avgProfit: number;
  }>;
}

// Settings types
export interface UserSettings {
  notifications: NotificationPreferences;
  filters: {
    categories: string[];
    minProfitMargin: number;
    maxDistance: number;
    excludeKeywords: string[];
  };
  privacy: {
    shareStats: boolean;
    publicProfile: boolean;
  };
}

// FlipSquad types
export interface FlipSquadMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  contribution: number;
  permissions: string[];
}

export interface FlipSquadInvitation {
  id: string;
  squadId: string;
  inviterUserId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

// AI Service types
export interface AIAnalysisResult {
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  confidence: number;
  predictedValue: number;
  marketDemand: 'high' | 'medium' | 'low';
  risks: string[];
}

// Scraper result types
export interface ScrapedListing {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  location: string;
  url: string;
  marketplace: MarketplacePlatform;
  category: string;
  condition?: string;
  sellerId: string;
  postedAt: Date;
}

export interface ScrapingResult {
  listings: ScrapedListing[];
  totalFound: number;
  errors: string[];
  duration: number;
  success: boolean;
}

// Database query types
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  category?: string;
  marketplace?: MarketplacePlatform;
  minPrice?: number;
  maxPrice?: number;
  minProfit?: number;
  location?: string;
  condition?: string;
}

// Webhook types
export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: Date;
  signature: string;
}

// Environment types
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  DISCORD_WEBHOOK_URL?: string;
  OPENAI_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}
