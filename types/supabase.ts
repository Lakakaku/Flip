// ============================================================================
// SUPABASE DATABASE TYPES
// ============================================================================
// Auto-generated TypeScript types for the Swedish marketplace flipping platform
// These types ensure type safety across the entire application
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string | null
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          subscription_tier: 'freemium' | 'silver' | 'gold'
          subscription_starts_at: string | null
          subscription_ends_at: string | null
          is_active: boolean
          preferred_language: string | null
          timezone: string | null
          location_city: string | null
          location_region: string | null
          max_distance_km: number | null
          last_login_at: string | null
          notification_count: number | null
          unlock_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          auth_id?: string | null
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'freemium' | 'silver' | 'gold'
          subscription_starts_at?: string | null
          subscription_ends_at?: string | null
          is_active?: boolean
          preferred_language?: string | null
          timezone?: string | null
          location_city?: string | null
          location_region?: string | null
          max_distance_km?: number | null
          last_login_at?: string | null
          notification_count?: number | null
          unlock_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          auth_id?: string | null
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'freemium' | 'silver' | 'gold'
          subscription_starts_at?: string | null
          subscription_ends_at?: string | null
          is_active?: boolean
          preferred_language?: string | null
          timezone?: string | null
          location_city?: string | null
          location_region?: string | null
          max_distance_km?: number | null
          last_login_at?: string | null
          notification_count?: number | null
          unlock_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      product_prices: {
        Row: {
          id: string
          product_id: string
          title: string
          description: string | null
          category: string
          subcategory: string | null
          brand: string | null
          model: string | null
          price: number
          original_price: number | null
          currency: string
          marketplace: 'tradera' | 'blocket' | 'facebook' | 'sellpy' | 'plick'
          marketplace_url: string
          condition: 'new' | 'very_good' | 'good' | 'fair' | 'poor' | null
          item_age_months: number | null
          defects: string[] | null
          seller_location: string | null
          seller_region: string | null
          shipping_cost: number | null
          pickup_available: boolean | null
          sold_at: string | null
          sold_price: number | null
          bid_count: number | null
          view_count: number | null
          confidence_score: number | null
          data_source: string
          is_verified: boolean | null
          image_urls: string[] | null
          primary_image_url: string | null
          scraped_at: string | null
          listing_created_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          title: string
          description?: string | null
          category: string
          subcategory?: string | null
          brand?: string | null
          model?: string | null
          price: number
          original_price?: number | null
          currency?: string
          marketplace: 'tradera' | 'blocket' | 'facebook' | 'sellpy' | 'plick'
          marketplace_url: string
          condition?: 'new' | 'very_good' | 'good' | 'fair' | 'poor' | null
          item_age_months?: number | null
          defects?: string[] | null
          seller_location?: string | null
          seller_region?: string | null
          shipping_cost?: number | null
          pickup_available?: boolean | null
          sold_at?: string | null
          sold_price?: number | null
          bid_count?: number | null
          view_count?: number | null
          confidence_score?: number | null
          data_source?: string
          is_verified?: boolean | null
          image_urls?: string[] | null
          primary_image_url?: string | null
          scraped_at?: string | null
          listing_created_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          title?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          brand?: string | null
          model?: string | null
          price?: number
          original_price?: number | null
          currency?: string
          marketplace?: 'tradera' | 'blocket' | 'facebook' | 'sellpy' | 'plick'
          marketplace_url?: string
          condition?: 'new' | 'very_good' | 'good' | 'fair' | 'poor' | null
          item_age_months?: number | null
          defects?: string[] | null
          seller_location?: string | null
          seller_region?: string | null
          shipping_cost?: number | null
          pickup_available?: boolean | null
          sold_at?: string | null
          sold_price?: number | null
          bid_count?: number | null
          view_count?: number | null
          confidence_score?: number | null
          data_source?: string
          is_verified?: boolean | null
          image_urls?: string[] | null
          primary_image_url?: string | null
          scraped_at?: string | null
          listing_created_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      price_statistics: {
        Row: {
          id: string
          category: string
          subcategory: string | null
          condition: string | null
          marketplace: string | null
          region: string | null
          avg_price: number | null
          median_price: number | null
          min_price: number | null
          max_price: number | null
          std_deviation: number | null
          percentile_25: number | null
          percentile_75: number | null
          percentile_90: number | null
          sample_count: number
          last_sample_date: string | null
          time_period: string
          expires_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          category: string
          subcategory?: string | null
          condition?: string | null
          marketplace?: string | null
          region?: string | null
          avg_price?: number | null
          median_price?: number | null
          min_price?: number | null
          max_price?: number | null
          std_deviation?: number | null
          percentile_25?: number | null
          percentile_75?: number | null
          percentile_90?: number | null
          sample_count: number
          last_sample_date?: string | null
          time_period?: string
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          category?: string
          subcategory?: string | null
          condition?: string | null
          marketplace?: string | null
          region?: string | null
          avg_price?: number | null
          median_price?: number | null
          min_price?: number | null
          max_price?: number | null
          std_deviation?: number | null
          percentile_25?: number | null
          percentile_75?: number | null
          percentile_90?: number | null
          sample_count?: number
          last_sample_date?: string | null
          time_period?: string
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      listings: {
        Row: {
          id: string
          product_price_id: string | null
          marketplace_id: string
          marketplace: string
          current_price: number
          market_value: number | null
          profit_potential: number | null
          profit_percentage: number | null
          confidence_score: number | null
          title: string
          description: string | null
          category: string
          condition: string | null
          location: string | null
          region: string | null
          shipping_cost: number | null
          pickup_available: boolean | null
          ends_at: string | null
          is_auction: boolean | null
          current_bid_count: number | null
          status: 'active' | 'ended' | 'sold' | 'removed' | 'flagged'
          notification_sent: boolean | null
          notification_tier_required: 'freemium' | 'silver' | 'gold' | null
          image_urls: string[] | null
          primary_image_url: string | null
          discovered_at: string | null
          last_checked_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_price_id?: string | null
          marketplace_id: string
          marketplace: string
          current_price: number
          market_value?: number | null
          profit_potential?: number | null
          profit_percentage?: number | null
          confidence_score?: number | null
          title: string
          description?: string | null
          category: string
          condition?: string | null
          location?: string | null
          region?: string | null
          shipping_cost?: number | null
          pickup_available?: boolean | null
          ends_at?: string | null
          is_auction?: boolean | null
          current_bid_count?: number | null
          status?: 'active' | 'ended' | 'sold' | 'removed' | 'flagged'
          notification_sent?: boolean | null
          notification_tier_required?: 'freemium' | 'silver' | 'gold' | null
          image_urls?: string[] | null
          primary_image_url?: string | null
          discovered_at?: string | null
          last_checked_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_price_id?: string | null
          marketplace_id?: string
          marketplace?: string
          current_price?: number
          market_value?: number | null
          profit_potential?: number | null
          profit_percentage?: number | null
          confidence_score?: number | null
          title?: string
          description?: string | null
          category?: string
          condition?: string | null
          location?: string | null
          region?: string | null
          shipping_cost?: number | null
          pickup_available?: boolean | null
          ends_at?: string | null
          is_auction?: boolean | null
          current_bid_count?: number | null
          status?: 'active' | 'ended' | 'sold' | 'removed' | 'flagged'
          notification_sent?: boolean | null
          notification_tier_required?: 'freemium' | 'silver' | 'gold' | null
          image_urls?: string[] | null
          primary_image_url?: string | null
          discovered_at?: string | null
          last_checked_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'deal' | 'price_drop' | 'auction_ending' | 'system' | 'flipsquad'
          title: string
          message: string
          listing_id: string | null
          tier_required: 'freemium' | 'silver' | 'gold'
          is_unlocked: boolean | null
          unlocked_at: string | null
          unlock_cost: number | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          urgency_score: number | null
          is_read: boolean | null
          read_at: string | null
          is_archived: boolean | null
          archived_at: string | null
          delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | null
          delivery_method: string[] | null
          scheduled_for: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'deal' | 'price_drop' | 'auction_ending' | 'system' | 'flipsquad'
          title: string
          message: string
          listing_id?: string | null
          tier_required?: 'freemium' | 'silver' | 'gold'
          is_unlocked?: boolean | null
          unlocked_at?: string | null
          unlock_cost?: number | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          urgency_score?: number | null
          is_read?: boolean | null
          read_at?: string | null
          is_archived?: boolean | null
          archived_at?: string | null
          delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed' | null
          delivery_method?: string[] | null
          scheduled_for?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'deal' | 'price_drop' | 'auction_ending' | 'system' | 'flipsquad'
          title?: string
          message?: string
          listing_id?: string | null
          tier_required?: 'freemium' | 'silver' | 'gold'
          is_unlocked?: boolean | null
          unlocked_at?: string | null
          unlock_cost?: number | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          urgency_score?: number | null
          is_read?: boolean | null
          read_at?: string | null
          is_archived?: boolean | null
          archived_at?: string | null
          delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed' | null
          delivery_method?: string[] | null
          scheduled_for?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'unlock' | 'subscription' | 'refund'
          amount: number
          currency: string
          payment_method: 'swish' | 'card' | 'mock' | null
          payment_reference: string | null
          notification_id: string | null
          description: string
          status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          processed_at: string | null
          failure_reason: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'unlock' | 'subscription' | 'refund'
          amount: number
          currency?: string
          payment_method?: 'swish' | 'card' | 'mock' | null
          payment_reference?: string | null
          notification_id?: string | null
          description: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          processed_at?: string | null
          failure_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'unlock' | 'subscription' | 'refund'
          amount?: number
          currency?: string
          payment_method?: 'swish' | 'card' | 'mock' | null
          payment_reference?: string | null
          notification_id?: string | null
          description?: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          processed_at?: string | null
          failure_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      flipsquads: {
        Row: {
          id: string
          name: string
          description: string | null
          squad_type: 'public' | 'private' | 'invite_only' | null
          max_members: number | null
          min_profit_share: number | null
          focus_regions: string[] | null
          focus_categories: string[] | null
          member_count: number | null
          total_deals_found: number | null
          total_profit_made: number | null
          is_active: boolean | null
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          squad_type?: 'public' | 'private' | 'invite_only' | null
          max_members?: number | null
          min_profit_share?: number | null
          focus_regions?: string[] | null
          focus_categories?: string[] | null
          member_count?: number | null
          total_deals_found?: number | null
          total_profit_made?: number | null
          is_active?: boolean | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          squad_type?: 'public' | 'private' | 'invite_only' | null
          max_members?: number | null
          min_profit_share?: number | null
          focus_regions?: string[] | null
          focus_categories?: string[] | null
          member_count?: number | null
          total_deals_found?: number | null
          total_profit_made?: number | null
          is_active?: boolean | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      flipsquad_members: {
        Row: {
          id: string
          flipsquad_id: string
          user_id: string
          role: 'member' | 'moderator' | 'admin' | 'founder'
          deals_contributed: number | null
          profit_earned: number | null
          reputation_score: number | null
          status: 'pending' | 'active' | 'suspended' | 'banned'
          joined_at: string | null
          last_active_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          flipsquad_id: string
          user_id: string
          role?: 'member' | 'moderator' | 'admin' | 'founder'
          deals_contributed?: number | null
          profit_earned?: number | null
          reputation_score?: number | null
          status?: 'pending' | 'active' | 'suspended' | 'banned'
          joined_at?: string | null
          last_active_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          flipsquad_id?: string
          user_id?: string
          role?: 'member' | 'moderator' | 'admin' | 'founder'
          deals_contributed?: number | null
          profit_earned?: number | null
          reputation_score?: number | null
          status?: 'pending' | 'active' | 'suspended' | 'banned'
          joined_at?: string | null
          last_active_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          condition: string
          asking_price: number
          min_price: number | null
          currency: string
          published_on: string[] | null
          platform_ids: Json | null
          pickup_location: string | null
          shipping_available: boolean | null
          shipping_cost: number | null
          status: 'draft' | 'published' | 'sold' | 'expired' | 'removed'
          view_count: number | null
          inquiry_count: number | null
          sold_price: number | null
          sold_at: string | null
          image_urls: string[] | null
          primary_image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: string
          condition: string
          asking_price: number
          min_price?: number | null
          currency?: string
          published_on?: string[] | null
          platform_ids?: Json | null
          pickup_location?: string | null
          shipping_available?: boolean | null
          shipping_cost?: number | null
          status?: 'draft' | 'published' | 'sold' | 'expired' | 'removed'
          view_count?: number | null
          inquiry_count?: number | null
          sold_price?: number | null
          sold_at?: string | null
          image_urls?: string[] | null
          primary_image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          condition?: string
          asking_price?: number
          min_price?: number | null
          currency?: string
          published_on?: string[] | null
          platform_ids?: Json | null
          pickup_location?: string | null
          shipping_available?: boolean | null
          shipping_cost?: number | null
          status?: 'draft' | 'published' | 'sold' | 'expired' | 'removed'
          view_count?: number | null
          inquiry_count?: number | null
          sold_price?: number | null
          sold_at?: string | null
          image_urls?: string[] | null
          primary_image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          data_type: 'string' | 'integer' | 'decimal' | 'boolean' | 'json'
          is_public: boolean | null
          is_encrypted: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          data_type?: 'string' | 'integer' | 'decimal' | 'boolean' | 'json'
          is_public?: boolean | null
          is_encrypted?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          data_type?: 'string' | 'integer' | 'decimal' | 'boolean' | 'json'
          is_public?: boolean | null
          is_encrypted?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_unlock_notification: {
        Args: {
          notification_id: string
        }
        Returns: boolean
      }
      get_user_tier: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_has_tier: {
        Args: {
          required_tier: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// HELPER TYPES FOR APPLICATION USE
// ============================================================================

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type ProductPrice = Database['public']['Tables']['product_prices']['Row']
export type ProductPriceInsert = Database['public']['Tables']['product_prices']['Insert']
export type ProductPriceUpdate = Database['public']['Tables']['product_prices']['Update']

export type PriceStatistic = Database['public']['Tables']['price_statistics']['Row']
export type PriceStatisticInsert = Database['public']['Tables']['price_statistics']['Insert']
export type PriceStatisticUpdate = Database['public']['Tables']['price_statistics']['Update']

export type Listing = Database['public']['Tables']['listings']['Row']
export type ListingInsert = Database['public']['Tables']['listings']['Insert']
export type ListingUpdate = Database['public']['Tables']['listings']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type FlipSquad = Database['public']['Tables']['flipsquads']['Row']
export type FlipSquadInsert = Database['public']['Tables']['flipsquads']['Insert']
export type FlipSquadUpdate = Database['public']['Tables']['flipsquads']['Update']

export type FlipSquadMember = Database['public']['Tables']['flipsquad_members']['Row']
export type FlipSquadMemberInsert = Database['public']['Tables']['flipsquad_members']['Insert']
export type FlipSquadMemberUpdate = Database['public']['Tables']['flipsquad_members']['Update']

export type UserListing = Database['public']['Tables']['user_listings']['Row']
export type UserListingInsert = Database['public']['Tables']['user_listings']['Insert']
export type UserListingUpdate = Database['public']['Tables']['user_listings']['Update']

export type SystemSetting = Database['public']['Tables']['system_settings']['Row']
export type SystemSettingInsert = Database['public']['Tables']['system_settings']['Insert']
export type SystemSettingUpdate = Database['public']['Tables']['system_settings']['Update']

// ============================================================================
// SUBSCRIPTION TIER TYPE
// ============================================================================

export type SubscriptionTier = 'freemium' | 'silver' | 'gold'

// ============================================================================
// MARKETPLACE ENUM
// ============================================================================

export type Marketplace = 'tradera' | 'blocket' | 'facebook' | 'sellpy' | 'plick'

// ============================================================================
// NOTIFICATION TYPE ENUM
// ============================================================================

export type NotificationType = 'deal' | 'price_drop' | 'auction_ending' | 'system' | 'flipsquad'