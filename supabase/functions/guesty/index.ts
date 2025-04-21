import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { corsHeaders } from '../_shared/cors.ts';

const GUESTY_API_URL = Deno.env.get('GUESTY_API_URL') || 'https://app.guesty.com/api/v3';
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
    
    // Updated to use v3 auth endpoint
    const response = await fetch(`${GUESTY_API_URL}/auth/token`, {
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
    
    // Get query parameters from request body
    const body = await req.json();
    const limit = body.limit || 20;
    const cursor = body.cursor || null;
    
    // Updated to use v3 listings endpoint with cursor pagination
    let apiUrl = `${GUESTY_API_URL}/listings?limit=${limit}`;
    if (cursor) {
      apiUrl += `&cursor=${cursor}`;
    }
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
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
    
    // Return consistent response format
    return new Response(
      JSON.stringify({ 
        data: data,
        pagination: {
          next_cursor: data.pagination?.next_cursor,
          has_more: !!data.pagination?.next_cursor
        }
      }),
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
    
    // Get query parameters from request body
    const body = await req.json();
    const limit = body.limit || 20;
    const cursor = body.cursor || null;
    const startDate = body.startDate;
    const endDate = body.endDate;
    
    // Updated to use v3 reservations endpoint with cursor pagination
    let apiUrl = `${GUESTY_API_URL}/reservations?limit=${limit}`;
    
    if (cursor) {
      apiUrl += `&cursor=${cursor}`;
    }
    
    if (startDate) {
      apiUrl += `&startDate=${startDate}`;
    }
    
    if (endDate) {
      apiUrl += `&endDate=${endDate}`;
    }
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
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
    
    // Return consistent response format
    return new Response(
      JSON.stringify({ 
        data: data,
        pagination: {
          next_cursor: data.pagination?.next_cursor,
          has_more: !!data.pagination?.next_cursor
        }
      }),
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

// Keep the existing property mapping functions as they interact with our database, not Guesty API
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

// Keep existing mappings functions intact
async function handleGetMappings(req: Request): Promise<Response> {
  try {
    const { data, error } = await supabase
      .from('guesty_properties')
      .select('*');
      
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true, data: data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get mappings handler:', error);
    await logGuestyAction('get_mappings', false, `Error: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleDeleteMapping(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { propertyId } = body;
    
    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: 'Missing property ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { error } = await supabase
      .from('guesty_properties')
      .delete()
      .eq('property_id', propertyId);
      
    if (error) throw error;
    
    await logGuestyAction('delete_mapping', true, `Successfully deleted mapping for property ${propertyId}`);
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in delete mapping handler:', error);
    await logGuestyAction('delete_mapping', false, `Error: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Implement rate limiting and retry logic
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3, delay = 1000): Promise<Response> {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Handle rate limiting (429 Too Many Requests)
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
        console.log(`Rate limited. Retrying after ${retryAfter} seconds. Attempt ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.error(`Request failed (attempt ${attempt}/${maxRetries}):`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  throw lastError || new Error('Request failed after multiple retries');
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse body here to determine the action
    const contentType = req.headers.get('content-type') || '';
    let action = '';
    
    if (contentType.includes('application/json')) {
      try {
        const body = await req.clone().json();
        action = body.action || '';
      } catch (e) {
        console.error('Error parsing JSON body:', e);
      }
    }
    
    // Route handling based on action from body
    switch (action) {
      case 'listings':
        return await handleListings(req);
      case 'bookings':
        return await handleBookings(req);
      case 'sync-property':
        return await handleSyncProperty(req);
      case 'get-mappings':
        return await handleGetMappings(req);
      case 'delete-mapping':
        return await handleDeleteMapping(req);
      default:
        return new Response(
          JSON.stringify({ 
            error: 'Not found', 
            action: action || 'none specified',
            message: 'Unknown action requested. Valid actions are: listings, bookings, sync-property, get-mappings, delete-mapping'
          }),
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
