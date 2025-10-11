/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and custom metrics
 */

import React from 'react';
import { logger } from '@/services/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isProduction = import.meta.env.PROD;

  /**
   * Initialize Web Vitals monitoring
   */
  async initWebVitals() {
    if (!this.isProduction) return;

    try {
      const { onCLS, onFID, onFCP, onLCP, onTTFB } = await import('web-vitals');

      onCLS(this.handleMetric.bind(this));
      onFID(this.handleMetric.bind(this));
      onFCP(this.handleMetric.bind(this));
      onLCP(this.handleMetric.bind(this));
      onTTFB(this.handleMetric.bind(this));
    } catch (error) {
      logger.warn('Failed to initialize Web Vitals', { error });
    }
  }

  /**
   * Handle Web Vitals metric
   */
  private handleMetric(metric: any) {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now()
    };

    this.metrics.push(performanceMetric);

    // Log poor metrics
    if (metric.rating === 'poor') {
      logger.warn('Poor performance metric detected', { metric: performanceMetric });
    }

    // Report to analytics (if available)
    this.reportMetric(performanceMetric);
  }

  /**
   * Report metric to analytics
   */
  private reportMetric(metric: PerformanceMetric) {
    if (!this.isProduction) return;

    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        metric_value: metric.value
      });
    }
  }

  /**
   * Mark custom performance point
   */
  mark(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }

  /**
   * Measure between two marks
   */
  measure(name: string, startMark: string, endMark: string) {
    if (typeof performance !== 'undefined') {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        
        if (measure) {
          logger.debug('Performance measure', { 
            name, 
            duration: measure.duration 
          });
        }
      } catch (error) {
        logger.warn('Failed to measure performance', { name, error });
      }
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const summary = {
      good: 0,
      needsImprovement: 0,
      poor: 0
    };

    this.metrics.forEach(metric => {
      if (metric.rating === 'good') summary.good++;
      else if (metric.rating === 'needs-improvement') summary.needsImprovement++;
      else summary.poor++;
    });

    return summary;
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return (props: P) => {
    React.useEffect(() => {
      performanceMonitor.mark(`${componentName}-mount-start`);
      
      return () => {
        performanceMonitor.mark(`${componentName}-mount-end`);
        performanceMonitor.measure(
          `${componentName}-mount-duration`,
          `${componentName}-mount-start`,
          `${componentName}-mount-end`
        );
      };
    }, []);

    return React.createElement(Component, props);
  };
}

/**
 * Hook for measuring async operations
 */
export function usePerformanceMeasure(operationName: string) {
  const startMeasure = React.useCallback(() => {
    performanceMonitor.mark(`${operationName}-start`);
  }, [operationName]);

  const endMeasure = React.useCallback(() => {
    performanceMonitor.mark(`${operationName}-end`);
    performanceMonitor.measure(
      operationName,
      `${operationName}-start`,
      `${operationName}-end`
    );
  }, [operationName]);

  return { startMeasure, endMeasure };
}

/**
 * Preload a route component
 */
export function preloadRoute(importFn: () => Promise<any>) {
  const onInteraction = () => {
    importFn();
    cleanup();
  };

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      importFn();
      cleanup();
    }
  };

  const cleanup = () => {
    window.removeEventListener('mouseover', onInteraction);
    window.removeEventListener('touchstart', onInteraction);
    window.removeEventListener('visibilitychange', onVisibility);
  };

  window.addEventListener('mouseover', onInteraction, { once: true });
  window.addEventListener('touchstart', onInteraction, { once: true });
  window.addEventListener('visibilitychange', onVisibility);

  return cleanup;
}

// Initialize on import
if (typeof window !== 'undefined') {
  performanceMonitor.initWebVitals();
}
