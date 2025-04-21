
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      console.error('Error fetching token:', fetchError);
      throw fetchError;
    }

    // If token exists and is still valid, return it
    if (existingToken && new Date(existingToken.expires_at) > new Date()) {
      return new Response(JSON.stringify({
        access_token: existingToken.access_token,
        expires_in: Math.floor((new Date(existingToken.expires_at).getTime() - Date.now()) / 1000)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If no valid token exists, get a new one
    const clientId = Deno.env.get('GUESTY_CLIENT_ID')!;
    const clientSecret = Deno.env.get('GUESTY_CLIENT_SECRET')!;

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
      throw new Error(`Failed to get Guesty token: ${await tokenResponse.text()}`);
    }

    const tokenData = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Upsert token in database
    const { error: upsertError } = await supabase
      .from('integration_tokens')
      .upsert({
        provider: 'guesty',
        access_token: tokenData.access_token,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'provider'
      });

    if (upsertError) {
      console.error('Error storing token:', upsertError);
      throw upsertError;
    }

    return new Response(JSON.stringify({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Guesty auth function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
