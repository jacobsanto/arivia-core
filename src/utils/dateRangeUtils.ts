
import { addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

// Updated TimeFilter to include all values used throughout the app
export type TimeFilter = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom' | 'last7' | 'last30' | 'last90' | 'last12months' | 'mtd' | 'qtd' | 'ytd' | 'all';

/**
 * Get date range based on time filter
 */
export const getDateRangeForTimeFilter = (filter: TimeFilter): { from: Date; to: Date } => {
  const now = new Date();
  
  switch (filter) {
    case 'day':
      return {
        from: startOfDay(now),
        to: endOfDay(now)
      };
    case 'week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        to: endOfWeek(now, { weekStartsOn: 1 }) // Sunday
      };
    case 'month':
      return {
        from: startOfMonth(now),
        to: endOfMonth(now)
      };
    case 'mtd':
      return {
        from: startOfMonth(now),
        to: now
      };
    case 'quarter':
      return {
        from: startOfQuarter(now),
        to: endOfQuarter(now)
      };
    case 'qtd':
      return {
        from: startOfQuarter(now),
        to: now
      };
    case 'year':
      return {
        from: startOfYear(now),
        to: endOfYear(now)
      };
    case 'ytd':
      return {
        from: startOfYear(now),
        to: now
      };
    case 'last7':
      return {
        from: subDays(now, 7),
        to: now
      };
    case 'last30':
      return {
        from: subDays(now, 30),
        to: now
      };
    case 'last90':
      return {
        from: subDays(now, 90),
        to: now
      };
    case 'last12months':
      return {
        from: subDays(now, 365),
        to: now
      };
    case 'all':
      return {
        from: new Date(2000, 0, 1),
        to: now
      };
    case 'custom':
    default:
      return {
        from: subDays(now, 30), // Default to last 30 days for custom
        to: now
      };
  }
};

/**
 * Start of day
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * End of day
 */
export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Format date range for display
 */
export const formatDateRange = (from?: Date, to?: Date): string => {
  if (!from && !to) {
    return 'All Time';
  }
  
  if (from && !to) {
    return `Since ${from.toLocaleDateString()}`;
  }
  
  if (!from && to) {
    return `Until ${to.toLocaleDateString()}`;
  }
  
  return `${from!.toLocaleDateString()} - ${to!.toLocaleDateString()}`;
};

/**
 * Format date range for display with more context
 */
export const formatDateRangeDisplay = (from: Date, to: Date): string => {
  return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
};

/**
 * Get a description for a time filter
 */
export const getDateRangeDescription = (filter: TimeFilter): string => {
  switch (filter) {
    case 'day':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'mtd':
      return 'Month to Date';
    case 'quarter':
      return 'This Quarter';
    case 'qtd':
      return 'Quarter to Date';
    case 'year':
      return 'This Year';
    case 'ytd':
      return 'Year to Date';
    case 'last7':
      return 'Last 7 Days';
    case 'last30':
      return 'Last 30 Days';
    case 'last90':
      return 'Last 90 Days';
    case 'last12months':
      return 'Last 12 Months';
    case 'all':
      return 'All Time';
    case 'custom':
      return 'Custom Period';
    default:
      return 'All Time';
  }
};
