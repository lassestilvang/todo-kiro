import { getDatabase, resetDatabase } from './connection';
import { runMigrations } from './migrations';

/**
 * Initialize the database
 * This should be called when the application starts
 */
export function initializeDatabase(): void {
  try {
    // Get database connection
    getDatabase();
    
    // Reset database in test environment
    if (process.env.NODE_ENV === 'test') {
      resetDatabase();
    }
    
    // Run migrations
    runMigrations();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
