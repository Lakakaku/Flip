// ============================================================================
// DATABASE SERVICE - Supabase Integration
// ============================================================================
// Production-ready database service for the Swedish marketplace flipping platform
// Implements all critical database operations with proper error handling and
// type safety as required by CLAUDE.md
// ============================================================================

import { config } from '../config';
import { getServiceClient, SupabaseService, SupabaseResponse } from '../supabase/client';
import type {
  User,
  ProductPrice,
  Notification,
  Listing,
  Transaction,
  PriceStatistic,
  SubscriptionTier,
  Marketplace,
  NotificationType,
} from '@/types/supabase';

// ============================================================================
// LEGACY INTERFACES (for backward compatibility)
// ============================================================================

export interface DatabaseRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceRecord extends DatabaseRecord {
  productId: string;
  marketplace: string;
  price: number;
  title: string;
  category: string;
  condition?: string;
  location: string;
}

// ============================================================================
// MAIN DATABASE SERVICE CLASS
// ============================================================================

export class DatabaseService {
  private supabaseService: SupabaseService;

  constructor() {
    this.supabaseService = new SupabaseService(getServiceClient());
  }

  // ============================================================================
  // PRICE DATABASE OPERATIONS (CRITICAL - Phase 1 requirement)
  // ============================================================================

  /**
   * Get the total count of price records in the database
   * CRITICAL: Must return actual count for Phase 1 validation
   */
  async getPriceRecordCount(): Promise<number> {
    try {
      const { data, error } = await getServiceClient()
        .from('product_prices')
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting price record count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Unexpected error getting price record count:', error);
      return 0;
    }
  }

  /**
   * Check if price database meets the 50,000+ record requirement
   * CRITICAL: Used to gate Phase 2 functionality
   */
  async isPriceDatabaseComplete(): Promise<boolean> {
    const count = await this.getPriceRecordCount();
    const isComplete = count >= config.database.minPriceRecords;
    
    console.log(`Price database status: ${count}/${config.database.minPriceRecords} records (${isComplete ? 'COMPLETE' : 'INCOMPLETE'})`);
    
    return isComplete;
  }

  /**
   * Create a new price record from scraper data
   */
  async createPriceRecord(record: {
    product_id: string;
    title: string;
    price: number;
    category: string;
    marketplace: Marketplace;
    marketplace_url: string;
    condition?: string;
    seller_location?: string;
    description?: string;
    image_urls?: string[];
    confidence_score?: number;
  }): Promise<SupabaseResponse<ProductPrice>> {
    const result = await this.supabaseService.insert<ProductPrice>('product_prices', {
      product_id: record.product_id,
      title: record.title,
      price: record.price,
      category: record.category,
      marketplace: record.marketplace,
      marketplace_url: record.marketplace_url,
      condition: record.condition || null,
      seller_location: record.seller_location || null,
      description: record.description || null,
      image_urls: record.image_urls || null,
      confidence_score: record.confidence_score || 0.8,
      currency: 'SEK',
      data_source: 'scraper',
    });

    return result;
  }

  /**
   * Find similar products for price comparison
   */
  async findSimilarProducts(
    title: string,
    category: string,
    limit = 50
  ): Promise<ProductPrice[]> {
    try {
      const { data, error } = await getServiceClient()
        .from('product_prices')
        .select('*')
        .eq('category', category)
        .textSearch('title', title, { type: 'websearch' })
        .order('confidence_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error finding similar products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error finding similar products:', error);
      return [];
    }
  }

