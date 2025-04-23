import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { extractRateLimitInfo } from './utils.ts';

export async function getGuestyToken(): Promise<string> {
  console.log('Getting Guesty authentication token');

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables for Supabase in getGuestyToken');
    throw new Error('Server configuration error: Missing required environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Query existing token
  console.log('Checking for existing valid token');
  const { data: existingToken, error: fetchError } = await supabase
    .from('integration_tokens')
    .select('*')
    .eq('provider', 'guesty')
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching token:', fetchError);
    throw fetchError;
  }

  // If token exists and is still valid, return it
  if (existingToken && new Date(existingToken.expires_at) > new Date()) {
    console.log('Using existing valid token, expires:', new Date(existingToken.expires_at).toISOString());
    return existingToken.access_token;
  }

  // Otherwise get a new token
  console.log('Existing token not found or expired, requesting new token');
  const clientId = Deno.env.get('GUESTY_CLIENT_ID');
  const clientSecret = Deno.env.get('GUESTY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    console.error('Missing Guesty credentials: GUESTY_CLIENT_ID or GUESTY_CLIENT_SECRET');
    throw new Error('Missing Guesty API credentials');
  }

  try {
    const response = await fetch('https://open-api.guesty.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Guesty token request failed:', response.status, response.statusText, errorText);
      throw new Error(`Failed to get Guesty token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully obtained new token, expires in:', data.expires_in, 'seconds');

    if (!data.access_token) {
      console.error('Invalid response from Guesty token endpoint:', data);
      throw new Error('Invalid response from Guesty authentication service');
    }

    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    // Extract and store rate limit information
    const rateLimitInfo = extractRateLimitInfo(response.headers);
    if (rateLimitInfo) {
      console.log('Auth API rate limit info:', rateLimitInfo);
      try {
        await supabase
          .from('guesty_api_usage')
          .insert({
            endpoint: 'auth',
            rate_limit: rateLimitInfo.rate_limit,
            limit: rateLimitInfo.limit || rateLimitInfo.rate_limit,
            remaining: rateLimitInfo.remaining,
            reset: rateLimitInfo.reset,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error storing rate limit info:', error);
      }
    }

    // Upsert the new token
    console.log('Storing new token in database');
    const { error: upsertError } = await supabase
      .from('integration_tokens')
      .upsert({
        provider: 'guesty',
        access_token: data.access_token,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'provider'
      });

    if (upsertError) {
      console.error('Error storing token:', upsertError);
      throw upsertError;
    }

    return data.access_token;
  } catch (err) {
    console.error('Error in Guesty authentication flow:', err);
    throw err;
  }
}
