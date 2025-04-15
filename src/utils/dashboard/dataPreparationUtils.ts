
import { ExportSection } from '@/components/dashboard/ExportConfigDialog';

/**
 * Format metrics data for export
 * @param metrics Metrics data object
 * @returns Array of formatted metric items
 */
export const formatMetricsForExport = (metrics: any) => {
  if (!metrics) return [];
  
  return Object.entries(metrics).map(([key, value]: [string, any]) => {
    return {
      metric: key,
      value: typeof value === 'object' ? JSON.stringify(value) : value,
      date: new Date().toISOString(),
    };
  });
};

/**
 * Prepare dashboard data for export based on selected sections
 * @param data Dashboard data object
 * @param sections Array of sections to include in export
 * @returns Object with sections as keys and arrays of items as values
 */
export const prepareDashboardExportData = (data: any, sections: ExportSection[] = ['properties', 'tasks', 'maintenance', 'bookings']) => {
  if (!data) return {};
  
  const exportData: Record<string, any[]> = {};
  
  // Process properties data
  if (sections.includes('properties') && data.properties) {
    exportData.properties = formatPropertiesForExport(data.properties);
  }
  
  // Process tasks data
  if (sections.includes('tasks') && data.tasks) {
    exportData.tasks = formatTasksForExport(data.tasks);
  }
  
  // Process maintenance data
  if (sections.includes('maintenance') && data.maintenance) {
    exportData.maintenance = formatMaintenanceForExport(data.maintenance);
  }
  
  // Process bookings data
  if (sections.includes('bookings') && data.bookings) {
    exportData.bookings = formatBookingsForExport(data.bookings);
  }
  
  return exportData;
};

// Helper functions for formatting specific data types
const formatPropertiesForExport = (propertiesData: any) => {
  if (!propertiesData) return [];
  
  // Convert properties object to array if it's not already
  const properties = Array.isArray(propertiesData) 
    ? propertiesData 
    : propertiesData.items || [];
    
  return properties.map((property: any) => ({
    name: property.name || 'Unknown',
    status: property.status || 'Unknown',
    address: property.address || '',
    rooms: property.rooms || 0,
    lastCleaned: property.lastCleaned || 'Never',
    nextBooking: property.nextBooking || 'None',
    owner: property.owner || 'Unknown',
    exportDate: new Date().toISOString(),
  }));
};

const formatTasksForExport = (tasksData: any) => {
  if (!tasksData) return [];
  
  const tasks = Array.isArray(tasksData) 
    ? tasksData 
    : tasksData.items || [];
    
  return tasks.map((task: any) => ({
    title: task.title || 'Untitled Task',
    status: task.status || 'Unknown',
    assignee: task.assignee || 'Unassigned',
    property: task.property || 'Unknown',
    dueDate: task.dueDate || 'No due date',
    priority: task.priority || 'Normal',
    created: task.created || new Date().toISOString(),
    exportDate: new Date().toISOString(),
  }));
};

const formatMaintenanceForExport = (maintenanceData: any) => {
  if (!maintenanceData) return [];
  
  const maintenance = Array.isArray(maintenanceData) 
    ? maintenanceData 
    : maintenanceData.items || [];
    
  return maintenance.map((item: any) => ({
    title: item.title || 'Untitled Issue',
    status: item.status || 'Unknown',
    type: item.type || 'General',
    property: item.property || 'Unknown',
    reportedDate: item.reportedDate || 'Unknown',
    fixedDate: item.fixedDate || 'Not fixed',
    cost: item.cost || 0,
    technician: item.technician || 'Unassigned',
    exportDate: new Date().toISOString(),
  }));
};

const formatBookingsForExport = (bookingsData: any) => {
  if (!bookingsData) return [];
  
  const bookings = Array.isArray(bookingsData) 
    ? bookingsData 
    : bookingsData.items || [];
    
  return bookings.map((booking: any) => ({
    id: booking.id || 'Unknown',
    guestName: booking.guestName || 'Unknown Guest',
    property: booking.property || 'Unknown',
    checkIn: booking.checkIn || 'Unknown',
    checkOut: booking.checkOut || 'Unknown',
    nights: booking.nights || 0,
    guests: booking.guests || 0,
    totalAmount: booking.totalAmount || 0,
    status: booking.status || 'Unknown',
    exportDate: new Date().toISOString(),
  }));
};
