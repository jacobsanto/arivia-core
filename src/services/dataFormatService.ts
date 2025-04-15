
/**
 * Data formatting utilities for consistent data presentation
 */

import { format, parseISO, isValid } from "date-fns";

/**
 * Format a date string in a consistent format
 * @param dateString - ISO date string
 * @param formatStr - Format string (default: 'MMM d, yyyy')
 */
export const formatDate = (dateString: string | undefined | null, formatStr: string = 'MMM d, yyyy'): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
};

/**
 * Format a currency value consistently
 * @param amount - Number to format
 * @param currency - Currency code (default: 'EUR')
 * @param locale - Locale string (default: 'en-US')
 */
export const formatCurrency = (amount: number | undefined | null, currency: string = 'EUR', locale: string = 'en-US'): string => {
  if (amount === undefined || amount === null) return 'N/A';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `€${amount}`;
  }
};

/**
 * Format a percentage value consistently
 * @param value - Number to format as percentage
 * @param decimalPlaces - Number of decimal places (default: 1)
 */
export const formatPercentage = (value: number | undefined | null, decimalPlaces: number = 1): string => {
  if (value === undefined || value === null) return 'N/A';
  
  try {
    return `${value.toFixed(decimalPlaces)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value}%`;
  }
};

/**
 * Create a consistent identifier for collection items
 */
export const createUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
