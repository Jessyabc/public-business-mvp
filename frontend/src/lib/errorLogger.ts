import { useAuth } from '@/contexts/AuthContext';

interface ErrorContext {
  action: string;
  userId?: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Structured error logger with context
 * Logs to console and can be extended to send to error tracking service
 */
export function logError(
  error: Error | unknown,
  context: Partial<ErrorContext> = {}
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  const errorLog = {
    message: errorMessage,
    stack: errorStack,
    ...context,
    timestamp: new Date().toISOString(),
  };
  
  console.error('Error:', errorLog);
  
  // TODO: Send to error tracking service (e.g., Sentry) if available
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context });
  // }
  
  return errorLog;
}

/**
 * Get user context for error logging
 */
export function getUserErrorContext(action: string): Partial<ErrorContext> {
  // Note: This can't use hooks, so we'll get user from auth context where available
  return {
    action,
    timestamp: new Date().toISOString(),
  };
}

