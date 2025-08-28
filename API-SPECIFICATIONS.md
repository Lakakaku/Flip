# API Specifications - Swedish Flipping Platform

**Version:** 1.0.0  
**Last Updated:** 2025-08-28  
**Environment:** Development (Mock Systems) → Production (Real Systems)

---

## Overview

This document specifies the complete API for the Swedish marketplace flipping platform. The platform identifies underpriced items across Swedish marketplaces (Tradera, Blocket, Facebook Marketplace, etc.) and notifies users of profit opportunities.

### Core Business Logic

- **Price Database First**: All profit calculations require 50,000+ historical price points
- **Dual Estimation Required**: Market value MUST combine price database analysis + AI image analysis
- **Hierarchical Access**: Gold > Silver > Freemium user access to deals
- **Stealth Operation**: Rate-limited scraping with anti-detection measures
- **Subscription Tiers**: Freemium (10% unlock fee of estimated market value), Silver (5% unlock fee of estimated market value, 3 niches), Gold (5% unlock fee of estimated market value, 4 niches + premium features)

### Base URLs

```
Development: http://localhost:3000/api
Staging:     https://flip-staging.vercel.app/api
Production:  https://flip.se/api
```

### Global Headers

```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-API-Version: 1.0.0
```

---

## Authentication & Security

### POST /auth/register

Register a new user account.

**Request:**

```typescript
interface RegisterRequest {
  email: string; // Valid email address
  password: string; // Min 8 characters, 1 uppercase, 1 number
  name: string; // Display name
  home_city: string; // Swedish city for location-based deals
  subscription_tier?: "freemium" | "silver" | "gold"; // Default: 'freemium'
}
```

**Response:**

```typescript
interface RegisterResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    home_city: string;
    subscription_tier: string;
    created_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
}
```

**Status Codes:**

- `201` - Created successfully
- `400` - Invalid input data
- `409` - Email already exists
- `422` - Validation errors

---

### POST /auth/login

Authenticate existing user.

**Request:**

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:**

```typescript
interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    home_city: string;
    subscription_tier: string;
    subscription_expires_at?: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
}
```

**Status Codes:**

- `200` - Login successful
- `401` - Invalid credentials
- `429` - Too many attempts (rate limited)

---

### POST /auth/refresh

Refresh JWT token using refresh token.

**Request:**

```typescript
interface RefreshRequest {
  refresh_token: string;
}
```

**Response:**

```typescript
interface RefreshResponse {
  success: boolean;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
}
```

---

### POST /auth/logout

Logout and invalidate tokens.

**Request:**

```typescript
interface LogoutRequest {
  refresh_token?: string; // Optional, will invalidate all sessions if not provided
}
```

**Response:**

```typescript
interface LogoutResponse {
  success: boolean;
  message: string;
}
```

---

### POST /auth/reset-password

Initiate password reset flow.

**Request:**

```typescript
interface ResetPasswordRequest {
  email: string;
}
```

**Response:**

```typescript
interface ResetPasswordResponse {
  success: boolean;
  message: string; // "Password reset email sent if account exists"
}
```

---

## Listings & Deals API

### GET /listings

Get active deals with filtering and pagination.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

```typescript
interface ListingsQuery {
  category?: string; // Filter by category
  location?: string; // City or region filter
  min_profit?: number; // Minimum profit in SEK
  max_price?: number; // Maximum item price
  platform?: "tradera" | "blocket" | "facebook" | "sellpy" | "plick";
  sort?: "profit_desc" | "profit_asc" | "created_desc" | "ends_soon";
  page?: number; // Default: 1
  limit?: number; // Default: 20, Max: 100
  user_niche_only?: boolean; // Default: true
}
```

**Response:**

