import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

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
    console.log('[guesty-auth-check] Starting Guesty authentication check');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[guesty-auth-check] Missing Supabase credentials');
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we have valid Guesty credentials
    const clientId = Deno.env.get('GUESTY_CLIENT_ID');
    const clientSecret = Deno.env.get('GUESTY_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error('[guesty-auth-check] Missing Guesty credentials');
      
      // Update integration health
      await supabase
        .from('integration_health')
        .upsert({
          provider: 'guesty',
          status: 'error',
          last_error: 'Missing Guesty API credentials',
          updated_at: new Date().toISOString()
        }, { onConflict: 'provider' });

      return new Response(JSON.stringify({
        success: false,
        error: 'Missing Guesty credentials',
        status: 'configuration_error'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check existing token validity
    const { data: existingToken, error: tokenError } = await supabase
      .from('integration_tokens')
      .select('*')
      .eq('provider', 'guesty')
      .maybeSingle();

    if (tokenError) {
      console.error('[guesty-auth-check] Error fetching token:', tokenError);
    }

    let tokenValid = false;
    let tokenInfo = null;

    if (existingToken && new Date(existingToken.expires_at) > new Date()) {
      // Token exists and is valid
      tokenValid = true;
      tokenInfo = {
        expires_at: existingToken.expires_at,
        time_until_expiry: Math.floor((new Date(existingToken.expires_at).getTime() - Date.now()) / 1000)
      };
      console.log('[guesty-auth-check] Valid token found');
    } else {
      console.log('[guesty-auth-check] No valid token found, testing auth');
      
      // Test authentication by getting a new token
      try {
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

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          tokenValid = true;
          tokenInfo = {
            new_token_obtained: true,
            expires_in: tokenData.expires_in
          };
          console.log('[guesty-auth-check] Successfully obtained new token');
        } else {
          const errorText = await tokenResponse.text();
          console.error('[guesty-auth-check] Failed to get token:', errorText);
          
          // Update integration health with error
          await supabase
            .from('integration_health')
            .upsert({
              provider: 'guesty',
              status: 'error',
              last_error: `Authentication failed: ${errorText}`,
              updated_at: new Date().toISOString()
            }, { onConflict: 'provider' });
        }
      } catch (authError) {
        console.error('[guesty-auth-check] Auth test error:', authError);
      }
    }

    // Update integration health
    const healthStatus = tokenValid ? 'connected' : 'error';
    await supabase
      .from('integration_health')
      .upsert({
        provider: 'guesty',
        status: healthStatus,
        updated_at: new Date().toISOString(),
        last_error: tokenValid ? null : 'Authentication check failed'
      }, { onConflict: 'provider' });

    // Log the health check
    console.log(`[guesty-auth-check] Health check completed: ${healthStatus}`);

    return new Response(JSON.stringify({
      success: tokenValid,
      status: healthStatus,
      message: tokenValid ? 'Guesty authentication is working' : 'Guesty authentication failed',
      token_info: tokenInfo,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[guesty-auth-check] Unexpected error:', error);

    // Try to update integration health even on error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '', 
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );
      
      await supabase
        .from('integration_health')
        .upsert({
          provider: 'guesty',
          status: 'error',
          last_error: error instanceof Error ? error.message : String(error),
          updated_at: new Date().toISOString()
        }, { onConflict: 'provider' });
    } catch (updateError) {
      console.error('[guesty-auth-check] Failed to update health status:', updateError);
    }

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});