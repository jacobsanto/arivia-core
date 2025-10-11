/**
 * Lazy-loaded chart wrapper for performance optimization
 * Only loads Recharts when component is visible
 */

import React, { Suspense, lazy } from 'react';
import { CardLoadingSpinner } from '@/components/common/LoadingSpinner/LoadingSpinner';

// Lazy load chart components
const BarChartLazy = lazy(() => import('recharts').then(m => ({ default: m.BarChart })));
const LineChartLazy = lazy(() => import('recharts').then(m => ({ default: m.LineChart })));
const PieChartLazy = lazy(() => import('recharts').then(m => ({ default: m.PieChart })));
const AreaChartLazy = lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));

interface LazyChartProps {
  type: 'bar' | 'line' | 'pie' | 'area';
  children: React.ReactNode;
  [key: string]: any;
}

/**
 * Wrapper for lazy-loaded charts with loading fallback
 */
export const LazyChart: React.FC<LazyChartProps> = ({ type, children, ...props }) => {
  const ChartComponent = {
    bar: BarChartLazy,
    line: LineChartLazy,
    pie: PieChartLazy,
    area: AreaChartLazy
  }[type];

  return (
    <Suspense fallback={<CardLoadingSpinner text="Loading chart..." />}>
      <ChartComponent {...props}>
        {children}
      </ChartComponent>
    </Suspense>
  );
};

/**
 * Intersection Observer hook for lazy chart rendering
 */
export function useChartVisibility(ref: React.RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}

/**
 * Chart container with visibility detection
 */
export const VisibilityAwareChart: React.FC<{
  children: React.ReactNode;
  minHeight?: string;
}> = ({ children, minHeight = '300px' }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isVisible = useChartVisibility(containerRef);

  return (
    <div ref={containerRef} style={{ minHeight }}>
      {isVisible ? children : <CardLoadingSpinner />}
    </div>
  );
};
