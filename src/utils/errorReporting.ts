export interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  component?: string;
  additionalData?: Record<string, any>;
}

export class ErrorReporting {
  private static instance: ErrorReporting;
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;

  private constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorReporting {
    if (!ErrorReporting.instance) {
      ErrorReporting.instance = new ErrorReporting();
    }
    return ErrorReporting.instance;
  }

  private setupGlobalErrorHandlers() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        component: 'Global Error Handler',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        component: 'Promise Rejection Handler',
        additionalData: {
          reason: event.reason,
        },
      });
    });
  }

  reportError(error: ErrorReport) {
    console.error('Error reported:', error);

    // Add to queue
    this.errorQueue.push(error);

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }

    // Store in localStorage for persistence
    this.persistError(error);
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In a real app, this would send to your error tracking service
      // For now, we'll just log to console and store in audit system
      for (const error of errorsToSend) {
        await this.sendErrorToService(error);
      }
    } catch (sendError) {
      console.error('Failed to send errors:', sendError);
      // Re-add errors to queue for retry
      this.errorQueue.unshift(...errorsToSend);
    }
  }

  private async sendErrorToService(error: ErrorReport) {
    // Simulate sending to error tracking service
    console.log('Sending error to service:', error);
    
    // In a real implementation, you would send to services like:
    // - Sentry
    // - LogRocket
    // - Bugsnag
    // - Your own error tracking API
    
    // For now, we'll store in localStorage as a mock
    const existingErrors = JSON.parse(localStorage.getItem('errorReports') || '[]');
    existingErrors.push(error);
    
    // Keep only last 100 errors
    if (existingErrors.length > 100) {
      existingErrors.splice(0, existingErrors.length - 100);
    }
    
    localStorage.setItem('errorReports', JSON.stringify(existingErrors));
  }

  private persistError(error: ErrorReport) {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('pendingErrors') || '[]');
      existingErrors.push(error);
      
      // Keep only last 50 pending errors
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }
      
      localStorage.setItem('pendingErrors', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.error('Failed to persist error:', storageError);
    }
  }

  getStoredErrors(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('errorReports') || '[]');
    } catch {
      return [];
    }
  }

  clearStoredErrors() {
    localStorage.removeItem('errorReports');
    localStorage.removeItem('pendingErrors');
  }
}

// Export singleton instance
export const errorReporter = ErrorReporting.getInstance();

// Utility function for manual error reporting
export const reportError = (error: Error, component?: string, additionalData?: Record<string, any>) => {
  errorReporter.reportError({
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    component,
    additionalData,
  });
};
