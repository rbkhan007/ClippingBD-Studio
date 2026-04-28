/**
 * Logger utility - wraps console methods with environment-aware behavior
 * In development: logs to console
 * In production: errors still logged, but info/debug suppressed
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors in production (sent to stdout/server logs)
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    } else {
      // Log warnings sparingly in production
      // Uncomment if needed: console.warn('[WARN]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};

export default logger;
