#!/usr/bin/env tsx
// ============================================================================
// DATABASE MIGRATION STATUS CLI SCRIPT
// ============================================================================
// Check the status of database migrations
// Usage: npm run db:migrate:status
// ============================================================================

import { checkMigrationStatus } from '../migrate';

async function main() {
  try {
    await checkMigrationStatus();
  } catch (error) {
    console.error('Status check failed:', error);
    process.exit(1);
  }
}

main();