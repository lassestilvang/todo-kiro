/**
 * Test database utilities for isolated test execution
 */

import Database from 'better-sqlite3';
import { runMigrations } from '../db/migrations';

let testDbCounter = 0;

/**
 * Create an isolated in-memory database for testing
 */
export function createTestDatabase(): Database.Database {
  // Use unique in-memory database for each test
  const dbName = `:memory:`;
  const db = new Database(dbName);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Use WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  
  return db;
}

/**
 * Initialize test database with schema and default data
 */
export async function initializeTestDatabase(db: Database.Database): Promise<void> {
  // Run migrations
  runMigrations(db);
  
  // Create default Inbox list
  const inboxId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO lists (id, name, emoji, color, is_default, position, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    inboxId,
    'Inbox',
    '📥',
    null,
    1,
    0,
    new Date().toISOString(),
    new Date().toISOString()
  );
}

/**
 * Clean up test database
 */
export function closeTestDatabase(db: Database.Database): void {
  if (db.open) {
    db.close();
  }
}

/**
 * Get a fresh test database with schema and default data
 */
export async function getTestDatabase(): Promise<Database.Database> {
  const db = createTestDatabase();
  await initializeTestDatabase(db);
  return db;
}
