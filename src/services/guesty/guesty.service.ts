
import { supabase } from "@/integrations/supabase/client";

interface GuestyAuthResponse {
  access_token: string;
  expires_in: number;
  retryAfter?: number;
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

export class GuestyService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 2000;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 1000; // Minimum 1 second between requests
  private isRateLimited: boolean = false;
  private rateLimitExpiry: number | null = null;

  async ensureValidToken(): Promise<string> {
    const now = Date.now();
    
    // Check if we're currently rate limited
    if (this.isRateLimited && this.rateLimitExpiry && now < this.rateLimitExpiry) {
      const waitTimeSeconds = Math.ceil((this.rateLimitExpiry - now) / 1000);
      throw new Error(`Rate limit in effect. Please try again in ${waitTimeSeconds} seconds.`);
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

      if (error) throw error;
      if (!data) throw new Error('No data received from auth function');

      // Reset rate limited status
      this.isRateLimited = false;
      this.rateLimitExpiry = null;
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
      this.retryCount = 0; // Reset retry count on success

      return this.accessToken;
    } catch (error: any) {
      console.error('Error getting Guesty token:', error);
      
      // Check for specific error status
      if (error.status === 429 || 
          (error.message && (
            error.message.includes('Too many requests') || 
            error.message.includes('Rate limit') || 
            error.message.includes('429')
          ))) {
        
        // Set rate limited status
        this.isRateLimited = true;
        
        // Get retry time from error or use default (60 seconds)
        const retryAfter = error.retryAfter || 60;
        this.rateLimitExpiry = Date.now() + (retryAfter * 1000);
        
        throw new Error(`Rate limited by Guesty API. Please try again in ${retryAfter} seconds.`);
      }
      
      throw new Error('Failed to authenticate with Guesty: ' + (error.message || 'Unknown error'));
    }
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
          
          throw new Error(`Rate limited by Guesty API. Please try again in ${retryAfter} seconds.`);
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
