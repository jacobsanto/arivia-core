
import { format as dateFormat } from 'date-fns';
import { ExportSection } from '@/components/dashboard/ExportConfigDialog';

/**
 * Prepares dashboard data for export based on selected sections
 */
export const prepareDashboardExportData = (dashboardData: any, sections: ExportSection[]) => {
  const exportData: any[] = [];
  
  // Process property stats
  if (sections.includes('properties') && dashboardData.properties) {
    exportData.push(
      { 
        Section: 'Properties', 
        Metric: 'Total',
        Value: dashboardData.properties.total
      },
      { 
        Section: 'Properties', 
        Metric: 'Occupied',
        Value: dashboardData.properties.occupied
      },
      { 
        Section: 'Properties', 
        Metric: 'Vacant',
        Value: dashboardData.properties.vacant
      }
    );
  }
  
  // Process task stats
  if (sections.includes('tasks') && dashboardData.tasks) {
    exportData.push(
      { 
        Section: 'Tasks', 
        Metric: 'Total',
        Value: dashboardData.tasks.total
      },
      { 
        Section: 'Tasks', 
        Metric: 'Completed',
        Value: dashboardData.tasks.completed
      },
      { 
        Section: 'Tasks', 
        Metric: 'Pending',
        Value: dashboardData.tasks.pending
      }
    );
  }
  
  // Process maintenance stats
  if (sections.includes('maintenance') && dashboardData.maintenance) {
    exportData.push(
      { 
        Section: 'Maintenance', 
        Metric: 'Total',
        Value: dashboardData.maintenance.total
      },
      { 
        Section: 'Maintenance', 
        Metric: 'Critical',
        Value: dashboardData.maintenance.critical
      },
      { 
        Section: 'Maintenance', 
        Metric: 'Standard',
        Value: dashboardData.maintenance.standard
      }
    );
  }
  
  // Process bookings data
  if (sections.includes('bookings') && dashboardData.bookings) {
    dashboardData.bookings.forEach((booking: any) => {
      exportData.push({
        Section: 'Bookings',
        Metric: `Bookings in ${booking.month}`,
        Value: booking.bookings
      });
    });
  }
  
  // Process activity logs
  if (sections.includes('activity') && dashboardData.upcomingTasks) {
    dashboardData.upcomingTasks.forEach((task: any, index: number) => {
      exportData.push({
        Section: 'Activity',
        Metric: `Task ${index + 1}`,
        Value: `${task.title} (${task.dueDate})`
      });
    });
  }
  
  // Process system data - simulated for now
  if (sections.includes('system')) {
    exportData.push(
      {
        Section: 'System',
        Metric: 'Status',
        Value: 'Operational'
      },
      {
        Section: 'System',
        Metric: 'Uptime',
        Value: '99.9%'
      },
      {
        Section: 'System',
        Metric: 'Last Sync',
        Value: dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss')
      }
    );
  }
  
  return exportData;
};
