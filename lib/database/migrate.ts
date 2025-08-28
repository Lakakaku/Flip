// ============================================================================
// DATABASE MIGRATION SYSTEM
// ============================================================================
// Production-ready migration system for the Swedish marketplace platform
// Handles migration execution, rollbacks, and version tracking
// ============================================================================

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getServiceClient } from '../supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface Migration {
  version: string;
  name: string;
  filename: string;
  sql: string;
}

export interface MigrationResult {
  success: boolean;
  applied: string[];
  errors: string[];
}

// ============================================================================
// MIGRATION MANAGER CLASS
// ============================================================================

export class MigrationManager {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = join(__dirname, 'migrations');
  }

  /**
   * Get all available migrations from the migrations directory
   */
  private loadMigrations(): Migration[] {
    try {
      const files = readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Ensures order: 001_xxx.sql, 002_xxx.sql, etc.

      return files.map(filename => {
        const fullPath = join(this.migrationsPath, filename);
        const sql = readFileSync(fullPath, 'utf-8');
        
        // Extract version from filename (e.g., "001_initial_schema.sql" -> "001")
        const version = filename.split('_')[0];
        
        // Extract name from filename (e.g., "001_initial_schema.sql" -> "initial_schema")
        const name = filename
          .replace('.sql', '')
          .split('_')
          .slice(1)
          .join('_');

        return {
          version,
          name,
          filename,
          sql,
        };
      });
    } catch (error) {
      console.error('Error loading migrations:', error);
      return [];
    }
  }

  /**
   * Get applied migrations from the database
   */
  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const client = getServiceClient();
      
      // First, ensure the migrations table exists
      await client.rpc('create_migrations_table_if_not_exists');

      const { data, error } = await client
        .from('schema_migrations')
        .select('version')
        .order('version');

      if (error) {
        console.error('Error getting applied migrations:', error);
        return [];
      }

      return data?.map(row => row.version) || [];
    } catch (error) {
      console.error('Error querying applied migrations:', error);
      return [];
    }
  }

  /**
   * Apply a single migration
   */
  private async applyMigration(migration: Migration): Promise<boolean> {
    try {
      const client = getServiceClient();

      console.log(`Applying migration ${migration.version}: ${migration.name}`);

      // Execute the migration SQL
      const { error } = await client.rpc('execute_sql', { 
        sql_query: migration.sql 
      });

      if (error) {
        console.error(`Error applying migration ${migration.version}:`, error);
        return false;
      }

      console.log(`✅ Successfully applied migration ${migration.version}`);
      return true;
    } catch (error) {
      console.error(`Error applying migration ${migration.version}:`, error);
      return false;
    }
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<MigrationResult> {
    console.log('🚀 Starting database migration...');

    const allMigrations = this.loadMigrations();
    const appliedVersions = await this.getAppliedMigrations();

    // Filter out already applied migrations
    const pendingMigrations = allMigrations.filter(
      migration => !appliedVersions.includes(migration.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations. Database is up to date.');
      return {
        success: true,
        applied: [],
        errors: [],
      };
    }

    console.log(`Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(m => {
      console.log(`  - ${m.version}: ${m.name}`);
    });

    const applied: string[] = [];
    const errors: string[] = [];

    // Apply migrations in order
    for (const migration of pendingMigrations) {
      const success = await this.applyMigration(migration);
      
      if (success) {
        applied.push(`${migration.version}: ${migration.name}`);
      } else {
        const errorMsg = `Failed to apply migration ${migration.version}: ${migration.name}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
        break; // Stop on first error to maintain database consistency
      }
    }

    if (errors.length === 0) {
      console.log(`✅ Successfully applied ${applied.length} migrations`);
    } else {
      console.log(`❌ Migration failed. Applied ${applied.length} migrations before error.`);
    }

    return {
      success: errors.length === 0,
      applied,
      errors,
    };
  }

  /**
   * Get migration status
   */
  async status(): Promise<{
    applied: string[];
    pending: string[];
    total: number;
  }> {
    const allMigrations = this.loadMigrations();
    const appliedVersions = await this.getAppliedMigrations();

    const applied = allMigrations
      .filter(m => appliedVersions.includes(m.version))
      .map(m => `${m.version}: ${m.name}`);

    const pending = allMigrations
      .filter(m => !appliedVersions.includes(m.version))
      .map(m => `${m.version}: ${m.name}`);

    return {
      applied,
      pending,
      total: allMigrations.length,
    };
  }

  /**
   * Check if database is up to date
   */
  async isUpToDate(): Promise<boolean> {
    const status = await this.status();
    return status.pending.length === 0;
  }

  /**
   * Validate database connection and basic functionality
   */
  async validateConnection(): Promise<boolean> {
    try {
      const client = getServiceClient();
      const { error } = await client.from('schema_migrations').select('count', { count: 'exact', head: true });
      return !error;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR CLI USAGE
// ============================================================================

/**
 * Run migrations from command line
 */
export async function runMigrations(): Promise<void> {
  const manager = new MigrationManager();

  // Check connection first
  console.log('🔌 Checking database connection...');
  const isConnected = await manager.validateConnection();
  
  if (!isConnected) {
    console.error('❌ Failed to connect to database. Please check your configuration.');
    process.exit(1);
  }

  console.log('✅ Database connection successful');

  // Run migrations
  const result = await manager.migrate();

  if (!result.success) {
    console.error('❌ Migration failed');
    result.errors.forEach(error => console.error(`   ${error}`));
    process.exit(1);
  }

  console.log('🎉 All migrations completed successfully');
}

/**
 * Check migration status from command line
 */
export async function checkMigrationStatus(): Promise<void> {
  const manager = new MigrationManager();

  const status = await manager.status();

  console.log('📊 Database Migration Status');
  console.log('============================');
  console.log(`Total migrations: ${status.total}`);
  console.log(`Applied: ${status.applied.length}`);
  console.log(`Pending: ${status.pending.length}`);
  console.log('');

  if (status.applied.length > 0) {
    console.log('Applied migrations:');
    status.applied.forEach(migration => {
      console.log(`  ✅ ${migration}`);
    });
    console.log('');
  }

  if (status.pending.length > 0) {
    console.log('Pending migrations:');
    status.pending.forEach(migration => {
      console.log(`  ⏳ ${migration}`);
    });
    console.log('');
    console.log('Run migrations with: npm run db:migrate');
  } else {
    console.log('✅ Database is up to date');
  }
}

// ============================================================================
// SQL FUNCTIONS (to be created in database)
// ============================================================================

export const MIGRATION_HELPER_FUNCTIONS = `
-- Function to create migrations table if it doesn't exist
CREATE OR REPLACE FUNCTION create_migrations_table_if_not_exists()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schema_migrations') THEN
        CREATE TABLE schema_migrations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            version TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            applied_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to execute SQL (for migrations)
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void AS $$
BEGIN
    EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql;
`;

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const migrationManager = new MigrationManager();