```typescript
interface ListingsResponse {
  success: boolean;
  data: {
    listings: Array<{
      id: string;
      platform: string;
      external_id: string;
      url: string;
      title: string;
      price: number;
      shipping_price?: number;
      condition: string;
      category: string;
      location: string;
      images: string[];

      // Profit calculations (only if price database has sufficient data)
      market_value?: number;
      expected_profit?: number;
      profit_confidence?: number; // 0-1 scale
      profit_percentage?: number;

      // Auction specific
      is_auction: boolean;
      auction_ends_at?: string;
      current_bids?: number;

      // Access control
      locked_by_tier: boolean; // True if higher tier claimed it
      unlock_price?: number; // Unlock fee for this user's tier (% of estimated market value)
      already_unlocked: boolean; // User has already unlocked this

      created_at: string;
      updated_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `422` - Invalid query parameters
- `503` - Price database insufficient (< 50k records)

---

### GET /listings/{id}

Get detailed information for a single listing.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface ListingDetailResponse {
  success: boolean;
  data: {
    listing: {
      id: string;
      platform: string;
      external_id: string;
      url: string;
      title: string;
      description?: string;
      price: number;
      shipping_price?: number;
      condition: string;
      category: string;
      location: string;
      images: string[];

      // Seller information
      seller_info: {
        name?: string;
        rating?: number;
        location?: string;
        member_since?: string;
      };

      // Market analysis (only if unlocked or user has sufficient tier)
      // REQUIRES: 50k+ price database + AI image analysis
      market_analysis?: {
        market_value: number; // Calculated from price database + AI condition assessment
        expected_profit: number;
        profit_confidence: number; // Based on sample size + AI confidence
        comparable_sales: number; // Minimum 5 required for estimation
        confidence_reasons: string[];

        // Data sources breakdown
        price_database_analysis: {
          median_price: number;
          sample_size: number;
          confidence_score: number; // 0-1 based on sample size
        };

        ai_analysis: {
          condition_multiplier: number; // 0.3-1.2 based on AI assessment
          identified_defects: string[];
          authenticity_confidence: number;
          completeness_score: number;
        };

        price_history: Array<{
          date: string;
          price: number;
          platform: string;
        }>;
      };

      // Auction specific
      is_auction: boolean;
      auction_ends_at?: string;
      current_bids?: number;
      bid_history?: Array<{
        bid_amount: number;
        bid_time: string;
      }>;

      // Access control
      locked_by_tier: boolean;
      unlock_price?: number; // Unlock fee (% of estimated market value, not listing price)
      already_unlocked: boolean;
      can_unlock: boolean;
      unlock_counter: number; // How many users have unlocked this

      created_at: string;
      updated_at: string;
    };
  };
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `403` - Listing locked by higher tier
- `404` - Listing not found

---

### POST /listings/{id}/unlock

Unlock a listing to see full details and contact information.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface UnlockRequest {
  confirm_payment: boolean; // Must be true
  payment_method: "mock" | "swish"; // 'mock' during development
  // Note: unlock_price is calculated as percentage of estimated_market_value:
  // Freemium: 10% * estimated_market_value
  // Silver/Gold: 5% * estimated_market_value
}
```

**Response:**

```typescript
interface UnlockResponse {
  success: boolean;
  data: {
    unlock_details: {
      unlock_price: number;
      user_tier: string;
      transaction_id: string;
      unlocked_at: string;
    };
    listing_access: {
      full_url: string;
      seller_contact?: {
        phone?: string;
        email?: string;
        platform_message_url?: string;
      };
      market_analysis: {
        market_value: number;
        expected_profit: number;
        profit_confidence: number;
        comparable_sales: number;
        price_history: Array<{
          date: string;
          price: number;
          platform: string;
          condition?: string;
        }>;
      };
    };
    // Hierarchical access: This listing is now hidden from lower tier users
    access_impact: {
      hidden_from_tiers: string[]; // ['freemium'] or ['freemium', 'silver']
      preserved_access: string[]; // Users who already unlocked keep access
    };
  };
}
```

**Status Codes:**

- `200` - Unlock successful
- `400` - Invalid payment method or confirmation
- `401` - Unauthorized
- `402` - Payment required (insufficient funds/payment failed)
- `403` - Already locked by higher tier
- `409` - Already unlocked by user
- `503` - Price database insufficient for profit calculation

### Unlock Fee Calculation Logic

The unlock fee is calculated as a percentage of the **estimated market value**, not the listing price:

```typescript
interface UnlockFeeCalculation {
  listing_price: number; // What seller is asking (e.g., 500 SEK)
  estimated_market_value: number; // MUST combine: 1) Price database analysis + 2) AI image analysis (e.g., 800 SEK)
  expected_profit: number; // market_value - listing_price (300 SEK)

  // Unlock fee calculation by tier:
  freemium_unlock_fee: number; // 10% * 800 = 80 SEK
  silver_unlock_fee: number; // 5% * 800 = 40 SEK
  gold_unlock_fee: number; // 5% * 800 = 40 SEK

  // Net profit after unlock fee:
  freemium_net_profit: number; // 300 - 80 = 220 SEK
  silver_net_profit: number; // 300 - 40 = 260 SEK
  gold_net_profit: number; // 300 - 40 = 260 SEK
}
```

**Market Value Calculation Requirements:**

The estimated market value MUST be calculated using both data sources:

1. **Price Database Analysis** (Required: 50k+ historical records)
   - Median price of comparable sold items
   - Sample size confidence scoring
   - Condition-based price adjustments
   - Platform-specific pricing variations

2. **AI Image Analysis** (Required: Product identification + condition assessment)
   - Product identification (brand, model, category)
   - Condition assessment (defects, wear, authenticity)
   - Completeness verification (accessories, packaging)
   - Market demand indicators

**Combined Calculation Logic:**

```typescript
estimated_market_value =
  base_market_price * condition_multiplier * demand_factor;
// Where:
// base_market_price = median from price database (min 5 comparable sales)
// condition_multiplier = AI assessment (0.3-1.2 based on condition/defects)
// demand_factor = seasonal/trend adjustment (0.8-1.3)
```

**Why Market Value vs Listing Price?**

