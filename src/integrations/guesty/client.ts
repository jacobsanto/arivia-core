
import { getGuestyAdapter } from './adapter';

/**
 * A simple client for making requests to the Guesty API
 */
export interface GuestyClient {
  get<T>(endpoint: string, params?: Record<string, string>): Promise<T>;
  post<T>(endpoint: string, data: any): Promise<T>;
  put<T>(endpoint: string, data: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

/**
 * Utility functions for Guesty integration
 */
export const guestyUtils = {
  /**
   * Get a default start date for queries (2024-01-01)
   */
  getDefaultStartDate(): string {
    return new Date(2024, 0, 1).toISOString();
  },

  /**
   * Create date range parameters for API queries
   */
  createDateRangeParams(
    prefix: string,
    startDate?: Date,
    endDate?: Date
  ): Record<string, string> {
    const params: Record<string, string> = {};

    if (startDate) {
      params[`${prefix}From`] = startDate.toISOString();
    }

    if (endDate) {
      params[`${prefix}To`] = endDate.toISOString();
    }

    return params;
  },

  /**
   * Format a price with currency symbol
   */
  formatPrice(amount?: number, currency: string = 'EUR'): string {
    if (amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  /**
   * Format a date in a user-friendly way
   */
  formatDate(date?: string | Date): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  },

  /**
   * Check if the app is running on Netlify
   */
  isOnNetlify(): boolean {
    return Boolean(process.env.NETLIFY || window.location.hostname.includes('netlify.app'));
  },

  /**
   * Get the Netlify function base URL
   */
  getNetlifyFunctionUrl(): string {
    return '/.netlify/functions';
  }
};

/**
 * Create a Guesty client using the correct adapter (Netlify or direct API)
 */
export const createGuestyClient = (): GuestyClient => {
  // Get the platform adapter
  const adapter = getGuestyAdapter();

  return {
    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
      return adapter.makeRequest<T>('GET', endpoint, params);
    },

    async post<T>(endpoint: string, data: any): Promise<T> {
      return adapter.makeRequest<T>('POST', endpoint, undefined, data);
    },

    async put<T>(endpoint: string, data: any): Promise<T> {
      return adapter.makeRequest<T>('PUT', endpoint, undefined, data);
    },

    async delete<T>(endpoint: string): Promise<T> {
      return adapter.makeRequest<T>('DELETE', endpoint);
    }
  };
};

// Create and export a singleton instance of the client
export const guestyClient = createGuestyClient();
