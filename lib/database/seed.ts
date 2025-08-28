// ============================================================================
// DATABASE SEEDING SYSTEM
// ============================================================================
// Production-ready seeding system for development and testing data
// ============================================================================

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getServiceClient } from '../supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface SeedFile {
  filename: string;
  name: string;
  sql: string;
}

export interface SeedResult {
  success: boolean;
  applied: string[];
  errors: string[];
}

// ============================================================================
// SEED MANAGER CLASS
// ============================================================================

export class SeedManager {
  private seedsPath: string;

  constructor() {
    this.seedsPath = join(__dirname, 'seeds');
  }

  /**
   * Load all seed files from the seeds directory
   */
  private loadSeedFiles(): SeedFile[] {
    try {
      const files = readdirSync(this.seedsPath)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Ensures order: 001_xxx.sql, 002_xxx.sql, etc.

      return files.map(filename => {
        const fullPath = join(this.seedsPath, filename);
        const sql = readFileSync(fullPath, 'utf-8');
        
        // Extract name from filename (e.g., "001_system_settings.sql" -> "system_settings")
        const name = filename
          .replace('.sql', '')
          .split('_')
          .slice(1)
          .join('_');

        return {
          filename,
          name,
          sql,
        };
      });
    } catch (error) {
      console.error('Error loading seed files:', error);
      return [];
    }
  }

  /**
   * Apply a single seed file
   */
  private async applySeed(seedFile: SeedFile): Promise<boolean> {
    try {
      const client = getServiceClient();

      console.log(`Applying seed: ${seedFile.name}`);

      // Execute the seed SQL
      const { error } = await client.rpc('execute_sql', { 
        sql_query: seedFile.sql 
      });

      if (error) {
        console.error(`Error applying seed ${seedFile.name}:`, error);
        return false;
      }

      console.log(`✅ Successfully applied seed: ${seedFile.name}`);
      return true;
    } catch (error) {
      console.error(`Error applying seed ${seedFile.name}:`, error);
      return false;
    }
  }