- Creates fair pricing based on actual item worth
- Aligns platform incentives with user success
- Prevents artificially low unlock fees on underpriced items
- Ensures platform revenue scales with deal quality
- Maintains accuracy through dual validation (data + AI)

---

## Notifications API

### GET /notifications

Get user's notification history.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

```typescript
interface NotificationsQuery {
  status?: "unread" | "read" | "all"; // Default: 'all'
  category?: string;
  page?: number; // Default: 1
  limit?: number; // Default: 50, Max: 200
}
```

**Response:**

```typescript
interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Array<{
      id: string;
      listing_id: string;
      user_tier: string;

      // Notification content
      title: string;
      message: string;
      category: string;
      expected_profit: number;
      confidence_score: number;

      // Status
      sent_at: string;
      viewed_at?: string;
      unlocked: boolean;
      unlocked_at?: string;

      // Quick access to listing info
      listing_preview: {
        title: string;
        price: number;
        platform: string;
        location: string;
        image_url?: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      unread_count: number;
    };
  };
}
```

---

### PATCH /notifications/{id}/read

Mark a notification as read.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface NotificationReadResponse {
  success: boolean;
  data: {
    notification_id: string;
    viewed_at: string;
  };
}
```

---

### WebSocket: Real-time Notifications

**Endpoint:** `wss://api.flip.se/ws/notifications`  
**Protocol:** Supabase Realtime

**Connection:**

```javascript
const supabase = createClient(url, key);
const channel = supabase
  .channel(`notifications:${userId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      // Handle new notification
      console.log("New deal found!", payload.new);
    },
  )
  .subscribe();
```

**Real-time Events:**

```typescript
interface NotificationEvent {
  event: "new_notification";
  data: {
    id: string;
    listing_id: string;
    title: string;
    message: string;
    expected_profit: number;
    confidence_score: number;
    sent_at: string;
  };
}
```

---

## User Management API

### GET /users/profile

Get current user's profile information.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface ProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      home_city: string;

      // Subscription info
      subscription_tier: "freemium" | "silver" | "gold";
      subscription_expires_at?: string;
      subscription_status: "active" | "expired" | "cancelled";

      // Usage statistics
      total_spent: number;
      total_profit: number;
      unlocks_this_month: number;
      successful_flips: number;

      // Settings
      notification_preferences: {
        email_enabled: boolean;
        discord_enabled: boolean;
        min_profit_threshold: number;
        max_notifications_per_day: number;
      };

      created_at: string;
      updated_at: string;
    };
  };
}
```

---

### PATCH /users/profile

Update user profile information.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface ProfileUpdateRequest {
  name?: string;
  home_city?: string;
  notification_preferences?: {
    email_enabled?: boolean;
    discord_enabled?: boolean;
    min_profit_threshold?: number;
    max_notifications_per_day?: number;
  };
}
```

**Response:**

```typescript
interface ProfileUpdateResponse {
  success: boolean;
  data: {
    updated_fields: string[];
    user: ProfileResponse["data"]["user"];
  };
}
```

---

### GET /users/niches

Get user's selected niches.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface NichesResponse {
  success: boolean;
  data: {
    niches: Array<{
      niche: string;
      priority: number;
      created_at: string;
    }>;
    limits: {
      max_niches: number; // 1 for freemium, 3 for silver, 4 for gold
      current_count: number;
    };
    available_niches: string[]; // All possible niches
  };
}
```

---

### POST /users/niches

Add a niche to user's interests.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface AddNicheRequest {
  niche: string; // Must be from available niches list
  priority?: number; // 1-10, default: 5
}
```

**Response:**

```typescript
interface AddNicheResponse {
  success: boolean;
  data: {
    niche: string;
    priority: number;
    created_at: string;
  };
  limits: {
    remaining_slots: number;
  };
}
```

**Status Codes:**

- `201` - Created successfully
- `400` - Invalid niche name
- `403` - Maximum niches reached for subscription tier
- `409` - Niche already exists for user

---

### DELETE /users/niches/{niche}

Remove a niche from user's interests.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface RemoveNicheResponse {
  success: boolean;
  message: string;
  data: {
    removed_niche: string;
    remaining_niches: number;
  };
}
```

---

## Subscription & Payment API

### GET /subscriptions/current

Get current subscription details.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface SubscriptionResponse {
  success: boolean;
  data: {
    subscription: {
      tier: "freemium" | "silver" | "gold";
      status: "active" | "expired" | "cancelled" | "past_due";
      expires_at?: string;
      created_at: string;

      // Tier benefits
      benefits: {
        unlock_fee_percentage: number; // 10% of market value (freemium), 5% of market value (silver/gold)
        max_niches: number; // 1, 3, 4
        features: string[]; // List of available features
      };

      // Usage
      current_period: {
        start_date: string;
        end_date: string;
        unlocks_used: number;
        amount_spent: number;
      };

      // Next payment (for paid tiers)
      next_payment?: {
        amount: number;
        currency: "SEK";
        due_date: string;
        payment_method: string;
      };
    };
  };
}
```

---

### POST /subscriptions/upgrade

Upgrade subscription tier.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface SubscriptionUpgradeRequest {
  target_tier: "silver" | "gold";
  payment_method: "mock" | "swish"; // 'mock' during development
  billing_cycle: "monthly" | "yearly";
}
```

