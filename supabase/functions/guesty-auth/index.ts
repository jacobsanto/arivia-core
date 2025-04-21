
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

    // Get token is the only supported action for now
    if (action === 'get-token') {
      const { access_token, expires_in } = await getGuestyToken();
      return new Response(JSON.stringify({ access_token, expires_in }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    console.error('Guesty auth function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
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
    throw new Error('Missing Guesty credentials');
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
      console.error('Guesty auth response:', response.status, errorText);
      throw new Error(`Guesty auth failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully obtained Guesty access token');
    
    return {
      access_token: data.access_token,
      expires_in: data.expires_in
    };
  } catch (error) {
    console.error('Error fetching Guesty token:', error);
    throw new Error('Failed to authenticate with Guesty');
  }
}
