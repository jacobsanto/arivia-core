
import { getGuestyAdapter } from "./adapter";

// Create a singleton instance of the adapter
const guestyAdapter = getGuestyAdapter();

/**
 * Guesty API client for making authenticated requests
 * Uses a platform adapter to handle authentication and requests
 */
export const guestyClient = {
  /**
   * Make a GET request to the Guesty API
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return guestyAdapter.makeRequest('GET', endpoint, params);
  },

  /**
   * Make a POST request to the Guesty API
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    return guestyAdapter.makeRequest('POST', endpoint, undefined, data);
  },

  /**
   * Make a PUT request to the Guesty API
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    return guestyAdapter.makeRequest('PUT', endpoint, undefined, data);
  },

  /**
   * Make a DELETE request to the Guesty API
   */
  async delete<T>(endpoint: string): Promise<T> {
    return guestyAdapter.makeRequest('DELETE', endpoint, undefined);
  }
};

/**
 * Utils specifically for Guesty API pagination handling
 */
export const guestyUtils = {
  /**
   * Create pagination parameters for Guesty API requests
   */
  createPaginationParams(page: number, limit: number): { skip: number, limit: number } {
    return {
      skip: (page - 1) * limit,
      limit: limit
    };
  },
  
  /**
   * Format date to Guesty compatible format (ISO string)
   */
  formatDate(date: Date): string {
    return date.toISOString();
  }
};