**Response:**

```typescript
interface SubscriptionUpgradeResponse {
  success: boolean;
  data: {
    subscription: {
      tier: string;
      status: string;
      expires_at: string;
      next_payment: {
        amount: number;
        due_date: string;
      };
    };
    payment: {
      transaction_id: string;
      amount: number;
      currency: "SEK";
      status: "completed" | "pending" | "failed";
      payment_method: string;
    };
    tier_changes: {
      unlock_fee_reduction: string; // "10% → 5%" (of estimated market value)
      niche_increase: string; // "1 → 3 niches"
      new_features: string[]; // Features unlocked
    };
  };
}
```

**Pricing (SEK/month):**

- Silver: 199 SEK
- Gold: 399 SEK

**Status Codes:**

- `200` - Upgrade successful
- `400` - Invalid target tier or payment method
- `402` - Payment failed
- `409` - Already on target tier or higher

---

### POST /subscriptions/cancel

Cancel subscription (downgrade to freemium at period end).

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface CancelSubscriptionRequest {
  reason?: string; // Optional feedback
  immediate?: boolean; // Default: false (cancel at period end)
}
```

**Response:**

```typescript
interface CancelSubscriptionResponse {
  success: boolean;
  data: {
    cancellation: {
      effective_date: string;
      refund_amount?: number;
      new_tier: "freemium";
    };
    impact: {
      features_lost: string[];
      niche_limit_reduced: string; // "4 → 1 niches"
      unlock_fee_increased: string; // "5% → 10%" (of estimated market value)
    };
  };
}
```

---

## Premium Features API

### FlipSquad (Gold Only)

#### GET /flipsquads

Browse available FlipSquads.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

```typescript
interface FlipSquadsQuery {
  city?: string;
  niche?: string;
  recruiting_only?: boolean; // Default: true
  page?: number;
  limit?: number;
}
```

**Response:**

```typescript
interface FlipSquadsResponse {
  success: boolean;
  data: {
    squads: Array<{
      id: string;
      name: string;
      creator_name: string;
      city: string;
      niche: string;
      capital_requirement: number;
      current_members: number;
      max_members: number;
      is_recruiting: boolean;

      // Performance stats
      total_deals: number;
      total_profit: number;
      avg_profit_per_deal: number;
      success_rate: number; // Percentage

      created_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
```

---

#### POST /flipsquads

Create a new FlipSquad.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface CreateFlipSquadRequest {
  name: string; // Squad name
  city: string; // Primary city
  niche: string; // Primary niche
  capital_requirement: number; // Minimum capital per member
  max_members?: number; // Default: 4
  description?: string;
}
```

**Response:**

```typescript
interface CreateFlipSquadResponse {
  success: boolean;
  data: {
    squad: {
      id: string;
      name: string;
      creator_id: string;
      city: string;
      niche: string;
      capital_requirement: number;
      max_members: number;
      is_recruiting: boolean;
      created_at: string;
    };
    membership: {
      role: "creator";
      profit_share: number;
      joined_at: string;
    };
  };
}
```

**Status Codes:**

- `201` - Squad created successfully
- `400` - Invalid input data
- `403` - Gold tier required
- `409` - Squad name already exists in city

---

#### GET /flipsquads/{id}

Get detailed FlipSquad information.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface FlipSquadDetailResponse {
  success: boolean;
  data: {
    squad: {
      id: string;
      name: string;
      description?: string;
      creator_name: string;
      city: string;
      niche: string;
      capital_requirement: number;
      max_members: number;
      is_recruiting: boolean;

      // Members (only if user is member)
      members?: Array<{
        user_id: string;
        name: string;
        role: "creator" | "member";
        profit_share: number;
        joined_at: string;
      }>;

      // Recent activity
      recent_deals?: Array<{
        id: string;
        title: string;
        profit: number;
        handled_by: string;
        completed_at: string;
      }>;

      // Stats
      stats: {
        total_deals: number;
        total_profit: number;
        avg_profit_per_deal: number;
        deals_this_month: number;
        profit_this_month: number;
      };

      created_at: string;
    };
    user_membership?: {
      role: "creator" | "member" | null;
      profit_share?: number;
      can_apply: boolean;
      application_status?: "pending" | "approved" | "rejected";
    };
  };
}
```

---

#### POST /flipsquads/{id}/join

Apply to join a FlipSquad.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface JoinFlipSquadRequest {
  message?: string; // Application message
  capital_available: number; // Available capital amount
}
```

**Response:**

```typescript
interface JoinFlipSquadResponse {
  success: boolean;
  data: {
    application: {
      squad_id: string;
      status: "pending";
      message: string;
      capital_available: number;
      applied_at: string;
    };
    next_steps: string; // Information about approval process
  };
}
```

---

#### POST /flipsquads/{id}/messages

Send message to FlipSquad chat.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface SquadMessageRequest {
  message: string;
  type?: "text" | "deal_share" | "image";
  deal_id?: string; // If sharing a deal
  image_url?: string; // If sharing image
}
```

**Response:**

```typescript
interface SquadMessageResponse {
  success: boolean;
  data: {
    message: {
      id: string;
      squad_id: string;
      user_id: string;
      user_name: string;
      message: string;
      type: string;
      deal_id?: string;
      image_url?: string;
      sent_at: string;
    };
  };
}
```

---

### AutoLister (Gold Only)

#### POST /autolister/analyze

Analyze product images and description with AI.

**Headers:**

```http
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Request:**

```typescript
interface AnalyzeProductRequest {
  images: File[]; // 1-10 images
  description?: string; // Optional description
  category_hint?: string; // Optional category suggestion
}
```

**Response:**

```typescript
interface AnalyzeProductResponse {
  success: boolean;
  data: {
    analysis: {
      product_identification: {
        name: string;
        brand?: string;
        model?: string;
        category: string;
        subcategory?: string;
        confidence: number; // 0-1
      };
      condition_assessment: {
        overall_condition: "new" | "like_new" | "good" | "fair" | "poor";
        defects_detected: string[];
        condition_score: number; // 0-10
        notes: string[];
      };
      pricing_recommendations: {
        tradera: { min: number; max: number; optimal: number };
        blocket: { min: number; max: number; optimal: number };
        facebook: { min: number; max: number; optimal: number };
        confidence: number;
        based_on_samples: number;
      };
      generated_descriptions: {
        tradera: string; // Auction-optimized
        blocket: string; // Classified-optimized
        facebook: string; // Social-optimized
      };
      tags_suggested: string[];
      images_optimized: string[]; // Processed image URLs
    };
  };
}
```

**Status Codes:**

- `200` - Analysis successful
- `400` - Invalid files or too many images
- `403` - Gold tier required
- `422` - Images could not be processed

---

#### POST /autolister/create

Create listings across multiple platforms.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface CreateListingRequest {
  analysis_id: string; // From previous analyze call

  platforms: {
    tradera?: {
      title: string;
      description: string;
      starting_price: number;
      buyout_price?: number;
      category_id: string;
      duration_days: number; // 3, 5, 7, or 10
      shipping_cost: number;
    };
    blocket?: {
      title: string;
      description: string;
      price: number;
      category_id: string;
      location: string;
      delivery_options: string[];
    };
    facebook?: {
      title: string;
      description: string;
      price: number;
      category: string;
      location: string;
      delivery: boolean;
    };
  };

  auto_price_adjust: boolean; // Enable PriceSetter
  notification_preferences: {
    views_milestone: number[];
    inquiry_notification: boolean;
    price_adjustment_alerts: boolean;
  };
}
```

**Response:**

```typescript
interface CreateListingResponse {
  success: boolean;
  data: {
    listing_id: string;
    platform_results: {
      tradera?: {
        status: "success" | "failed";
        listing_url?: string;
        error?: string;
      };
      blocket?: {
        status: "success" | "failed";
        listing_url?: string;
        error?: string;
      };
      facebook?: {
        status: "success" | "failed";
        listing_url?: string;
        error?: string;
      };
    };
    successful_platforms: string[];
    failed_platforms: string[];
    total_reach: number; // Estimated total audience
  };
}
```

---

#### GET /autolister/listings

Get user's AutoLister managed listings.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

```typescript
interface AutoListerListingsQuery {
  status?: "active" | "sold" | "expired" | "all";
  platform?: string;
  page?: number;
  limit?: number;
}
```

**Response:**

```typescript
interface AutoListerListingsResponse {
  success: boolean;
  data: {
    listings: Array<{
      id: string;
      title: string;
      images: string[];
      status: "draft" | "active" | "sold" | "expired";

      // Platform presence
      platforms_listed: Array<{
        platform: string;
        url: string;
        status: "active" | "sold" | "expired";
        views: number;
        inquiries: number;
        current_price: number;
      }>;

      // Performance
      total_views: number;
      total_inquiries: number;
      best_offer?: number;

      // AI Analysis
      ai_analysis: {
        condition: string;
        market_value: number;
        confidence: number;
      };

      // PriceSetter status
      auto_price_adjust: boolean;
      last_price_adjustment?: string;

      created_at: string;
      updated_at: string;
      sold_at?: string;
      sold_price?: number;
    }>;

    summary: {
      active_listings: number;
      total_views_this_month: number;
      total_inquiries_this_month: number;
      sales_this_month: number;
      revenue_this_month: number;
    };
  };
}
```

---

#### PATCH /autolister/{id}/price

Update pricing for a listing (manual or PriceSetter).

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface UpdateListingPriceRequest {
  platforms: {
    tradera?: { price: number };
    blocket?: { price: number };
    facebook?: { price: number };
  };
  reason?: string; // Optional reason for price change
}
```

**Response:**

```typescript
interface UpdateListingPriceResponse {
  success: boolean;
  data: {
    listing_id: string;
    price_updates: Array<{
      platform: string;
      old_price: number;
      new_price: number;
      status: "success" | "failed";
      error?: string;
    }>;
    estimated_impact: {
      view_change_percentage: number;
      inquiry_change_percentage: number;
    };
  };
}
```

---

### PriceSetter (Gold Only)

#### GET /pricesetter/recommendations/{listing_id}

Get pricing recommendations for a listing.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface PriceRecommendationsResponse {
  success: boolean;
  data: {
    listing_id: string;
    current_prices: {
      tradera: number;
      blocket: number;
      facebook: number;
    };

    market_analysis: {
      similar_items_sold: number;
      average_sale_time: number; // days
      current_demand: "low" | "medium" | "high";
      seasonal_factor: number; // 0.8-1.2
      competition_level: "low" | "medium" | "high";
    };

    recommendations: {
      quick_sale: {
        tradera: number;
        blocket: number;
        facebook: number;
        expected_sale_days: number;
      };
      optimal: {
        tradera: number;
        blocket: number;
        facebook: number;
        expected_sale_days: number;
      };
      maximum_profit: {
        tradera: number;
        blocket: number;
        facebook: number;
        expected_sale_days: number;
      };
    };

    strategy_suggestions: string[];
    next_review_date: string;
  };
}
```

---

### FliCademy (All Tiers)

#### GET /flicademy/courses

Get available courses and user progress.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface CoursesResponse {
  success: boolean;
  data: {
    courses: Array<{
      id: string;
      title: string;
      description: string;
      level: "beginner" | "intermediate" | "advanced";
      category: string;
      estimated_duration: number; // minutes

      // Progress
      modules_total: number;
      modules_completed: number;
      progress_percentage: number;
      last_accessed?: string;

      // Access
      tier_required: "freemium" | "silver" | "gold";
      is_accessible: boolean;

      created_at: string;
    }>;

    user_stats: {
      courses_started: number;
      courses_completed: number;
      total_study_time: number; // minutes
      certificates_earned: number;
      current_streak: number; // days
    };
  };
}
```

---

#### GET /flicademy/courses/{id}

Get course content and modules.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface CourseDetailResponse {
  success: boolean;
  data: {
    course: {
      id: string;
      title: string;
      description: string;
      level: string;
      estimated_duration: number;

      modules: Array<{
        id: string;
        title: string;
        description: string;
        order: number;
        content_type: "text" | "video" | "interactive";
        estimated_duration: number;

        // Progress
        completed: boolean;
        completed_at?: string;

        // Access
        is_accessible: boolean;
        unlock_reason?: string; // Why locked
      }>;

      // Progress
      progress: {
        modules_completed: number;
        modules_total: number;
        percentage: number;
        time_spent: number;
        last_accessed: string;
      };
    };
  };
}
```

---

#### GET /flicademy/modules/{id}

Get module content.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Response:**

```typescript
interface ModuleContentResponse {
  success: boolean;
  data: {
    module: {
      id: string;
      title: string;
      content_type: string;

      content: {
        text?: string; // Markdown content
        video_url?: string; // Video URL
        interactive_data?: object; // Interactive content
      };

      // Learning objectives
      objectives: string[];

      // Assessment
      quiz?: {
        id: string;
        questions: Array<{
          id: string;
          question: string;
          type: "multiple_choice" | "true_false" | "text";
          options?: string[];
          correct_answer?: string; // Only after completion
        }>;
        passing_score: number;
        user_score?: number;
      };

      // Navigation
      previous_module?: { id: string; title: string };
      next_module?: { id: string; title: string };

      // Progress
      completed: boolean;
      completion_time?: string;
    };
  };
}
```

---

#### POST /flicademy/modules/{id}/complete

Mark module as completed and submit quiz if applicable.

**Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Request:**

```typescript
interface CompleteModuleRequest {
  time_spent: number; // seconds
  quiz_answers?: Record<string, string>; // question_id -> answer
}
```

**Response:**

```typescript
interface CompleteModuleResponse {
  success: boolean;
  data: {
    module_id: string;
    completed_at: string;
    time_spent: number;

    quiz_result?: {
      score: number;
      passing_score: number;
      passed: boolean;
      correct_answers: number;
      total_questions: number;
    };

    progress_update: {
      course_progress: number; // percentage
      modules_remaining: number;
      estimated_completion_time: number; // minutes
    };

    achievements?: Array<{
      id: string;
      title: string;
      description: string;
      earned_at: string;
    }>;
  };
}
```

---

## Admin Panel API

**Note:** All admin endpoints require admin role authentication.

### GET /admin/stats

Get platform statistics and metrics.

**Headers:**

```http
Authorization: Bearer {admin_jwt_token}
```

**Response:**

```typescript
interface AdminStatsResponse {
  success: boolean;
  data: {
    overview: {
      total_users: number;
      active_users_24h: number;
      total_subscriptions: number;
      monthly_recurring_revenue: number;
      total_transactions: number;
      total_profit_tracked: number;
    };

    subscription_breakdown: {
      freemium: number;
      silver: number;
      gold: number;
      conversion_rate: number; // freemium to paid
    };

    platform_health: {
      price_database_size: number;
      price_database_last_update: string;
      active_scrapers: number;
      scraping_success_rate: number; // last 24h
      avg_notification_latency: number; // seconds
    };

    business_metrics: {
      avg_unlock_price: number;
      avg_profit_per_unlock: number;
      user_satisfaction_score: number;
      churn_rate: number; // monthly
    };

    recent_activity: {
      new_signups_24h: number;
      unlocks_24h: number;
      revenue_24h: number;
      support_tickets_open: number;
    };
  };
}
```

---

### GET /admin/users

Get user management interface data.

**Headers:**

```http
Authorization: Bearer {admin_jwt_token}
```

**Query Parameters:**

```typescript
interface AdminUsersQuery {
  search?: string; // Email or name
  tier?: string; // Subscription tier filter
  status?: "active" | "suspended" | "banned";
  sort?: "created_desc" | "revenue_desc" | "activity_desc";
  page?: number;
  limit?: number;
}
```

**Response:**

```typescript
interface AdminUsersResponse {
  success: boolean;
  data: {
    users: Array<{
      id: string;
      email: string;
      name: string;
      home_city: string;
      subscription_tier: string;
      status: "active" | "suspended" | "banned";

      // Activity
      last_login: string;
      total_unlocks: number;
      total_spent: number;
      total_profit: number;

      // Flags
      support_tickets: number;
      suspicious_activity: boolean;
      payment_issues: boolean;

      created_at: string;
    }>;

    pagination: {
      page: number;
      limit: number;
      total: number;
    };

    summary: {
      total_users: number;
      active_users: number;
      suspended_users: number;
      high_value_users: number; // Gold tier
    };
  };
}
```

---

### POST /admin/scrapers/trigger

Manually trigger scraper operations.

**Headers:**

```http
Authorization: Bearer {admin_jwt_token}
```

**Request:**

```typescript
interface TriggerScrapersRequest {
  action: "start" | "stop" | "restart" | "priority_scan";
  platforms?: string[]; // Specific platforms
  categories?: string[]; // Specific categories
  emergency_mode?: boolean; // Skip rate limits (use carefully)
}
```

**Response:**

```typescript
interface TriggerScrapersResponse {
  success: boolean;
  data: {
    action_taken: string;
    affected_scrapers: Array<{
      platform: string;
      status: "started" | "stopped" | "restarted";
      queue_size: number;
      last_successful_scan: string;
    }>;
    estimated_completion: string;
    warnings?: string[]; // If emergency_mode used
  };
}
```

---

### GET /admin/health

Get system health and monitoring data.

**Headers:**

```http
Authorization: Bearer {admin_jwt_token}
```

**Response:**

```typescript
interface SystemHealthResponse {
  success: boolean;
  data: {
    overall_status: "healthy" | "warning" | "critical";

    services: {
      database: {
        status: "healthy" | "warning" | "critical";
        response_time: number; // ms
        connections: { active: number; max: number };
        last_backup: string;
      };

      scrapers: {
        status: "healthy" | "warning" | "critical";
        active_scrapers: number;
        success_rate_24h: number;
        blocked_proxies: number;
        queue_size: number;
      };

      payment_system: {
        status: "healthy" | "warning" | "critical";
        success_rate_24h: number;
        failed_transactions: number;
        last_successful_payment: string;
      };

      notifications: {
        status: "healthy" | "warning" | "critical";
        delivery_rate_24h: number;
        discord_bot_status: "online" | "offline";
        email_service_status: "healthy" | "degraded";
      };
    };

    alerts: Array<{
      id: string;
      severity: "low" | "medium" | "high" | "critical";
      component: string;
      message: string;
      created_at: string;
      acknowledged: boolean;
    }>;

    performance_metrics: {
      api_response_time_p95: number; // ms
      error_rate_24h: number; // percentage
      uptime_percentage: number;
      memory_usage: number; // percentage
      disk_usage: number; // percentage
    };
  };
}
```

---

## Error Handling

### Standard Error Response

All endpoints return errors in this format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string; // Machine-readable error code
    message: string; // Human-readable message
    details?: object; // Additional error context
    field_errors?: Record<string, string[]>; // Validation errors
  };
  request_id: string; // For support tracking
}
```

### Common Error Codes

#### Authentication Errors (401)

```typescript
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "message": "The provided authentication token is invalid or expired"
  },
  "request_id": "req_123abc"
}
```

#### Authorization Errors (403)

```typescript
{
  "success": false,
  "error": {
    "code": "TIER_INSUFFICIENT",
    "message": "Gold subscription required for this feature",
    "details": {
      "required_tier": "gold",
      "current_tier": "silver"
    }
  },
  "request_id": "req_456def"
}
```

#### Price Database Errors (503)

```typescript
{
  "success": false,
  "error": {
    "code": "PRICE_DATABASE_INSUFFICIENT",
    "message": "Price database must have 50,000+ records before deal notifications",
    "details": {
      "current_records": 23456,
      "required_records": 50000,
      "estimated_completion": "2024-01-15T10:00:00Z"
    }
  },
  "request_id": "req_789ghi"
}
```

#### Validation Errors (422)

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Input validation failed",
    "field_errors": {
      "email": ["Must be a valid email address"],
      "password": ["Must be at least 8 characters", "Must contain uppercase letter"]
    }
  },
  "request_id": "req_101jkl"
}
```

#### Rate Limiting Errors (429)

```typescript
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again later.",
    "details": {
      "retry_after": 60,     // seconds
      "limit": 100,          // requests per hour
      "remaining": 0
    }
  },
  "request_id": "req_202mno"
}
```

---

## Rate Limiting

### Per-User Limits

**Freemium Users:**

- Authentication: 10 requests/minute
- Listings API: 60 requests/hour
- Notifications: 120 requests/hour
- Profile Updates: 10 requests/hour

**Silver Users:**

- Authentication: 15 requests/minute
- Listings API: 120 requests/hour
- Notifications: 240 requests/hour
- Profile Updates: 20 requests/hour

**Gold Users:**

- Authentication: 20 requests/minute
- Listings API: 300 requests/hour
- Notifications: 600 requests/hour
- Profile Updates: 50 requests/hour
- Premium APIs: 100 requests/hour

### Global Limits

- Registration: 100 registrations per hour per IP
- Password Reset: 5 attempts per hour per email
- Contact Support: 10 messages per day per user

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 3600
```

