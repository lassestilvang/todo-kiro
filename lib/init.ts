import { initializeDatabase } from './db/init';
import { getInboxList } from './db/queries/lists';
import { seedDefaultData } from './db/schema';

/**
 * Initialize the application
 * This function should be called when the application starts
 * It initializes the database and ensures default data exists
 */
export async function initializeApp(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Initialize database (creates tables, runs migrations)
    initializeDatabase();
    
    // Ensure default Inbox list exists
    const inbox = getInboxList();
    if (!inbox) {
      console.log('Inbox list not found, creating default data...');
      seedDefaultData();
    }
    
    console.log('Application initialized successfully');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to initialize application:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Load all application data into stores
 * This should be called after the app is initialized
 */
export async function loadAppData(
  loadLists: () => Promise<void>,
  loadLabels: () => Promise<void>,
  loadTasks: () => Promise<void>
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Load data in parallel for better performance
    await Promise.all([
      loadLists(),
      loadLabels(),
      loadTasks(),
    ]);
    
    console.log('Application data loaded successfully');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to load application data:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}
