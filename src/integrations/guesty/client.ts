
import { supabase } from "@/integrations/supabase/client";

const GUESTY_API_BASE_URL = "https://open-api.guesty.com/v1";

// Cached tokens to minimize API calls
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Get a valid authentication token for Guesty API
 * Tokens are cached and only refreshed when expired
 */
async function getAuthToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    // Use the edge function to securely get a token
    const { data, error } = await supabase.functions.invoke('guesty-auth', {
      body: { action: 'get-token' }
    });

    if (error) throw error;
    if (!data || !data.token) throw new Error('Failed to obtain Guesty auth token');

    // Cache the token and set expiry (tokens typically last 1 hour, using 55 minutes to be safe)
    cachedToken = data.token;
    tokenExpiry = Date.now() + 55 * 60 * 1000;
    
    return data.token;
  } catch (error) {
    console.error('Error getting Guesty auth token:', error);
    throw new Error('Failed to authenticate with Guesty API');
  }
}

/**
 * Guesty API client for making authenticated requests
 */
export const guestyClient = {
  /**
   * Make a GET request to the Guesty API
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const token = await getAuthToken();
    
    const url = new URL(`${GUESTY_API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Guesty API error: ${response.status} ${await response.text()}`);
    }

    return response.json();
  },

  /**
   * Make a POST request to the Guesty API
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const token = await getAuthToken();
    
    const response = await fetch(`${GUESTY_API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Guesty API error: ${response.status} ${await response.text()}`);
    }

    return response.json();
  },

  /**
   * Make a PUT request to the Guesty API
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const token = await getAuthToken();
    
    const response = await fetch(`${GUESTY_API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Guesty API error: ${response.status} ${await response.text()}`);
    }

    return response.json();
  },

  /**
   * Make a DELETE request to the Guesty API
   */
  async delete<T>(endpoint: string): Promise<T> {
    const token = await getAuthToken();
    
    const response = await fetch(`${GUESTY_API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Guesty API error: ${response.status} ${await response.text()}`);
    }

    return response.json();
  }
};
