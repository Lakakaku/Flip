#!/usr/bin/env tsx
// ============================================================================
// DATABASE MIGRATION CLI SCRIPT
// ============================================================================
// Run database migrations for the Swedish marketplace flipping platform
// Usage: npm run db:migrate
// ============================================================================

import { runMigrations } from '../migrate';

async function main() {
  try {
    await runMigrations();
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

main();