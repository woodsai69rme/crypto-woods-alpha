// Error reporting utility for tracking and managing application errors

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

class ErrorReporting {
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

    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        component: 'Global',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        component: 'Promise',
        additionalData: {
          reason: event.reason,
        },
      });
    });
  }

  public static getInstance(): ErrorReporting {
    if (!ErrorReporting.instance) {
      ErrorReporting.instance = new ErrorReporting();
    }
    return ErrorReporting.instance;
  }

  public reportError(error: ErrorReport): void {
    console.error('Error reported:', error);
    
    this.errorQueue.push(error);
    this.persistError(error);
    
    if (this.isOnline) {
      this.flushErrorQueue();
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      for (const error of errorsToSend) {
        await this.sendErrorToService(error);
      }
    } catch (sendError) {
      console.error('Failed to send errors:', sendError);
      // Put errors back in queue if sending failed
      this.errorQueue.unshift(...errorsToSend);
    }
  }

  private async sendErrorToService(error: ErrorReport): Promise<void> {
    // In a real application, this would send to an error tracking service
    // like Sentry, LogRocket, Bugsnag, etc.
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // For now, just store in localStorage as a fallback
      const storedErrors = this.getStoredErrors();
      storedErrors.push(error);
      localStorage.setItem('error_reports', JSON.stringify(storedErrors.slice(-50))); // Keep last 50 errors
      
      console.log('Error sent to service:', error.message);
    } catch (serviceError) {
      console.error('Error service unavailable:', serviceError);
      throw serviceError;
    }
  }

  private persistError(error: ErrorReport): void {
    try {
      const storedErrors = this.getStoredErrors();
      storedErrors.push(error);
      localStorage.setItem('error_reports_local', JSON.stringify(storedErrors.slice(-100))); // Keep last 100 errors locally
    } catch (storageError) {
      console.error('Failed to persist error locally:', storageError);
    }
  }

  public getStoredErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('error_reports_local');
      return stored ? JSON.parse(stored) : [];
    } catch (parseError) {
      console.error('Failed to parse stored errors:', parseError);
      return [];
    }
  }

  public clearStoredErrors(): void {
    try {
      localStorage.removeItem('error_reports_local');
      localStorage.removeItem('error_reports');
    } catch (clearError) {
      console.error('Failed to clear stored errors:', clearError);
    }
  }

  public getErrorStats(): { totalErrors: number; recentErrors: number; topErrors: Array<{ message: string; count: number }> } {
    const errors = this.getStoredErrors();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentErrors = errors.filter(error => new Date(error.timestamp) > oneHourAgo);
    
    // Count error frequency
    const errorCounts = errors.reduce((acc, error) => {
      acc[error.message] = (acc[error.message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));

    return {
      totalErrors: errors.length,
      recentErrors: recentErrors.length,
      topErrors,
    };
  }
}

// Export singleton instance
export const errorReporter = ErrorReporting.getInstance();

// Convenience function for manual error reporting
export const reportError = (
  error: Error, 
  component?: string, 
  additionalData?: Record<string, any>
): void => {
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