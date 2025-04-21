
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { corsHeaders } from '../_shared/cors.ts';

const GUESTY_API_URL = Deno.env.get('GUESTY_API_URL') || 'https://api.guesty.com/api/v2';
const GUESTY_CLIENT_ID = Deno.env.get('GUESTY_CLIENT_ID');
const GUESTY_SECRET = Deno.env.get('GUESTY_SECRET');

interface GuestyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface GuestyErrorResponse {
  error: string;
  message: string;
}

// Create a Supabase client with the Admin key
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache for auth token to avoid repeated requests
let tokenCache: {
  token: string;
  expiresAt: number;
} | null = null;

async function getGuestyToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    console.log("Using cached Guesty token");
    return tokenCache.token;
  }

  if (!GUESTY_CLIENT_ID || !GUESTY_SECRET) {
    throw new Error('Guesty API credentials not configured');
  }

  console.log("Fetching new Guesty token");
  
  try {
    const authString = btoa(`${GUESTY_CLIENT_ID}:${GUESTY_SECRET}`);
    
    const response = await fetch(`${GUESTY_API_URL}/authentication/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify({
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Guesty auth error:', errorText);
      throw new Error(`Failed to authenticate with Guesty: ${response.statusText}`);
    }

    const data = await response.json() as GuestyTokenResponse;
    
    // Cache the token with a buffer time (5 minutes before expiration)
    const expiresAt = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000);
    tokenCache = {
      token: data.access_token,
      expiresAt
    };
    
    // Log the successful token retrieval
    await logGuestyAction('token_refresh', true, 'Successfully retrieved new Guesty token');
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting Guesty token:', error.message);
    await logGuestyAction('token_refresh', false, `Error getting token: ${error.message}`);
    throw error;
  }
}

async function logGuestyAction(
  action: string, 
  success: boolean, 
  message: string
): Promise<void> {
  try {
    await supabase.from('guesty_sync_logs').insert({
      action,
      success,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log Guesty action:', error);
  }
}

async function handleListings(req: Request): Promise<Response> {
  try {
    const token = await getGuestyToken();
    
    // Get query parameters from request
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit') || '20';
    const offset = url.searchParams.get('offset') || '0';
    
    const response = await fetch(`${GUESTY_API_URL}/listings?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Guesty listings error:', errorText);
      await logGuestyAction('fetch_listings', false, `Error: ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch listings', details: response.statusText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    await logGuestyAction('fetch_listings', true, `Successfully fetched ${data.results?.length || 0} listings`);
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in listings handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleBookings(req: Request): Promise<Response> {
  try {
    const token = await getGuestyToken();
    
    // Get query parameters from request
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit') || '20';
    const offset = url.searchParams.get('offset') || '0';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    let apiUrl = `${GUESTY_API_URL}/reservations?limit=${limit}&offset=${offset}`;
    
    if (startDate) {
      apiUrl += `&startDate=${startDate}`;
    }
    
    if (endDate) {
      apiUrl += `&endDate=${endDate}`;
    }
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Guesty bookings error:', errorText);
      await logGuestyAction('fetch_bookings', false, `Error: ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch bookings', details: response.statusText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    await logGuestyAction('fetch_bookings', true, `Successfully fetched ${data.results?.length || 0} bookings`);
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in bookings handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleSyncProperty(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get request body
    const body = await req.json();
    const { propertyId, guestyListingId } = body;
    
    if (!propertyId || !guestyListingId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // First check if the entry exists
    const { data: existingMapping } = await supabase
      .from('guesty_properties')
      .select('*')
      .eq('property_id', propertyId)
      .maybeSingle();
      
    let result;
    if (existingMapping) {
      // Update the existing mapping
      result = await supabase
        .from('guesty_properties')
        .update({ guesty_listing_id: guestyListingId, updated_at: new Date().toISOString() })
        .eq('property_id', propertyId)
        .select();
    } else {
      // Create a new mapping
      result = await supabase
        .from('guesty_properties')
        .insert({ 
          property_id: propertyId, 
          guesty_listing_id: guestyListingId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
    }
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    await logGuestyAction('sync_property', true, `Successfully mapped property ${propertyId} to Guesty listing ${guestyListingId}`);
    
    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync property handler:', error);
    await logGuestyAction('sync_property', false, `Error: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  const path = url.pathname.replace('/guesty', '').replace(/^\/+/, '');

  try {
    // Route handling based on path
    if (path === 'listings' || path === '/listings') {
      return await handleListings(req);
    } else if (path === 'bookings' || path === '/bookings') {
      return await handleBookings(req);
    } else if (path === 'sync-property' || path === '/sync-property') {
      return await handleSyncProperty(req);
    } else {
      return new Response(
        JSON.stringify({ error: 'Not found', path }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
