
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter,
  startOfYear, 
  endOfYear,
  subMonths, 
  subWeeks,
  subQuarters,
  subYears
} from 'date-fns';

/**
 * Calculate date range based on selected time range filter
 */
export const getDateRangeForTimeFilter = (timeRangeFilter: string): { from: Date, to: Date } => {
  const today = new Date();
  
  switch (timeRangeFilter) {
    case 'week':
      return {
        from: startOfWeek(today, { weekStartsOn: 1 }), // Week starts on Monday
        to: endOfWeek(today, { weekStartsOn: 1 })
      };
    case 'month':
      return {
        from: startOfMonth(today),
        to: endOfMonth(today)
      };
    case 'quarter':
      return {
        from: startOfQuarter(today),
        to: endOfQuarter(today)
      };
    case 'year':
      return {
        from: startOfYear(today),
        to: endOfYear(today)
      };
    case 'last7':
      return {
        from: subWeeks(today, 1),
        to: today
      };
    case 'last30':
      return {
        from: subMonths(today, 1),
        to: today
      };
    case 'last90':
      return {
        from: subQuarters(today, 1),
        to: today
      };
    case 'last12months':
      return {
        from: subYears(today, 1),
        to: today
      };
    default:
      // Default to current month if unknown time range
      return {
        from: startOfMonth(today),
        to: endOfMonth(today)
      };
  }
};

/**
 * Format date range as a display string
 */
export const formatDateRangeDisplay = (from: Date | undefined, to: Date | undefined): string => {
  if (!from || !to) return 'All time';
  
  // Format options
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric'
  };
  
  return `${from.toLocaleDateString(undefined, options)} - ${to.toLocaleDateString(undefined, options)}`;
};

/**
 * Get description for the current date range
 */
export const getDateRangeDescription = (timeRangeFilter: string): string => {
  switch (timeRangeFilter) {
    case 'week':
      return 'Current Week';
    case 'month':
      return 'Current Month';
    case 'quarter':
      return 'Current Quarter';
    case 'year':
      return 'Current Year';
    case 'last7':
      return 'Last 7 Days';
    case 'last30':
      return 'Last 30 Days';
    case 'last90':
      return 'Last 90 Days';
    case 'last12months':
      return 'Last 12 Months';
    case 'custom':
      return 'Custom Range';
    default:
      return 'All Time';
  }
};
