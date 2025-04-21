
import { supabase } from "@/integrations/supabase/client";

interface GuestyAuthResponse {
  access_token: string;
  expires_in: number;
  retryAfter?: number;
  errorType?: string;
}

export interface GuestyListing {
  _id: string;
  title: string;
  address?: {
    full?: string;
    city?: string;
    country?: string;
  };
  status?: string;
  cleaningStatus?: {
    value: string;
  };
  picture?: {
    thumbnail?: string;
    regular?: string;
    large?: string;
  };
  pictures?: Array<{
    thumbnail?: string;
    regular?: string;
    large?: string;
  }>;
}

export interface GuestyListingsResponse {
  results: GuestyListing[];
}

export interface GuestyApiStatus {
  guesty_status: 'available' | 'unavailable' | 'error';
  status_code?: number;
  message?: string;
}

export class GuestyService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // Increased from 1s to 2s
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 1200; // Increased from 1s to 1.2s
  private isRateLimited: boolean = false;
  private rateLimitExpiry: number | null = null;
  private errorType: string | null = null;

  /**
   * Check the status of the Guesty API
   */
  async checkGuestyStatus(): Promise<GuestyApiStatus> {
    try {
      const { data, error } = await supabase.functions.invoke<GuestyApiStatus>(
        'guesty-auth',
        {
          body: { action: 'check-status' }
        }
      );

      if (error) throw new Error(`Status check failed: ${error.message}`);
      if (!data) throw new Error('No data received from status check');

      return data;
    } catch (error) {
      console.error('Error checking Guesty API status:', error);
      return {
        guesty_status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error checking API status'
      };
    }
  }

  /**
   * Get error details based on error type
   */
  getErrorDetails(errorType: string | null): { message: string, retryTime: number } {
    switch(errorType) {
      case 'rate_limit':
        return {
          message: 'Rate limit reached. Too many requests to the Guesty API.',
          retryTime: 60
        };
      case 'auth_error':
        return {
          message: 'Authentication failed. Please check your Guesty API credentials.',
          retryTime: 0
        };
      case 'server_error':
        return {
          message: 'Guesty servers are experiencing issues. Please try again later.',
          retryTime: 300 // 5 minutes
        };
      default:
        return {
          message: 'An unknown error occurred connecting to Guesty.',
          retryTime: 30
        };
    }
  }

  async ensureValidToken(): Promise<string> {
    const now = Date.now();
    
    // Check if we're currently rate limited
    if (this.isRateLimited && this.rateLimitExpiry && now < this.rateLimitExpiry) {
      const waitTimeSeconds = Math.ceil((this.rateLimitExpiry - now) / 1000);
      const errorDetails = this.getErrorDetails(this.errorType);
      
      throw new Error(`${errorDetails.message} Please try again in ${waitTimeSeconds} seconds.`);
    }
    
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.accessToken;
    }

    // Respect rate limits by delaying requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke<GuestyAuthResponse>(
        'guesty-auth',
        {
          body: { action: 'get-token' }
        }
      );

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to call authentication function: ${error.message}`);
      }
      
      if (!data) throw new Error('No data received from auth function');
      
      // Reset error status
      this.isRateLimited = false;
      this.rateLimitExpiry = null;
      this.errorType = null;
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
      this.retryCount = 0; // Reset retry count on success

      return this.accessToken;
    } catch (error: any) {
      console.error('Error getting Guesty token:', error);
      
      // Extract error type from response if available
      const errorData = this.extractErrorData(error);
      this.errorType = errorData.errorType || null;
      
      // Set rate limited status if appropriate
      if (errorData.isRateLimit) {
        this.isRateLimited = true;
        
        // Get retry time from error or use default
        const retryAfter = errorData.retryAfter || 60;
        this.rateLimitExpiry = Date.now() + (retryAfter * 1000);
        
        const errorDetails = this.getErrorDetails(this.errorType);
        throw new Error(`${errorDetails.message} Please try again in ${retryAfter} seconds.`);
      }
      
      // For auth errors, provide specific message
      if (this.errorType === 'auth_error') {
        const errorDetails = this.getErrorDetails('auth_error');
        throw new Error(errorDetails.message);
      }
      
      // Generic error
      throw new Error('Failed to authenticate with Guesty: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Extract structured error data from various error formats
   */
  private extractErrorData(error: any): {
    isRateLimit: boolean;
    retryAfter?: number;
    errorType?: string;
  } {
    // Check for rate limit in error status or message
    const isRateLimit = 
      error.status === 429 || 
      (error.error && error.error.status === 429) ||
      (error.message && error.message.includes('Rate limit')) ||
      (error.message && error.message.includes('Too many requests'));
    
    // Try to extract retry after value from various error formats
    let retryAfter;
    let errorType;
    
    // If error has response property (fetch API format)
    if (error.response) {
      retryAfter = error.response.headers?.get('retry-after');
      // Extract from response body if it exists
      const responseData = error.response.data;
      if (responseData) {
        retryAfter = retryAfter || responseData.retryAfter;
        errorType = responseData.errorType;
      }
    }
    
    // Extract from error object directly (our custom format)
    retryAfter = retryAfter || error.retryAfter;
    errorType = errorType || error.errorType;
    
    // Extract from nested error property (Supabase format)
    if (error.error) {
      retryAfter = retryAfter || error.error.retryAfter;
      errorType = errorType || error.error.errorType;
    }
    
    // If no retry value found and it's rate limited, use default
    if (isRateLimit && !retryAfter) {
      retryAfter = 60; // Default 60 seconds
    }
    
    // If it's rate limited but no error type, set error type
    if (isRateLimit && !errorType) {
      errorType = 'rate_limit';
    }
    
    return {
      isRateLimit,
      retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
      errorType
    };
  }

  async getGuestyListings(): Promise<GuestyListingsResponse> {
    try {
      const token = await this.ensureValidToken();

      // Respect rate limits for API calls too
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
        );
      }
      
      this.lastRequestTime = Date.now();

      const response = await fetch('https://open-api.guesty.com/v1/listings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Guesty API error (${response.status}):`, errorText);
        
        // Handle rate limiting
        if (response.status === 429) {
          // Get retry time from headers or use default (60 seconds)
          const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
          
          // Set rate limited status
          this.isRateLimited = true;
          this.rateLimitExpiry = Date.now() + (retryAfter * 1000);
          this.errorType = 'rate_limit';
          
          const errorDetails = this.getErrorDetails('rate_limit');
          throw new Error(`${errorDetails.message} Please try again in ${retryAfter} seconds.`);
        }
        
        // Handle server errors
        if (response.status >= 500) {
          this.errorType = 'server_error';
          const errorDetails = this.getErrorDetails('server_error');
          throw new Error(errorDetails.message);
        }
        
        // Handle auth errors
        if (response.status === 401 || response.status === 403) {
          this.errorType = 'auth_error';
          const errorDetails = this.getErrorDetails('auth_error');
          throw new Error(errorDetails.message);
        }
        
        throw new Error(`Guesty API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.retryCount = 0; // Reset retry count on success
      return data;
    } catch (error) {
      console.error('Error fetching Guesty listings:', error);
      throw error;
    }
  }
}

export const guestyService = new GuestyService();
