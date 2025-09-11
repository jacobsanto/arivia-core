import React from 'react';
import { logger } from '@/services/logger';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  componentName: string;
  threshold?: number; // milliseconds
}

interface PerformanceEntry {
  componentName: string;
  renderTime: number;
  renderCount: number;
  timestamp: number;
}

class PerformanceMonitor extends React.Component<PerformanceMonitorProps> {
  private renderStart: number = 0;
  private renderCount: number = 0;
  private static performanceEntries: PerformanceEntry[] = [];

  componentDidMount() {
    this.logPerformance('mount');
  }

  componentDidUpdate() {
    this.logPerformance('update');
  }

  componentWillUnmount() {
    this.logPerformance('unmount');
  }

  private logPerformance(phase: string) {
    const renderTime = performance.now() - this.renderStart;
    const threshold = this.props.threshold || 16; // 16ms = 60fps
    
    this.renderCount++;

    const entry: PerformanceEntry = {
      componentName: this.props.componentName,
      renderTime,
      renderCount: this.renderCount,
      timestamp: Date.now(),
    };

    PerformanceMonitor.performanceEntries.push(entry);

    // Log slow renders
    if (renderTime > threshold) {
      logger.performance(
        `Slow render detected in ${this.props.componentName}`,
        renderTime,
        phase
      );
    }

    // Keep only last 100 entries to prevent memory bloat
    if (PerformanceMonitor.performanceEntries.length > 100) {
      PerformanceMonitor.performanceEntries = PerformanceMonitor.performanceEntries.slice(-100);
    }
  }

  static getPerformanceReport() {
    const grouped = PerformanceMonitor.performanceEntries.reduce((acc, entry) => {
      const key = entry.componentName;
      if (!acc[key]) {
        acc[key] = {
          componentName: key,
          totalRenders: 0,
          averageRenderTime: 0,
          maxRenderTime: 0,
          slowRenders: 0,
        };
      }

      acc[key].totalRenders++;
      acc[key].averageRenderTime = 
        (acc[key].averageRenderTime * (acc[key].totalRenders - 1) + entry.renderTime) / 
        acc[key].totalRenders;
      acc[key].maxRenderTime = Math.max(acc[key].maxRenderTime, entry.renderTime);
      
      if (entry.renderTime > 16) {
        acc[key].slowRenders++;
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }

  render() {
    this.renderStart = performance.now();
    return this.props.children;
  }
}

// HOC for easy performance monitoring
export const withPerformanceMonitor = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  threshold?: number
) => {
  const MonitoredComponent = (props: P) => (
    <PerformanceMonitor 
      componentName={componentName || Component.displayName || Component.name}
      threshold={threshold}
    >
      <Component {...props} />
    </PerformanceMonitor>
  );

  MonitoredComponent.displayName = `withPerformanceMonitor(${componentName || Component.displayName || Component.name})`;
  return MonitoredComponent;
};

export { PerformanceMonitor };
