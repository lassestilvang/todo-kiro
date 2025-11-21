import { addDays, addWeeks, addMonths, addYears, startOfDay, getDay } from 'date-fns';
import type { RecurringPatternType } from '@/types';

/**
 * Calculate the next occurrence date for a recurring task based on the pattern
 * @param currentDate - The current date of the task
 * @param pattern - The recurring pattern type
 * @param customPattern - Custom pattern description (for custom patterns)
 * @returns The next occurrence date, or null if pattern is invalid
 */
export function calculateNextOccurrence(
  currentDate: Date,
  pattern: RecurringPatternType,
  _customPattern?: string | null
): Date | null {
  const baseDate = startOfDay(currentDate);
  
  switch (pattern) {
    case 'daily':
      // Every day - add 1 day
      return addDays(baseDate, 1);
      
    case 'weekly':
      // Every week - add 7 days
      return addWeeks(baseDate, 1);
      
    case 'weekday': {
      // Every weekday (Monday-Friday)
      let nextDate = addDays(baseDate, 1);
      const dayOfWeek = getDay(nextDate);
      
      // If next day is Saturday (6), skip to Monday
      if (dayOfWeek === 6) {
        nextDate = addDays(nextDate, 2);
      }
      // If next day is Sunday (0), skip to Monday
      else if (dayOfWeek === 0) {
        nextDate = addDays(nextDate, 1);
      }
      
      return nextDate;
    }
      
    case 'monthly':
      // Every month - add 1 month
      return addMonths(baseDate, 1);
      
    case 'yearly':
      // Every year - add 1 year
      return addYears(baseDate, 1);
      
    case 'custom':
      // For custom patterns, we would need to parse the customPattern string
      // For now, return null as custom patterns require more complex parsing
      // In a production app, you might use a library like cron-parser
      console.warn('Custom recurring patterns are not fully implemented yet');
      return null;
      
    default:
      return null;
  }
}

/**
 * Check if a recurring task should generate a new instance
 * @param taskDate - The date of the current task instance
 * @param pattern - The recurring pattern type
 * @param endDate - Optional end date for the recurring pattern
 * @returns True if a new instance should be generated
 */
export function shouldGenerateNextInstance(
  taskDate: Date,
  pattern: RecurringPatternType,
  endDate?: Date | null
): boolean {
  // Don't generate if there's no valid pattern
  if (!pattern || pattern === 'custom') {
    return false;
  }
  
  // Calculate the next occurrence
  const nextDate = calculateNextOccurrence(taskDate, pattern);
  if (!nextDate) {
    return false;
  }
  
  // Check if next occurrence is before end date (if specified)
  if (endDate) {
    return nextDate <= startOfDay(endDate);
  }
  
  // No end date, so always generate
  return true;
}

/**
 * Get a human-readable description of the recurring pattern
 * @param pattern - The recurring pattern type
 * @param customPattern - Custom pattern description
 * @param endDate - Optional end date
 * @returns A human-readable description
 */
export function getRecurringPatternDescription(
  pattern: RecurringPatternType,
  customPattern?: string | null,
  endDate?: Date | null
): string {
  let description = '';
  
  switch (pattern) {
    case 'daily':
      description = 'Every day';
      break;
    case 'weekly':
      description = 'Every week';
      break;
    case 'weekday':
      description = 'Every weekday';
      break;
    case 'monthly':
      description = 'Every month';
      break;
    case 'yearly':
      description = 'Every year';
      break;
    case 'custom':
      description = customPattern || 'Custom pattern';
      break;
    default:
      return 'No recurrence';
  }
  
  if (endDate) {
    description += ` until ${endDate.toLocaleDateString()}`;
  }
  
  return description;
}
