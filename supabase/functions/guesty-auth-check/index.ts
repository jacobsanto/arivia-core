
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Response shape expected by frontend
interface GuestyAuthCheckResponse {
  status: "ok" | "error";
  connected_at?: string | null;
  message?: string | null;
}

// Util: check if a valid token exists and not expired
async function checkGuestyConnection(supabase: any): Promise<{ connected: boolean; connected_at: string | null; error?: string }> {
  try {
    const { data: integrationToken, error } = await supabase
      .from("integration_tokens")
      .select("*")
      .eq("provider", "guesty")
      .maybeSingle();

    if (error) {
      return { connected: false, connected_at: null, error: error.message };
    }

    if (
      integrationToken &&
      integrationToken.access_token &&
      integrationToken.expires_at &&
      new Date(integrationToken.expires_at) > new Date()
    ) {
      return { connected: true, connected_at: integrationToken.updated_at || integrationToken.expires_at };
    } else {
      return { connected: false, connected_at: null };
    }
  } catch (err: any) {
    return { connected: false, connected_at: null, error: err.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { connected, connected_at, error } = await checkGuestyConnection(supabase);

    if (connected) {
      return new Response(
        JSON.stringify({
          status: "ok",
          connected_at,
        } satisfies GuestyAuthCheckResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Log for debugging
      console.error("Guesty not connected", error);
      return new Response(
        JSON.stringify({
          status: "error",
          message: error || "No active Guesty connection",
        } satisfies GuestyAuthCheckResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (err: any) {
    console.error("guesty-auth-check error:", err);
    return new Response(
      JSON.stringify({
        status: "error",
        message: err?.message || "Unknown error in Guesty auth check",
      } as GuestyAuthCheckResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
