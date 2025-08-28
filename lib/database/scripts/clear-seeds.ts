#!/usr/bin/env tsx
// ============================================================================
// DATABASE SEED CLEARING CLI SCRIPT
// ============================================================================
// Clear all seeded development data
// Usage: npm run db:seed:clear
// ============================================================================

import { clearSeeds } from '../seed';

async function main() {
  try {
    await clearSeeds();
  } catch (error) {
    console.error('Clear seeds script failed:', error);
    process.exit(1);
  }
}

main();