
/**
 * Adapter for Guesty API authentication and requests using Netlify Functions
 */

// Interface for platform adapters
export interface GuestyPlatformAdapter {
  getAuthToken: () => Promise<string>;
  makeRequest: <T>(
    method: string, 
    endpoint: string, 
    params?: Record<string, string>, 
    data?: any
  ) => Promise<T>;
}

// Netlify implementation of the adapter
export class NetlifyGuestyAdapter implements GuestyPlatformAdapter {
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;
  
  async getAuthToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('Using cached Guesty auth token');
      return this.cachedToken;
    }

    try {
      console.log('Requesting new Guesty auth token via Netlify function');
      // Use the Netlify function to securely get a token
      const response = await fetch('/.netlify/functions/guesty-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-token' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.status} ${await response.text()}`);
      }

      const data = await response.json();
      if (!data || !data.token) {
        throw new Error('Failed to obtain Guesty auth token');
      }

      // Cache the token and set expiry (tokens typically last 1 hour, using 55 minutes to be safe)
      this.cachedToken = data.token;
      this.tokenExpiry = Date.now() + 55 * 60 * 1000;
      
      return data.token;
    } catch (error) {
      console.error('Error getting Guesty auth token:', error);
      throw new Error('Failed to authenticate with Guesty API');
    }
  }

  async makeRequest<T>(
    method: string, 
    endpoint: string, 
    params?: Record<string, string>, 
    data?: any
  ): Promise<T> {
    console.log(`Making ${method} request to Guesty API via Netlify function: ${endpoint}`);
    
    try {
      // Build the query string for the Netlify function
      const queryParams = new URLSearchParams();
      queryParams.append('endpoint', endpoint);
      
      // Add additional query parameters if provided
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(`param_${key}`, value);
        });
      }
      
      // Call the Netlify function
      const response = await fetch(`/.netlify/functions/guesty-api?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: data ? JSON.stringify({
          method,
          data
        }) : undefined
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Guesty API error (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in Guesty API request to ${endpoint}:`, error);
      throw error;
    }
  }
}

// Direct API implementation of the adapter (for development environments)
export class DirectGuestyAdapter implements GuestyPlatformAdapter {
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly GUESTY_API_BASE_URL = "https://open-api.guesty.com/v1";
  
  async getAuthToken(): Promise<string> {
    // This implementation is for development purposes only
    // In production, use the NetlifyGuestyAdapter which uses secure server-side authentication
    console.warn('Using DirectGuestyAdapter is not recommended for production!');
    
    // In a real implementation, you would store credentials securely and handle token retrieval
    // For now, we'll just return a placeholder
    return "development_token_placeholder";
  }
  
  async makeRequest<T>(
    method: string, 
    endpoint: string, 
    params?: Record<string, string>, 
    data?: any
  ): Promise<T> {
    // This is just a placeholder implementation
    throw new Error('DirectGuestyAdapter is not implemented for security reasons. Use NetlifyGuestyAdapter in production.');
  }
}

// Create a factory function to get the adapter
export function getGuestyAdapter(): GuestyPlatformAdapter {
  // Always use the Netlify adapter as we're focusing on Netlify deployment
  return new NetlifyGuestyAdapter();
}
