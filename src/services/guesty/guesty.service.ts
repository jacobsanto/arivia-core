
import { supabase } from "@/integrations/supabase/client";

interface GuestyAuthResponse {
  access_token: string;
  expires_in: number;
}

export class GuestyService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  async ensureValidToken(): Promise<string> {
    const now = Date.now();
    
    // If we have a valid token that hasn't expired, return it
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
      // Set expiry time slightly before actual expiry to ensure token validity
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Guesty token:', error);
      throw new Error('Failed to authenticate with Guesty');
    }
  }

  async fetchListings() {
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

  // Add more Guesty API methods as needed...
}

// Export a singleton instance
export const guestyService = new GuestyService();
