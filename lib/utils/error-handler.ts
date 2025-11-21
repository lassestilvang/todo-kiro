import { toast } from "@/hooks/use-toast";

/**
 * Display a user-friendly error message as a toast notification
 */
export function showErrorToast(error: unknown, context?: string) {
  let message = "An unexpected error occurred";
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }
  
  // Log the full error for debugging
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  // Show user-friendly toast
  toast({
    variant: "destructive",
    title: context ? `Error: ${context}` : "Error",
    description: message,
  });
}

/**
 * Get a user-friendly error message from an error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  return "An unexpected error occurred";
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      showErrorToast(error, context);
      throw error;
    }
  }) as T;
}
