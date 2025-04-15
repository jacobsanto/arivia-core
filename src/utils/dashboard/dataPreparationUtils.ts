
import { ExportSection } from '@/components/dashboard/ExportConfigDialog';

/**
 * Prepares dashboard data for export based on selected sections
 */
export const prepareDashboardExportData = (
  dashboardData: any,
  sections: ExportSection[] = ['properties', 'tasks', 'maintenance', 'bookings']
): Record<string, any[]> => {
  const exportData: Record<string, any[]> = {};
  
  sections.forEach(section => {
    if (dashboardData && dashboardData[section]) {
      // Copy the section data
      if (Array.isArray(dashboardData[section])) {
        exportData[section] = [...dashboardData[section]];
      } else if (typeof dashboardData[section] === 'object' && 
                dashboardData[section] !== null &&
                'data' in dashboardData[section] &&
                Array.isArray(dashboardData[section].data)) {
        // Handle nested data structure
        exportData[section] = [...dashboardData[section].data];
      }
    }
  });
  
  return exportData;
};

/**
 * Formats dashboard metrics for export
 */
export const formatMetricsForExport = (metrics: any) => {
  if (!metrics) return [];
  
  const formattedMetrics = [];
  
  // Format property metrics
  if (metrics.properties) {
    formattedMetrics.push({
      metricType: 'Properties',
      total: metrics.properties.total,
      occupied: metrics.properties.occupied,
      vacant: metrics.properties.vacant,
      occupancyRate: `${((metrics.properties.occupied / metrics.properties.total) * 100).toFixed(1)}%`
    });
  }
  
  // Format task metrics
  if (metrics.tasks) {
    formattedMetrics.push({
      metricType: 'Tasks',
      total: metrics.tasks.total,
      completed: metrics.tasks.completed,
      pending: metrics.tasks.pending,
      completionRate: `${((metrics.tasks.completed / metrics.tasks.total) * 100).toFixed(1)}%`
    });
  }
  
  // Format maintenance metrics
  if (metrics.maintenance) {
    formattedMetrics.push({
      metricType: 'Maintenance',
      total: metrics.maintenance.total,
      critical: metrics.maintenance.critical,
      standard: metrics.maintenance.standard,
      criticalRate: `${((metrics.maintenance.critical / metrics.maintenance.total) * 100).toFixed(1)}%`
    });
  }
  
  return formattedMetrics;
};