---

## Security Considerations

### Data Encryption

- **User Platform Credentials**: AES-256-GCM with user-specific keys
- **Personal Information**: Encrypted at rest with master key rotation
- **Payment Data**: PCI-DSS compliant tokenization (production only)

### GDPR Compliance

- **Data Portability**: `GET /users/export` returns all user data
- **Right to Deletion**: `DELETE /users/account` removes all data
- **Consent Management**: Tracked in user preferences
- **Data Processing**: Documented in privacy policy

### Anti-Abuse Measures

- **Scraping Detection**: Exponential backoff, proxy rotation
- **Bot Protection**: Cloudflare challenges on registration
- **Payment Fraud**: Transaction monitoring and verification
- **Content Moderation**: Automated filtering of user-generated content

### Platform Credentials Security

```typescript
interface EncryptedCredentials {
  platform: string;
  encrypted_data: string; // AES-256-GCM encrypted
  salt: string; // Unique per user/platform
  created_at: string;
  last_used: string;
  expires_at?: string; // Optional expiry
}
```

---

## Webhook Specifications

### Supabase Realtime Events

Real-time updates are delivered via Supabase WebSocket connections:

**Notification Events:**

```javascript
// Subscribe to user notifications
const channel = supabase
  .channel(`notifications:${userId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications",
    },
    handleNewNotification,
  )
  .subscribe();