  /**
   * Get average price for a category and condition
   */
  async getAveragePrice(
    category: string,
    condition?: string,
    timePeriod = 'last_30d'
  ): Promise<number> {
    try {
      // First try to get cached statistics
      const { data: stats } = await getServiceClient()
        .from('price_statistics')
        .select('avg_price')
        .eq('category', category)
        .eq('condition', condition || null)
        .eq('time_period', timePeriod)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (stats?.avg_price) {
        return stats.avg_price;
      }

      // Fallback to direct calculation
      const { data, error } = await getServiceClient()
        .from('product_prices')
        .select('price')
        .eq('category', category)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error || !data || data.length === 0) {
        return 0;
      }

      const sum = data.reduce((total, item) => total + item.price, 0);
      return sum / data.length;
    } catch (error) {
      console.error('Error getting average price:', error);
      return 0;
    }
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async createUser(userData: {
    auth_id: string;
    email: string;
    subscription_tier?: SubscriptionTier;
    location_city?: string;
    location_region?: string;
  }): Promise<SupabaseResponse<User>> {
    const result = await this.supabaseService.insert<User>('users', {
      auth_id: userData.auth_id,
      email: userData.email,
      subscription_tier: userData.subscription_tier || 'freemium',
      location_city: userData.location_city || null,
      location_region: userData.location_region || null,
      is_active: true,
    });

    return result;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await getServiceClient()
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error getting user by email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error getting user by email:', error);
      return null;
    }
  }

  async getUserByAuthId(authId: string): Promise<User | null> {
    try {
      const { data, error } = await getServiceClient()
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) {
        console.error('Error getting user by auth ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error getting user by auth ID:', error);
      return null;
    }
  }

  // ============================================================================
  // NOTIFICATION SYSTEM (with hierarchical access)
  // ============================================================================

  async createNotification(notification: {
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    listing_id?: string;
    tier_required?: SubscriptionTier;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    urgency_score?: number;
  }): Promise<SupabaseResponse<Notification>> {
    const result = await this.supabaseService.insert<Notification>('notifications', {
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      listing_id: notification.listing_id || null,
      tier_required: notification.tier_required || 'freemium',
      priority: notification.priority || 'normal',
      urgency_score: notification.urgency_score || 50,
      is_read: false,
      is_unlocked: false,
    });

    return result;
  }

  async getUserNotifications(
    userId: string,
    limit = 50
  ): Promise<Notification[]> {
    try {
      const { data, error } = await getServiceClient()
        .from('notifications')
        .select(`
          *,
          listings (
            id,
            title,
            current_price,
            profit_potential
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting user notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Unlock a notification for the user (with payment)
   */
  async unlockNotification(
    notificationId: string,
    userId: string,
    unlockCost: number
  ): Promise<SupabaseResponse<Notification>> {
    // This would typically be wrapped in a database transaction
    try {
      // First, create the transaction record
      await this.supabaseService.insert('transactions', {
        user_id: userId,
        type: 'unlock',
        amount: unlockCost,
        currency: 'SEK',
        notification_id: notificationId,
        description: 'Notification unlock',
        status: 'completed', // Mock payment for development
        payment_method: 'mock',
      });

      // Then unlock the notification
      const result = await this.supabaseService.update<Notification>(
        'notifications',
        {
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
          unlock_cost: unlockCost,
        },
        { id: notificationId, user_id: userId }
      );

      return result;
    } catch (error) {
      console.error('Error unlocking notification:', error);
      return {
        data: null,
        error: 'Failed to unlock notification',
        success: false,
      };
    }
  }

  // ============================================================================
  // LISTING MANAGEMENT
  // ============================================================================

  async createListing(listing: {
    marketplace_id: string;
    marketplace: Marketplace;
    title: string;
    category: string;
    current_price: number;
    market_value?: number;
    profit_potential?: number;
    location?: string;
    region?: string;
    image_urls?: string[];
    ends_at?: string;
    is_auction?: boolean;
  }): Promise<SupabaseResponse<Listing>> {
    const profitPotential = listing.profit_potential || 0;
    const confidenceScore = listing.market_value ? 0.8 : 0.5;
    
    // Determine tier requirement based on profit potential
    let tierRequired: SubscriptionTier = 'freemium';
    if (profitPotential >= 500) {
      tierRequired = 'gold';
    } else if (profitPotential >= 200) {
      tierRequired = 'silver';
    }

    const result = await this.supabaseService.insert<Listing>('listings', {
      marketplace_id: listing.marketplace_id,
      marketplace: listing.marketplace,
      title: listing.title,
      category: listing.category,
      current_price: listing.current_price,
      market_value: listing.market_value || null,
      profit_potential: profitPotential,
      profit_percentage: listing.market_value 
        ? ((listing.market_value - listing.current_price) / listing.current_price) * 100
        : null,
      confidence_score: confidenceScore,
      location: listing.location || null,
      region: listing.region || null,
      image_urls: listing.image_urls || null,
      ends_at: listing.ends_at || null,
      is_auction: listing.is_auction || false,
      status: 'active',
      notification_tier_required: tierRequired,
    });

    return result;
  }

  async getActiveListings(limit = 100): Promise<Listing[]> {
    try {
      const { data, error } = await getServiceClient()
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('profit_potential', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting active listings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error getting active listings:', error);
      return [];
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async isHealthy(): Promise<boolean> {
    return await this.supabaseService.isHealthy();
  }

  // ============================================================================
  // LEGACY METHOD SUPPORT (for backward compatibility)
  // ============================================================================

  // Convert new ProductPrice to legacy PriceRecord format
  private convertToLegacyPriceRecord(productPrice: ProductPrice): PriceRecord {
    return {
      id: productPrice.id,
      productId: productPrice.product_id,
      marketplace: productPrice.marketplace,
      price: productPrice.price,
      title: productPrice.title,
      category: productPrice.category,
      condition: productPrice.condition || undefined,
      location: productPrice.seller_location || '',
      createdAt: new Date(productPrice.created_at || ''),
      updatedAt: new Date(productPrice.updated_at || ''),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const database = new DatabaseService();