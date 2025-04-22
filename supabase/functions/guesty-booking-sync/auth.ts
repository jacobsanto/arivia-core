import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

export async function getGuestyToken(): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Try to get existing token
  const { data: tokenData, error: tokenError } = await supabase
    .from('integration_tokens')
    .select('*')
    .eq('provider', 'guesty')
    .maybeSingle();

  // If we have a valid token that's not expired, use it
  if (tokenData && new Date(tokenData.expires_at) > new Date()) {
    return tokenData.access_token;
  }

  // Otherwise, get a new token
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
    throw new Error(`Failed to get Guesty token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString();

  // Store the new token
  await supabase
    .from('integration_tokens')
    .upsert({
      provider: 'guesty',
      access_token: data.access_token,
      expires_at: expires_at
    }, {
      onConflict: 'provider'
    });

  return data.access_token;
}
