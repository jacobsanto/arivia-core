
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { extractRateLimitInfo } from './utils.ts';

export async function getGuestyToken(): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Query existing token
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
    return existingToken.access_token;
  }

  // Otherwise get a new token
  const clientId = Deno.env.get('GUESTY_CLIENT_ID')!;
  const clientSecret = Deno.env.get('GUESTY_CLIENT_SECRET')!;

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
    throw new Error(`Failed to get Guesty token: ${response.statusText}`);
  }

  const data = await response.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  // Extract and store rate limit information
  const rateLimitInfo = extractRateLimitInfo(response.headers);
  if (rateLimitInfo) {
    try {
      await supabase
        .from('guesty_api_usage')
        .insert({
          endpoint: 'auth',
          limit: rateLimitInfo.limit,
          remaining: rateLimitInfo.remaining,
          reset: rateLimitInfo.reset,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing rate limit info:', error);
    }
  }

  // Upsert the new token
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
}
