// Only enforce server-only in production/development, not in tests
if (process.env.NODE_ENV !== 'test' && typeof window === 'undefined') {
  require('server-only');
}
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

/**
 * Get or create the database connection
 */
export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Create database directory if it doesn't exist
  const dbDir = path.join(process.cwd(), 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create database connection
  const dbPath = path.join(dbDir, 'tasks.db');
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');

  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Reset the database (for testing)
 */
export function resetDatabase(): void {
  if (db) {
    // Disable foreign keys temporarily
    db.pragma('foreign_keys = OFF');
    
    // Get all table names
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
    
    // Drop all tables
    for (const table of tables) {
      db.exec(`DROP TABLE IF EXISTS ${table.name}`);
    }
    
    // Re-enable foreign keys
    db.pragma('foreign_keys = ON');
  }
}

/**
 * Execute a database migration
 */
export function runMigration(migration: string): void {
  const database = getDatabase();
  database.exec(migration);
}
