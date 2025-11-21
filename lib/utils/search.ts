import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Task } from '@/types';

export interface SearchResult {
  task: Task;
  matches: Array<{
    key: string;
    value: string;
    indices: readonly (readonly [number, number])[];
  }>;
  score: number;
}

// Configure Fuse.js options for optimal fuzzy search
const fuseOptions: IFuseOptions<Task> = {
  keys: [
    {
      name: 'name',
      weight: 0.7, // Task name is more important
    },
    {
      name: 'description',
      weight: 0.3, // Description is less important
    },
  ],
  threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
  distance: 100, // Maximum distance for a match
  minMatchCharLength: 2, // Minimum characters to start matching
  includeScore: true, // Include match score in results
  includeMatches: true, // Include match indices for highlighting
  ignoreLocation: true, // Search entire string, not just beginning
  useExtendedSearch: false,
};

/**
 * Search tasks using fuzzy matching on name and description
 * Optimized to return results within 300ms
 */
export function searchTasks(tasks: Task[], query: string): SearchResult[] {
  // Return empty array if query is too short
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Create Fuse instance with tasks
  const fuse = new Fuse(tasks, fuseOptions);

  // Perform search
  const results = fuse.search(query);

  // Transform results to our SearchResult format
  return results.map((result) => ({
    task: result.item,
    matches: (result.matches || []).map((match) => ({
      key: match.key || '',
      value: match.value || '',
      indices: match.indices || [],
    })),
    score: result.score || 0,
  }));
}

/**
 * Highlight matching text segments in a string
 * Returns an array of text segments with highlight flags
 */
export interface HighlightSegment {
  text: string;
  highlight: boolean;
}

export function highlightMatches(
  text: string,
  indices: readonly (readonly [number, number])[]
): HighlightSegment[] {
  if (!text || !indices || indices.length === 0) {
    return [{ text, highlight: false }];
  }

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;

  // Sort indices by start position
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

  sortedIndices.forEach(([start, end]) => {
    // Add non-highlighted text before this match
    if (start > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, start),
        highlight: false,
      });
    }

    // Add highlighted match
    segments.push({
      text: text.substring(start, end + 1),
      highlight: true,
    });

    lastIndex = end + 1;
  });

  // Add remaining non-highlighted text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      highlight: false,
    });
  }

  return segments;
}
