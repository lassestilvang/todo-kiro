// Only enforce server-only in production/development, not in tests
if (process.env.NODE_ENV !== 'test' && typeof window === 'undefined') {
  require('server-only');
}

// Use bun:sqlite for tests, better-sqlite3 for production
const isTest = process.env.NODE_ENV === 'test' || process.env.BUN_ENV === 'test';

// Type for the underlying database (either bun:sqlite or better-sqlite3)
interface UnderlyingDatabase {
  query?: (sql: string) => {
    all: (...params: unknown[]) => unknown[];
    get: (...params: unknown[]) => unknown;
    run: (...params: unknown[]) => void;
  };
  run?: (sql: string, ...params: unknown[]) => void;
  close: () => void;
  pragma?: (pragma: string) => void;
}

type DatabaseInstance = DatabaseAdapter | UnderlyingDatabase;

let db: DatabaseInstance | null = null;

// Adapter to make bun:sqlite compatible with better-sqlite3 API
class DatabaseAdapter {
  private db: UnderlyingDatabase;

  constructor(db: UnderlyingDatabase) {
    this.db = db;
  }

  prepare(sql: string) {
    const stmt = this.db.query!(sql);
    return {
      all: (...params: unknown[]) => stmt.all(...params),
      get: (...params: unknown[]) => stmt.get(...params),
      run: (...params: unknown[]) => {
        stmt.run(...params);
        return { changes: this.db.query!('SELECT changes()').get() };
      },
    };
  }

  exec(sql: string) {
    this.db.run!(sql);
  }

  pragma(pragma: string) {
    this.db.run!(`PRAGMA ${pragma}`);
  }

  transaction(fn: () => void) {
    return () => {
      this.db.run!('BEGIN');
      try {
        fn();
        this.db.run!('COMMIT');
      } catch (error) {
        this.db.run!('ROLLBACK');
        throw error;
      }
    };
  }

  close() {
    this.db.close();
  }
}

/**
 * Get or create the database connection
 */
export function getDatabase(): DatabaseAdapter | UnderlyingDatabase {
  if (db) {
    return db;
  }

  if (isTest) {
    // Use bun:sqlite for tests (in-memory)
    const { Database: BunDatabase } = require('bun:sqlite');
    const bunDb = new BunDatabase(':memory:');
    db = new DatabaseAdapter(bunDb);
  } else {
    // Use better-sqlite3 for production
    const Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');

    // Create database directory if it doesn't exist
    const dbDir = path.join(process.cwd(), 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database connection
    const dbPath = path.join(dbDir, 'tasks.db');
    db = new Database(dbPath);
  }

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
