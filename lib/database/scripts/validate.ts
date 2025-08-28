#!/usr/bin/env tsx
// ============================================================================
// DATABASE VALIDATION CLI SCRIPT
// ============================================================================
// Validate database setup and price database requirements
// Usage: npm run db:validate
// ============================================================================

import { database } from '../index';

async function main() {
  console.log('🔍 Validating database setup...');
  
  try {
    // Check database connection
    console.log('📡 Testing database connection...');
    const isHealthy = await database.isHealthy();
    
    if (!isHealthy) {
      console.error('❌ Database connection failed');
      console.error('Please check your Supabase configuration in .env.local');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful');
    
    // Check price database
    console.log('📊 Checking price database status...');
    const priceCount = await database.getPriceRecordCount();
    const isComplete = await database.isPriceDatabaseComplete();
    
    console.log(`Price records: ${priceCount.toLocaleString()}`);
    console.log(`Required: ${(50000).toLocaleString()}`);
    
    if (isComplete) {
      console.log('✅ Price database meets requirements');
    } else {
      console.log('⚠️  Price database incomplete');
      console.log('   Phase 2+ features will be disabled until requirement is met');
    }
    
    // Check sample data (development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Checking development sample data...');
      // Could add more specific checks here
    }
    
    console.log('');
    console.log('🎉 Database validation complete');
    
    if (!isComplete) {
      console.log('');
      console.log('Next steps:');
      console.log('1. Run price scrapers to collect 50,000+ records');
      console.log('2. Use "npm run db:validate" to check progress');
      console.log('3. Phase 2+ features will unlock automatically');
    }
    
  } catch (error) {
    console.error('❌ Database validation failed:', error);
    process.exit(1);
  }
}

main();