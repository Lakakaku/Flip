#!/usr/bin/env tsx
// ============================================================================
// DATABASE SEEDING CLI SCRIPT
// ============================================================================
// Run database seeding for development data
// Usage: npm run db:seed
// ============================================================================

import { setupDevelopment } from '../seed';

async function main() {
  try {
    await setupDevelopment();
  } catch (error) {
    console.error('Seeding script failed:', error);
    process.exit(1);
  }
}

main();