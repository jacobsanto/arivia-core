import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      status: 204,
    });
  }
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds, increased from 1s
const MAX_RETRY_DELAY = 30000; // Maximum 30 seconds between retries

// Main serve function
serve(async (req: Request) => {
  // Check for CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Check if it's a POST request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Parse request body
    const { action } = await req.json();

    // Status check action
    if (action === 'check-status') {
      try {
        // Simple ping to check if we can connect to Guesty API
        const response = await fetch('https://open-api.guesty.com/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        const isGuesty200 = response.ok;
        const guesty_status = isGuesty200 ? 'available' : 'unavailable';
        const status_code = response.status;
        
        return new Response(JSON.stringify({ 
          guesty_status, 
          status_code,
          message: isGuesty200 ? 'Guesty API is available' : `Guesty API returned status: ${response.status}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } catch (error) {
        console.error('Error checking Guesty status:', error);
        return new Response(JSON.stringify({ 
          guesty_status: 'error', 
          message: `Could not reach Guesty API: ${error.message}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Still return 200 to indicate our function worked
        });
      }
    }

    // Get token is the primary action
    if (action === 'get-token') {
      try {
        // Try to get token with retries and exponential backoff
        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            console.log(`Attempt ${attempt + 1} to get Guesty token`);
            
            // Add delay for retries (not for first attempt) with exponential backoff
            if (attempt > 0) {
              const delay = Math.min(
                INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1),
                MAX_RETRY_DELAY
              );
              console.log(`Waiting ${delay}ms before retry`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            const { access_token, expires_in } = await getGuestyToken();
            
            console.log("Successfully obtained Guesty token after attempt", attempt + 1);
            return new Response(JSON.stringify({ access_token, expires_in }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          } catch (error) {
            lastError = error;
            
            // Log detailed error information
            console.error(`Error on attempt ${attempt + 1}:`, {
              message: error.message,
              status: error.status || 'unknown',
              details: error.details || 'no details'
            });
            
            // Only retry on rate limit errors (429) or temporary server errors (5xx)
            const status = error.status || (error.message && error.message.includes('429') ? 429 : 0);
            if (status !== 429 && !(status >= 500 && status < 600)) {
              console.error(`Non-retryable error (${status}) on attempt ${attempt + 1}:`, error);
              break;
            }
            
            console.warn(`Rate limited or server error (${status}) on attempt ${attempt + 1}, will retry`);
          }
        }
        
        // If we got here, all retry attempts failed
        console.error('All retry attempts failed:', lastError);
        
        // Determine error type for better messaging
        if (lastError.status === 429 || (lastError.message && lastError.message.includes('429'))) {
          return new Response(JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: 'Too many requests to Guesty API. Please try again later.',
            retryAfter: 60, // Suggest waiting 60 seconds
            errorType: 'rate_limit'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429,
          });
        } else if (lastError.status >= 500 && lastError.status < 600) {
          return new Response(JSON.stringify({ 
            error: 'Guesty server error',
            message: 'Guesty API is experiencing issues. Please try again later.',
            errorType: 'server_error'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: lastError.status,
          });
        } else if (lastError.status === 401 || lastError.status === 403) {
          return new Response(JSON.stringify({ 
            error: 'Authentication failed',
            message: 'Invalid credentials or access denied. Please check your Guesty API credentials.',
            errorType: 'auth_error'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: lastError.status,
          });
        }
        
        // Generic error fallback
        return new Response(JSON.stringify({ 
          error: lastError.message || 'Unknown error',
          errorType: 'unknown'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: lastError.status || 500,
        });
      } catch (error) {
        console.error('Guesty auth function error:', error);
        
        return new Response(JSON.stringify({ 
          error: error.message,
          errorType: 'function_error'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    } else if (action !== 'check-status') {
      return new Response(JSON.stringify({ error: 'Invalid action', errorType: 'invalid_action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    console.error('Guesty auth function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      errorType: 'parse_error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/**
 * Fetch a new auth token from Guesty API using client credentials flow
 */
async function getGuestyToken(): Promise<{ access_token: string; expires_in: number }> {
  const clientId = Deno.env.get('GUESTY_CLIENT_ID');
  const clientSecret = Deno.env.get('GUESTY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw { 
      message: 'Missing Guesty credentials',
      status: 400,
      details: 'GUESTY_CLIENT_ID or GUESTY_CLIENT_SECRET environment variable not set'
    };
  }

  const tokenEndpoint = 'https://open-api.guesty.com/oauth2/token';
  
  try {
    // Use URLSearchParams for x-www-form-urlencoded format
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');
    
    console.log('Sending token request to Guesty...');
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Guesty auth response: ${response.status} ${errorText}`);
      throw {
        message: `Guesty auth failed with status: ${response.status}`,
        status: response.status,
        details: errorText
      };
    }

    const data = await response.json();
    console.log('Successfully obtained Guesty access token');
    
    return {
      access_token: data.access_token,
      expires_in: data.expires_in
    };
  } catch (error) {
    console.error('Error fetching Guesty token:', error);
    // Preserve the error structure if it's our custom format
    if (error.status && error.message) {
      throw error;
    }
    // Otherwise, create a structured error
    throw {
      message: error.message || 'Failed to fetch Guesty token',
      status: error.status || 500,
      details: error.toString()
    };
  }
}
