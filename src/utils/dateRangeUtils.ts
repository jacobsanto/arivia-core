
import { addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

export type TimeFilter = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

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
    case 'quarter':
      return {
        from: startOfQuarter(now),
        to: endOfQuarter(now)
      };
    case 'year':
      return {
        from: startOfYear(now),
        to: endOfYear(now)
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
