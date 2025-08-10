
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GuestyTokenResponse {
  access_token: string;
  expires_in: number;
}

interface GuestyAuthError {
  error: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing valid token
    const { data: existingToken, error: fetchError } = await supabase
      .from('integration_tokens')
      .select('*')
      .eq('provider', 'guesty')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching token:', fetchError.message, fetchError.stack ?? fetchError);
      throw fetchError;
    }

    // If token exists and is still valid, return it
    if (existingToken && new Date(existingToken.expires_at) > new Date()) {
      console.log('Using existing Guesty token (still valid)');
      return new Response(JSON.stringify({
        access_token: existingToken.access_token,
        expires_in: Math.floor((new Date(existingToken.expires_at).getTime() - Date.now()) / 1000)
      } satisfies GuestyTokenResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If no valid token exists, get a new one
    const clientId = Deno.env.get('GUESTY_CLIENT_ID')!;
    const clientSecret = Deno.env.get('GUESTY_CLIENT_SECRET')!;
    console.log('Requesting new Guesty access token');

    const tokenResponse = await fetch('https://open-api.guesty.com/oauth2/token', {
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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get Guesty token:', errorText);
      throw new Error(`Failed to get Guesty token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Extract and store rate limit information from response headers
    const rateLimitLimit = tokenResponse.headers.get('x-ratelimit-limit');
    const rateLimitRemaining = tokenResponse.headers.get('x-ratelimit-remaining');
    const rateLimitReset = tokenResponse.headers.get('x-ratelimit-reset');

    if (rateLimitLimit && rateLimitRemaining) {
      try {
        await supabase
          .from('guesty_api_usage')
          .insert({
            endpoint: 'auth/token',
            rate_limit: parseInt(rateLimitLimit),
            remaining: parseInt(rateLimitRemaining),
            reset: rateLimitReset || new Date(Date.now() + 3600000).toISOString(),
            timestamp: new Date().toISOString()
          });
      } catch (dbError) {
        console.error('Error storing rate limit info:', dbError?.message, dbError?.stack ?? dbError);
      }
    }

    // Update integration health with rate limit info
    try {
      await supabase
        .from('integration_health')
        .upsert({
          provider: 'guesty',
          status: 'connected',
          updated_at: new Date().toISOString(),
          last_synced: new Date().toISOString(),
          remaining_requests: rateLimitRemaining ? parseInt(rateLimitRemaining) : null,
          is_rate_limited: false,
          last_error: null
        }, {
          onConflict: 'provider'
        });
    } catch (healthError) {
      console.error('Error updating integration health:', healthError?.message, healthError?.stack ?? healthError);
    }

    // Upsert token in database
    const { error: upsertError } = await supabase
      .from('integration_tokens')
      .upsert({
        provider: 'guesty',
        access_token: tokenData.access_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'provider'
      });

    if (upsertError) {
      console.error('Error storing token:', upsertError.message, upsertError.stack ?? upsertError);
      throw upsertError;
    }

    console.log('Successfully retrieved and stored Guesty token.');
    return new Response(JSON.stringify({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in
    } satisfies GuestyTokenResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    // Enhanced error logging
    if (typeof error === "object" && error !== null) {
      console.error('Guesty auth function error:', error.message ?? error, error.stack ?? '');
    } else {
      console.error('Guesty auth function error:', error);
    }

    // Update integration health to error state
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('integration_health')
        .upsert({
          provider: 'guesty',
          status: 'error',
          updated_at: new Date().toISOString(),
          last_error: error instanceof Error ? error.message : String(error)
        }, {
          onConflict: 'provider'
        });
    } catch (healthError) {
      console.error('Failed to update integration health:', healthError?.message, healthError?.stack ?? healthError);
    }

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : String(error)
    } satisfies GuestyAuthError), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
