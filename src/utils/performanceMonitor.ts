export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.setupPerformanceObservers();
    this.setupReportingInterval();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObservers() {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart, 'timing');
              this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart, 'timing');
              this.recordMetric('first_paint', navEntry.responseStart - navEntry.fetchStart, 'timing');
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.recordMetric('resource_load_time', resourceEntry.responseEnd - resourceEntry.fetchStart, 'timing', {
                resource: resourceEntry.name,
                type: resourceEntry.initiatorType
              });
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }

      // Paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint') {
              this.recordMetric(entry.name, entry.startTime, 'timing');
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        console.warn('Paint timing observer not supported:', error);
      }
    }

    // Memory usage monitoring
    this.monitorMemoryUsage();
  }

  private monitorMemoryUsage() {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.recordMetric('memory_used', memory.usedJSHeapSize, 'gauge');
        this.recordMetric('memory_total', memory.totalJSHeapSize, 'gauge');
        this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'gauge');
      }
    };

    // Check memory every 10 seconds
    setInterval(checkMemory, 10000);
    checkMemory(); // Initial check
  }

  private setupReportingInterval() {
    // Report metrics every 30 seconds
    setInterval(() => {
      this.reportMetrics();
    }, 30000);
  }

  recordMetric(name: string, value: number, type: 'timing' | 'counter' | 'gauge', tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      type,
      tags,
    };

    this.metrics.push(metric);
    console.log('Performance metric recorded:', metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.splice(0, this.metrics.length - 1000);
    }
  }

  private reportMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToReport = [...this.metrics];
    this.metrics = [];

    // In a real app, send to analytics service
    console.log('Reporting performance metrics:', metricsToReport.length);
    
    // Store in localStorage for demo purposes
    try {
      const existingMetrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
      existingMetrics.push(...metricsToReport);
      
      // Keep only last 500 metrics
      if (existingMetrics.length > 500) {
        existingMetrics.splice(0, existingMetrics.length - 500);
      }
      
      localStorage.setItem('performanceMetrics', JSON.stringify(existingMetrics));
    } catch (error) {
      console.error('Failed to store performance metrics:', error);
    }
  }

  getMetrics(): PerformanceMetric[] {
    try {
      return JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
    } catch {
      return [];
    }
  }

  // Utility methods for specific measurements
  startTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime, 'timing');
    };
  }

  incrementCounter(name: string, tags?: Record<string, string>) {
    this.recordMetric(name, 1, 'counter', tags);
  }

  setGauge(name: string, value: number, tags?: Record<string, string>) {
    this.recordMetric(name, value, 'gauge', tags);
  }

  // Measure component render time
  measureComponentRender(componentName: string): (callback: () => void) => void {
    return (callback: () => void) => {
      const stopTimer = this.startTimer(`component_render_${componentName}`);
      callback();
      stopTimer();
    };
  }

  // Measure API call performance
  measureApiCall(endpoint: string): (promise: Promise<any>) => Promise<any> {
    return async (promise: Promise<any>) => {
      const stopTimer = this.startTimer(`api_call_${endpoint}`);
      try {
        const result = await promise;
        this.incrementCounter(`api_success_${endpoint}`);
        return result;
      } catch (error) {
        this.incrementCounter(`api_error_${endpoint}`);
        throw error;
      } finally {
        stopTimer();
      }
    };
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