  /**
   * Run all seed files
   */
  async seed(): Promise<SeedResult> {
    console.log('🌱 Starting database seeding...');

    const seedFiles = this.loadSeedFiles();

    if (seedFiles.length === 0) {
      console.log('No seed files found.');
      return {
        success: true,
        applied: [],
        errors: [],
      };
    }

    console.log(`Found ${seedFiles.length} seed files:`);
    seedFiles.forEach(s => {
      console.log(`  - ${s.name}`);
    });

    const applied: string[] = [];
    const errors: string[] = [];

    // Apply seed files in order
    for (const seedFile of seedFiles) {
      const success = await this.applySeed(seedFile);
      
      if (success) {
        applied.push(seedFile.name);
      } else {
        const errorMsg = `Failed to apply seed: ${seedFile.name}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
        // Continue with other seeds even if one fails (seeds should be idempotent)
      }
    }

    if (errors.length === 0) {
      console.log(`✅ Successfully applied ${applied.length} seed files`);
    } else {
      console.log(`⚠️  Applied ${applied.length} seed files with ${errors.length} errors`);
    }

    return {
      success: errors.length === 0,
      applied,
      errors,
    };
  }

  /**
   * Clear all seeded data (development only)
   */
  async clearSeedData(): Promise<boolean> {
    console.log('🧹 Clearing seed data...');

    try {
      const client = getServiceClient();

      // Clear sample data in reverse dependency order
      const clearSQL = `
        -- Clear sample listings
        DELETE FROM listings WHERE marketplace_id LIKE 'listing_%';
        
        -- Clear sample price statistics  
        DELETE FROM price_statistics WHERE sample_count < 1000;
        
        -- Clear sample price data
        DELETE FROM product_prices WHERE data_source = 'seed';
        
        -- Clear development settings
        DELETE FROM system_settings WHERE key LIKE 'dev_%' OR key LIKE 'sample_%';
      `;

      const { error } = await client.rpc('execute_sql', { 
        sql_query: clearSQL 
      });

      if (error) {
        console.error('Error clearing seed data:', error);
        return false;
      }

      console.log('✅ Successfully cleared seed data');
      return true;
    } catch (error) {
      console.error('Error clearing seed data:', error);
      return false;
    }
  }

  /**
   * Create sample user accounts for development
   */
  async createSampleUsers(): Promise<boolean> {
    console.log('👥 Creating sample user accounts...');

    try {
      const client = getServiceClient();

      // This would create actual user accounts via Supabase Auth
      // For now, we'll just create the user records directly
      const sampleUsersSQL = `
        INSERT INTO users (
          id, email, subscription_tier, is_active, 
          first_name, last_name, location_city, location_region
        ) VALUES 
        (
          'dev-user-freemium', 'dev.freemium@example.com', 'freemium', true,
          'Dev', 'Freemium', 'Stockholm', 'Stockholm'
        ),
        (
          'dev-user-silver', 'dev.silver@example.com', 'silver', true,
          'Dev', 'Silver', 'Göteborg', 'Västra Götaland' 
        ),
        (
          'dev-user-gold', 'dev.gold@example.com', 'gold', true,
          'Dev', 'Gold', 'Malmö', 'Skåne'
        )
        ON CONFLICT (email) DO UPDATE SET
          subscription_tier = EXCLUDED.subscription_tier,
          updated_at = NOW();
      `;

      const { error } = await client.rpc('execute_sql', { 
        sql_query: sampleUsersSQL 
      });

      if (error) {
        console.error('Error creating sample users:', error);
        return false;
      }

      console.log('✅ Successfully created sample users');
      return true;
    } catch (error) {
      console.error('Error creating sample users:', error);
      return false;
    }
  }

  /**
   * Generate sample notifications for testing
   */
  async generateSampleNotifications(): Promise<boolean> {
    console.log('📬 Generating sample notifications...');

    try {
      const client = getServiceClient();

      const notificationsSQL = `
        -- Create notifications for each tier and listing combination
        INSERT INTO notifications (
          user_id, type, title, message, listing_id, tier_required, 
          priority, urgency_score, is_unlocked
        )
        SELECT 
          u.id as user_id,
          'deal' as type,
          'Ny Deal: ' || l.title as title,
          'Potential profit: ' || l.profit_potential || ' SEK (' || l.profit_percentage || '%)' as message,
          l.id as listing_id,
          l.notification_tier_required,
          CASE 
            WHEN l.profit_potential >= 1000 THEN 'urgent'
            WHEN l.profit_potential >= 500 THEN 'high'
            ELSE 'normal'
          END as priority,
          LEAST(100, GREATEST(10, l.profit_potential / 50)) as urgency_score,
          false as is_unlocked
        FROM users u
        CROSS JOIN listings l
        WHERE u.email LIKE 'dev.%@example.com'
        AND l.marketplace_id LIKE 'listing_%'
        AND l.status = 'active'
        ON CONFLICT DO NOTHING;
      `;

      const { error } = await client.rpc('execute_sql', { 
        sql_query: notificationsSQL 
      });

      if (error) {
        console.error('Error generating sample notifications:', error);
        return false;
      }

      console.log('✅ Successfully generated sample notifications');
      return true;
    } catch (error) {
      console.error('Error generating sample notifications:', error);
      return false;
    }
  }

  /**
   * Check if we're in development mode
   */
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Full development setup
   */
  async setupDevelopment(): Promise<boolean> {
    if (!this.isDevelopment()) {
      console.log('⚠️  Not in development mode, skipping development setup');
      return false;
    }

    console.log('🚀 Setting up development environment...');

    // Run seeds
    const seedResult = await this.seed();
    if (!seedResult.success) {
      console.error('❌ Failed to apply seeds');
      return false;
    }

    // Create sample users
    const usersResult = await this.createSampleUsers();
    if (!usersResult) {
      console.error('❌ Failed to create sample users');
      return false;
    }

    // Generate sample notifications
    const notificationsResult = await this.generateSampleNotifications();
    if (!notificationsResult) {
      console.error('❌ Failed to generate sample notifications');
      return false;
    }

    console.log('🎉 Development environment setup complete!');
    console.log('');
    console.log('Sample accounts available:');
    console.log('  - dev.freemium@example.com (Freemium tier)');
    console.log('  - dev.silver@example.com (Silver tier)');
    console.log('  - dev.gold@example.com (Gold tier)');
    
    return true;
  }
}

// ============================================================================
// CLI HELPER FUNCTIONS
// ============================================================================

/**
 * Run database seeding from command line
 */
export async function runSeeds(): Promise<void> {
  const manager = new SeedManager();
  const result = await manager.seed();

  if (!result.success) {
    console.error('❌ Seeding failed');
    result.errors.forEach(error => console.error(`   ${error}`));
    process.exit(1);
  }

  console.log('🎉 Database seeding completed successfully');
}

/**
 * Setup full development environment
 */
export async function setupDevelopment(): Promise<void> {
  const manager = new SeedManager();
  const success = await manager.setupDevelopment();

  if (!success) {
    console.error('❌ Development setup failed');
    process.exit(1);
  }

  console.log('🎉 Development environment ready!');
}

/**
 * Clear all seed data
 */
export async function clearSeeds(): Promise<void> {
  const manager = new SeedManager();
  const success = await manager.clearSeedData();

  if (!success) {
    console.error('❌ Failed to clear seed data');
    process.exit(1);
  }

  console.log('✅ Seed data cleared');
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const seedManager = new SeedManager();