
import { Report } from "../reports/report.service";
import { format } from "date-fns";

interface AnalyticsMetric {
  name: string;
  description?: string;
  type: 'financial' | 'occupancy' | 'performance' | 'task' | 'activity';
  data: any[];
}

/**
 * Converts analytics data to a report format
 */
export const convertAnalyticsToReport = (
  metric: AnalyticsMetric, 
  reportName: string,
  selectedProperty: string,
  dateRange: { from?: Date; to?: Date },
  userId: string
): Partial<Report> => {
  // Generate a standardized report structure from analytics data
  const report: Partial<Report> = {
    name: reportName,
    type: metric.type === 'task' ? 'task' : 'custom',
    filters: {
      property: selectedProperty,
      metricType: metric.type,
      dateFrom: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      dateTo: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
    },
    date_range: {
      start_date: dateRange.from?.toISOString() || null,
      end_date: dateRange.to?.toISOString() || null,
    },
    created_by: userId
  };
  
  return report;
};

/**
 * Formats analytics data for report display
 */
export const formatAnalyticsDataForReport = (data: any[], type: string): any[] => {
  // Different formats depending on data type
  switch (type) {
    case 'financial':
      return data.map(item => ({
        Period: item.name,
        Revenue: typeof item.revenue === 'number' ? `€${item.revenue}` : item.revenue,
        Expenses: typeof item.expenses === 'number' ? `€${item.expenses}` : item.expenses,
        Profit: typeof item.profit === 'number' ? `€${item.profit}` : item.profit
      }));
    
    case 'occupancy':
      return data.map(item => ({
        Period: item.name,
        'Occupancy Rate': typeof item.occupancy === 'number' ? `${item.occupancy}%` : item.occupancy
      }));
      
    case 'performance':
      return data.map(item => ({
        Property: item.name,
        Revenue: typeof item.revenue === 'number' ? `€${item.revenue}` : item.revenue,
        'Occupancy Rate': typeof item.occupancy === 'number' ? `${item.occupancy}%` : item.occupancy,
        Rating: item.rating || 'N/A'
      }));
      
    case 'task':
      return data.map(item => ({
        Week: item.name,
        'Housekeeping Completion': typeof item.housekeeping === 'number' ? `${item.housekeeping}%` : item.housekeeping,
        'Maintenance Completion': typeof item.maintenance === 'number' ? `${item.maintenance}%` : item.maintenance
      }));
    
    default:
      return data;
  }
};
