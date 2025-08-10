
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { orchestrateFullSync } from './syncOrchestrator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight handler
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only handle POST requests for triggering full sync
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed', success: false }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Run orchestrator for full Guesty sync
  const result = await orchestrateFullSync();

  return new Response(
    JSON.stringify(result.response),
    { status: result.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
