
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
      return this.cachedToken;
    }

    try {
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
    const GUESTY_API_BASE_URL = "https://open-api.guesty.com/v1";
    const token = await this.getAuthToken();
    
    let url = new URL(`${GUESTY_API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      throw new Error(`Guesty API error: ${response.status} ${await response.text()}`);
    }

    return response.json();
  }
}

// Create a factory function to get the adapter
export function getGuestyAdapter(): GuestyPlatformAdapter {
  return new NetlifyGuestyAdapter();
}

