
import { supabase } from "@/integrations/supabase/client";

interface GuestyAuthResponse {
  access_token: string;
  expires_in: number;
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
  propertyType?: string;
  cleaningStatus?: {
    value: string;
  };
  picture?: {
    thumbnail?: string;
  };
}

export interface GuestyListingsResponse {
  results: GuestyListing[];
}

export interface GuestySyncResponse {
  success: boolean;
  message: string;
  listingsCount?: number;
  bookingsSynced?: number;
  nextRetryTime?: string;
}

export interface BookingSyncResponse {
  success: boolean;
  message: string;
  bookingsSynced?: number;
}

export class GuestyService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  async ensureValidToken(): Promise<string> {
    const now = Date.now();
    
    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const { data, error } = await supabase.functions.invoke<GuestyAuthResponse>(
        'guesty-auth',
        {
          body: { action: 'get-token' }
        }
      );

      if (error) throw error;
      if (!data) throw new Error('No data received from auth function');

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Guesty token:', error);
      throw new Error('Failed to authenticate with Guesty');
    }
  }

  async getGuestyListings(): Promise<GuestyListingsResponse> {
    try {
      const token = await this.ensureValidToken();

      const response = await fetch('https://open-api.guesty.com/v1/listings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Guesty API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Guesty listings:', error);
      throw error;
    }
  }

  async getGuestyListing(listingId: string): Promise<GuestyListing | null> {
    try {
      const { data, error } = await supabase.functions.invoke('guesty-listing', {
        body: { listingId }
      });

      if (error) throw error;
      if (!data) throw new Error('No data received from listing function');

      return data;
    } catch (error) {
      console.error('Error fetching Guesty listing:', error);
      throw error;
    }
  }

  async checkApiHealth(): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('guesty-health-check');
      
      if (error) throw error;
      if (!data) throw new Error('No data received from health check function');
      
      return data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  }

  async syncListings(): Promise<GuestySyncResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<GuestySyncResponse>('guesty-sync');
      
      if (error) {
        // Format error response
        if (error.message.includes('429')) {
          // Extract retry time from message if available
          const matches = error.message.match(/wait approximately (\d+) minutes/);
          const waitTime = matches ? matches[1] : '15';
          
          return {
            success: false,
            message: `Rate limit reached. Please wait approximately ${waitTime} minutes before retrying.`,
            nextRetryTime: new Date(Date.now() + parseInt(waitTime) * 60 * 1000).toISOString()
          };
        }
        
        return { 
          success: false, 
          message: error.message || 'Sync operation failed' 
        };
      }
      
      if (!data) {
        return { 
          success: false, 
          message: 'No response from sync function' 
        };
      }
      
      return {
        success: data.success,
        message: data.message,
        listingsCount: data.listingsCount,
        bookingsSynced: data.bookingsSynced
      };
    } catch (error) {
      console.error('Error syncing Guesty listings:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during sync operation'
      };
    }
  }

  async syncBookingsForListing(listingId: string): Promise<BookingSyncResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<BookingSyncResponse>('guesty-booking-sync', {
        body: { listingId }
      });
      
      if (error) {
        if (error.message.includes('429')) {
          return {
            success: false,
            message: 'Rate limit reached. Please try again later.'
          };
        }
        
        return { 
          success: false, 
          message: error.message || 'Booking sync operation failed' 
        };
      }
      
      if (!data) {
        return { 
          success: false, 
          message: 'No response from booking sync function' 
        };
      }
      
      return {
        success: data.success,
        message: data.message,
        bookingsSynced: data.bookingsSynced
      };
    } catch (error) {
      console.error('Error syncing bookings for listing:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during booking sync'
      };
    }
  }

  async syncAllBookings(): Promise<BookingSyncResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<BookingSyncResponse>('guesty-booking-sync', {
        body: { syncAll: true }
      });
      
      if (error) {
        if (error.message.includes('429')) {
          return {
            success: false,
            message: 'Rate limit reached. Please try again later.'
          };
        }
        
        return { 
          success: false, 
          message: error.message || 'Booking sync operation failed' 
        };
      }
      
      if (!data) {
        return { 
          success: false, 
          message: 'No response from booking sync function' 
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error syncing all bookings:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during booking sync'
      };
    }
  }
}

export const guestyService = new GuestyService();
