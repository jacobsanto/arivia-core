import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components to reduce initial bundle size
export const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard').then(module => ({
    default: module.AnalyticsDashboard
  }))
);

export const LazyUserManagement = lazy(() => 
  import('@/components/admin/mvp/MVPUserManagement').then(module => ({
    default: module.MVPUserManagement
  }))
);

export const LazyFinancialReports = lazy(() => 
  import('@/components/analytics/reports/ReportTable').then(module => ({
    default: module.ReportTable
  }))
);

export const LazyPropertyManagement = lazy(() => 
  import('@/components/dashboard/mvp/MVPPropertyOverview').then(module => ({
    default: module.MVPPropertyOverview
  }))
);

// Bundle size monitoring component
export const BundleSizeMonitor: React.FC = () => {
  React.useEffect(() => {
    // Monitor bundle size in development
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const nav = entry as PerformanceNavigationTiming;
            console.log('📦 Bundle Performance:', {
              transferSize: nav.transferSize,
              encodedBodySize: nav.encodedBodySize,
              decodedBodySize: nav.decodedBodySize,
              compressionRatio: nav.encodedBodySize / nav.decodedBodySize
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      return () => observer.disconnect();
    }
  }, []);

  return null;
};

// Optimized component wrappers with loading states
export const OptimizedAnalyticsDashboard: React.FC<{ 
  showAllCharts?: boolean;
  showMonitoring?: boolean;
  propertyFilter?: string;
}> = (props) => (
  <Suspense fallback={<AnalyticsDashboardSkeleton />}>
    <LazyAnalyticsDashboard {...props} />
  </Suspense>
);

export const OptimizedUserManagement: React.FC = () => (
  <Suspense fallback={<UserManagementSkeleton />}>
    <LazyUserManagement />
  </Suspense>
);

export const OptimizedFinancialReports: React.FC<{
  reports?: any[];
  searchQuery?: string;
  statusFilter?: string;
  onSearchChange?: (query: string) => void;
  onStatusChange?: (status: string) => void;
  onEdit?: (report: any) => void;
  onDelete?: (id: string) => void;
  sendingReportId?: string;
  onSendNow?: (id: string) => void;
}> = (props) => (
  <Suspense fallback={<FinancialReportsSkeleton />}>
    <LazyFinancialReports {...props} />
  </Suspense>
);

export const OptimizedPropertyManagement: React.FC = () => (
  <Suspense fallback={<PropertyManagementSkeleton />}>
    <LazyPropertyManagement />
  </Suspense>
);

// Loading skeletons for better UX
const AnalyticsDashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  </div>
);

const UserManagementSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid gap-4">
      {Array(6).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  </div>
);

const FinancialReportsSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-40" />
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    <div className="rounded-md border">
      <div className="grid grid-cols-5 gap-4 p-4 border-b">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b">
          {Array(5).fill(0).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const PropertyManagementSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6).fill(0).map((_, i) => (
      <div key={i} className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Code splitting helper
export const createLazyComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return React.forwardRef<any, T>((props, ref) => (
    <Suspense fallback={fallback || <Skeleton className="h-32 w-full" />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

// Resource preloader
export const useResourcePreloader = () => {
  const preloadComponent = React.useCallback((importFn: () => Promise<any>) => {
    // Preload the component but don't render it
    importFn().catch(console.error);
  }, []);

  const preloadImage = React.useCallback((src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }, []);

  const preloadFont = React.useCallback((href: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }, []);

  return {
    preloadComponent,
    preloadImage,
    preloadFont
  };
};