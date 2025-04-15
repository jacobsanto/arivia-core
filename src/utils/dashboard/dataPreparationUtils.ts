
import { format as dateFormat } from 'date-fns';
import { ExportSection } from '@/components/dashboard/ExportConfigDialog';

/**
 * Prepares dashboard data for export based on selected sections
 */
export const prepareDashboardExportData = (
  dashboardData: any,
  sections: ExportSection[] = ['properties', 'tasks', 'maintenance', 'bookings']
) => {
  const result: Record<string, any[]> = {};
  
  if (sections.includes('properties')) {
    result.properties = formatPropertiesForExport(dashboardData.properties || {});
  }
  
  if (sections.includes('tasks')) {
    result.tasks = formatTasksForExport(dashboardData.tasks || {});
  }
  
  if (sections.includes('maintenance')) {
    result.maintenance = formatMaintenanceForExport(dashboardData.maintenance || {});
  }
  
  if (sections.includes('bookings')) {
    result.bookings = formatBookingsForExport(dashboardData.bookings || []);
  }
  
  return result;
};

/**
 * Formats property data for export
 */
const formatPropertiesForExport = (propertiesData: any) => {
  const { total, occupied, vacant, properties = [] } = propertiesData;
  
  const summary = [
    {
      'Type': 'Summary',
      'Total': total || 0,
      'Occupied': occupied || 0,
      'Vacant': vacant || 0,
      'Occupancy Rate': total ? Math.round((occupied / total) * 100) + '%' : '0%',
      'Date': dateFormat(new Date(), 'yyyy-MM-dd')
    }
  ];
  
  const details = (properties || []).map((prop: any) => ({
    'Property': prop.name,
    'Status': prop.status,
    'Capacity': prop.capacity,
    'Current Guests': prop.guestCount,
    'Check In': prop.nextCheckIn ? dateFormat(new Date(prop.nextCheckIn), 'yyyy-MM-dd') : 'N/A',
    'Check Out': prop.nextCheckOut ? dateFormat(new Date(prop.nextCheckOut), 'yyyy-MM-dd') : 'N/A'
  }));
  
  return [...summary, ...details];
};

/**
 * Formats task data for export
 */
const formatTasksForExport = (tasksData: any) => {
  const { total, completed, pending, tasks = [] } = tasksData;
  
  const summary = [
    {
      'Type': 'Summary',
      'Total': total || 0,
      'Completed': completed || 0,
      'Pending': pending || 0,
      'Completion Rate': total ? Math.round((completed / total) * 100) + '%' : '0%',
      'Date': dateFormat(new Date(), 'yyyy-MM-dd')
    }
  ];
  
  const details = (tasks || []).map((task: any) => ({
    'Title': task.title,
    'Status': task.status,
    'Priority': task.priority,
    'Property': task.property,
    'Due Date': task.dueDate ? dateFormat(new Date(task.dueDate), 'yyyy-MM-dd') : 'N/A',
    'Assigned To': task.assignedTo
  }));
  
  return [...summary, ...details];
};

/**
 * Formats maintenance data for export
 */
const formatMaintenanceForExport = (maintenanceData: any) => {
  const { total, critical, standard, tasks = [] } = maintenanceData;
  
  const summary = [
    {
      'Type': 'Summary',
      'Total': total || 0,
      'Critical': critical || 0,
      'Standard': standard || 0,
      'Critical Rate': total ? Math.round((critical / total) * 100) + '%' : '0%',
      'Date': dateFormat(new Date(), 'yyyy-MM-dd')
    }
  ];
  
  const details = (tasks || []).map((task: any) => ({
    'Title': task.title,
    'Status': task.status,
    'Priority': task.priority,
    'Property': task.property,
    'Due Date': task.dueDate ? dateFormat(new Date(task.dueDate), 'yyyy-MM-dd') : 'N/A',
    'Category': task.category || 'General',
    'Estimated Cost': task.estimatedCost || 'N/A'
  }));
  
  return [...summary, ...details];
};

/**
 * Formats booking data for export
 */
const formatBookingsForExport = (bookings: any[] = []) => {
  return bookings.map((booking: any) => ({
    'Property': booking.property,
    'Guest': booking.guestName,
    'Check In': booking.checkIn ? dateFormat(new Date(booking.checkIn), 'yyyy-MM-dd') : 'N/A',
    'Check Out': booking.checkOut ? dateFormat(new Date(booking.checkOut), 'yyyy-MM-dd') : 'N/A',
    'Nights': booking.nights || 0,
    'Status': booking.status,
    'Amount': booking.amount ? `€${booking.amount}` : 'N/A',
    'Channel': booking.channel || 'Direct'
  }));
};

/**
 * Generates weekly review data for dashboard
 */
export const generateWeeklyReview = (dashboardData: any, propertyFilter: string) => {
  try {
    console.log('Generating weekly review for property:', propertyFilter);
    return true;
  } catch (error) {
    console.error('Error generating weekly review:', error);
    return false;
  }
};