```

**FlipSquad Chat Events:**

```javascript
// Subscribe to squad chat
const channel = supabase
  .channel(`squad:${squadId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "squad_messages",
    },
    handleNewMessage,
  )
  .subscribe();
```

### Discord Bot Webhooks

**Event Types:**

- `deal_notification`: New profitable deal found
- `unlock_success`: User unlocked a listing
- `subscription_upgrade`: User upgraded subscription
- `squad_activity`: FlipSquad team activity

---

## Development vs Production

### Development Environment

**Mock Systems Active:**

- Payment processing (no real charges)
- Limited AI analysis (TensorFlow.js/Ollama)
- Discord notifications only
- Reduced rate limits for testing
- Debug logging enabled

**Environment Variables:**

```bash
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://...
DISCORD_BOT_TOKEN=...
OPENAI_API_KEY=mock_key_for_testing
```

### Production Environment

**Live Systems:**

- Real Swish payments
- Full OpenAI Vision API
- Multi-channel notifications (Discord, SMS, Email)
- Full rate limits enforced
- Production logging and monitoring

**Additional Services:**

- Sentry error tracking
- PostHog analytics
- Cloudflare security
- PagerDuty alerting

---

## Support & Maintenance

### API Versioning

- Current Version: v1.0.0
- Version Header: `X-API-Version: 1.0.0`
- Backward Compatibility: 12 months minimum
- Deprecation Notice: 90 days advance notice

### Status Page

**Endpoint:** `GET /status`

```typescript
interface StatusResponse {
  status: "operational" | "degraded" | "down";
  services: Record<string, "operational" | "degraded" | "down">;
  last_updated: string;
}
```

### Contact Information

- **Technical Support**: tech@flip.se
- **API Issues**: api@flip.se
- **Emergency Contact**: +46-xxx-xxx-xxx (Swedish business hours)

---

_This API specification is a living document and will be updated as the platform evolves. Always refer to the latest version for current endpoint specifications and business logic._
