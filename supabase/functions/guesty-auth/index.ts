
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
      const token = await getGuestyToken();
      return new Response(JSON.stringify({ token }), {
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
 * Fetch a new auth token from Guesty API
 */
async function getGuestyToken(): Promise<string> {
  const username = Deno.env.get('GUESTY_USERNAME');
  const password = Deno.env.get('GUESTY_PASSWORD');
  const clientId = Deno.env.get('GUESTY_CLIENT_ID');
  const secret = Deno.env.get('GUESTY_SECRET');

  if (!username || !password || !clientId || !secret) {
    throw new Error('Missing Guesty credentials');
  }

  const tokenEndpoint = 'https://app.guesty.com/api/v1/auth/token';
  
  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username,
        password,
        client_id: clientId,
        client_secret: secret,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Guesty auth failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching Guesty token:', error);
    throw new Error('Failed to authenticate with Guesty');
  }
}
