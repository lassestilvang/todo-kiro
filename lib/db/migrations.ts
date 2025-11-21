import { getDatabase } from './connection';
import { createSchema, createIndexes, seedDefaultData } from './schema';

/**
 * Check if migrations table exists
 */
function ensureMigrationsTable(): void {
  const db = getDatabase();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    )
  `);
}

/**
 * Check if a migration has been applied
 */
function isMigrationApplied(name: string): boolean {
  const db = getDatabase();
  const result = db.prepare('SELECT COUNT(*) as count FROM migrations WHERE name = ?').get(name) as { count: number } | null;
  return (result?.count ?? 0) > 0;
}

/**
 * Mark a migration as applied
 */
function markMigrationApplied(name: string): void {
  const db = getDatabase();
  db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)').run(name, new Date().toISOString());
}

/**
 * Run all pending migrations
 */
export function runMigrations(): void {
  ensureMigrationsTable();

  const migrations = [
    {
      name: '001_initial_schema',
      up: initialSchemaMigration,
    },
  ];

  for (const migration of migrations) {
    if (!isMigrationApplied(migration.name)) {
      console.log(`Running migration: ${migration.name}`);
      migration.up();
      markMigrationApplied(migration.name);
      console.log(`Migration ${migration.name} completed`);
    }
  }
}

/**
 * Initial schema migration
 */
function initialSchemaMigration(): void {
  createSchema();
  createIndexes();
  seedDefaultData();
}
