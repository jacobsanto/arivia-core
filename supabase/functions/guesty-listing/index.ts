
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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

async function getGuestyAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GUESTY_CLIENT_ID');
  const clientSecret = Deno.env.get('GUESTY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing Guesty credentials');
  }

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'client_credentials');

  const response = await fetch('https://open-api.guesty.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Failed to get Guesty access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getGuestyListingById(listingId: string, token: string) {
  console.log(`Fetching Guesty listing with ID: ${listingId}`);
  
  const response = await fetch(`https://open-api.guesty.com/v1/listings/${listingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Guesty API error: ${response.status} - ${response.statusText}`);
    throw new Error(`Failed to fetch listing: ${response.statusText}`);
  }

  return response.json();
}

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Parse request body
    const { listingId } = await req.json();

    if (!listingId) {
      return new Response(JSON.stringify({ error: 'Listing ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get access token
    console.log('Getting Guesty access token...');
    const token = await getGuestyAccessToken();
    
    // Fetch listing details
    const listing = await getGuestyListingById(listingId, token);

    return new Response(JSON.stringify(listing), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in guesty-listing function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
