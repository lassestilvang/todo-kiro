/**
 * Server-side initialization
 * This module handles database initialization on the server
 * It should be imported at the top level to ensure it runs before any database queries
 */

import { initializeDatabase } from './db/init';
import { getInboxList } from './db/queries/lists';
import { seedDefaultData } from './db/schema';

let isInitialized = false;

/**
 * Initialize the database on the server
 * This is called automatically when the module is imported
 */
export function ensureServerInitialized(): void {
  if (isInitialized) {
    return;
  }

  try {
    console.log('Initializing database...');
    
    // Initialize database (creates tables, runs migrations)
    initializeDatabase();
    
    // Ensure default Inbox list exists
    const inbox = getInboxList();
    if (!inbox) {
      console.log('Inbox list not found, creating default data...');
      seedDefaultData();
      console.log('Default Inbox list created');
    } else {
      console.log('Inbox list already exists');
    }
    
    isInitialized = true;
    console.log('Server initialization complete');
  } catch (error) {
    console.error('Failed to initialize server:', error);
    throw error;
  }
}

// Auto-initialize when this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  ensureServerInitialized();
}
