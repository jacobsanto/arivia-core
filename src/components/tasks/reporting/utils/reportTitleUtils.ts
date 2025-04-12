
/**
 * Utility functions for report title and filename formatting
 */

/**
 * Gets the report title based on the active tab
 * @param activeTab Current active report tab
 * @returns Formatted report title string
 */
export const getReportTitle = (activeTab: string): string => {
  switch (activeTab) {
    case 'properties':
      return "Property Maintenance Report";
    case 'technicians':
      return "Technician Performance Report";
    case 'types':
      return "Maintenance Types Report";
    case 'staff':
      return "Staff Performance Report"; 
    case 'time':
      return "Time Analysis Report";
    default:
      return "Maintenance Report";
  }
};

/**
 * Formats a filename for export based on report title and date range
 * @param activeTab Current active report tab
 * @param dateRange Current date range filter
 * @returns Formatted filename string
 */
export const getFilename = (activeTab: string, dateRange: string): string => {
  const title = getReportTitle(activeTab).toLowerCase().replace(/\s+/g, '-');
  return `${title}-${dateRange}`;
};
