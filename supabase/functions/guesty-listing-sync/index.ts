import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Core configuration
const GUESTY_API_URL = "https://open-api.guesty.com/v1/listings";
const BATCH_SIZE = 100; // Maximum listings per request
const MAX_RETRY_ATTEMPTS = 3; // Maximum retries for rate limiting

// Set up CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Response helper functions for consistent API responses
 */
function createResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 500) {
  console.error(`[guesty-listing-sync] Error: ${message}`);
  return createResponse({ success: false, error: message }, status);
}

/**
 * Get Guesty access token using OAuth2 client credentials flow
 */
async function getGuestyAccessToken() {
  try {
    const clientId = Deno.env.get("GUESTY_CLIENT_ID");
    const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("Missing Guesty credentials");
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    });
    
    const resp = await fetch("https://open-api.guesty.com/oauth2/token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded", 
        "Accept": "application/json" 
      },
      body: params,
    });
    
    if (!resp.ok) {
      throw new Error(`Failed to get Guesty token: ${resp.statusText} (${resp.status})`);
    }
    
    const data = await resp.json();
    if (!data.access_token) {
      throw new Error("No access_token in Guesty response");
    }
    
    return data.access_token;
  } catch (err) {
    console.error("[guesty-listing-sync] Auth error:", err);
    throw err;
  }
}

/**
 * Extract rate limiting information from response headers
 */
function extractRateLimitInfo(headers: Headers) {
  return {
    limit: parseInt(headers.get("x-ratelimit-limit") || "0"),
    remaining: parseInt(headers.get("x-ratelimit-remaining") || "0"),
    reset: headers.get("x-ratelimit-reset") || "",
  };
}

/**
 * Fetch listings from Guesty API with pagination and rate limit handling
 */
async function fetchGuestyListings(token: string, listingId?: string) {
  try {
    // Handle single listing request
    if (listingId) {
      console.log(`[guesty-listing-sync] Fetching single listing: ${listingId}`);
      const res = await fetch(`${GUESTY_API_URL}/${listingId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch listing ${listingId}: ${res.statusText} (${res.status})`);
      }
      
      const listing = await res.json();
      console.log(`[guesty-listing-sync] Successfully fetched listing: ${listingId}`);
      return [listing];
    }
    
    // Handle paginated listings request
    console.log("[guesty-listing-sync] Starting listings fetch with pagination");
    let listings: any[] = [];
    let page = 1;
    let keepPaging = true;
    let retryCount = 0;
    
    while (keepPaging && retryCount < MAX_RETRY_ATTEMPTS) {
      try {
        const url = `${GUESTY_API_URL}?limit=${BATCH_SIZE}&page=${page}`;
        console.log(`[guesty-listing-sync] Fetching page ${page}`);
        
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        });
        
        // Handle rate limiting
        if (res.status === 429) {
          retryCount++;
          console.warn(`[guesty-listing-sync] Rate limited, retry ${retryCount}/${MAX_RETRY_ATTEMPTS}`);
          
          // Extract rate limit info if available
          const limitInfo = extractRateLimitInfo(res.headers);
          console.log(`[guesty-listing-sync] Rate limit info:`, limitInfo);
          
          // Wait before retrying (exponential backoff)
          const waitTime = Math.min(1000 * Math.pow(2, retryCount), 15000);
          console.log(`[guesty-listing-sync] Waiting ${waitTime}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        if (!res.ok) {
          throw new Error(`Guesty API error: ${res.statusText} (${res.status})`);
        }
        
        // Reset retry counter on successful request
        retryCount = 0;
        
        const body = await res.json();
        if (!body.results || !Array.isArray(body.results)) {
          throw new Error(`Unexpected response format from Guesty API`);
        }
        
        // Log rate limit info on successful request
        const limitInfo = extractRateLimitInfo(res.headers);
        console.log(`[guesty-listing-sync] Rate limits - Remaining: ${limitInfo.remaining}/${limitInfo.limit}`);
        
        if (body.results.length > 0) {
          console.log(`[guesty-listing-sync] Got ${body.results.length} listings on page ${page}`);
          listings = listings.concat(body.results);
          keepPaging = body.results.length === BATCH_SIZE;
          page++;
        } else {
          console.log("[guesty-listing-sync] No more listings found");
          keepPaging = false;
        }
      } catch (err) {
        console.error(`[guesty-listing-sync] Error fetching page ${page}:`, err);
        throw err;
      }
    }
    
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      throw new Error(`Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) reached due to rate limiting`);
    }
    
    console.log(`[guesty-listing-sync] Completed fetch, got ${listings.length} listings total`);
    return listings;
  } catch (err) {
    console.error("[guesty-listing-sync] Fetch error:", err);
    throw err;
  }
}

/**
 * Map Guesty listing to our database schema
 */
function mapListing(listing: any) {
  return {
    id: listing._id,
    title: listing.title || "Untitled",
    address: listing.address || {},
    bedrooms: listing.bedrooms || null,
    bathrooms: listing.bathrooms || null,
    max_guests: listing.maxGuests || null,
    square_meters: listing.squareMeters || null,
    property_type: listing.propertyType || null,
    status: listing.status || null,
    thumbnail_url: listing.picture?.thumbnail || null,
    highres_url: listing.picture?.original || listing.picture?.large || null,
    images: Array.isArray(listing.images) ? listing.images : [],
    raw_data: listing,
    sync_status: "active",
    is_deleted: false,
    last_synced: new Date().toISOString()
  };
}

/**
 * Mark obsolete listings (not in current fetch) as archived
 */
async function archiveObsoleteListings(supabase: any, remoteListingIds: string[]) {
  try {
    // Select all non-archived listings
    const { data: localListings, error } = await supabase
      .from("guesty_listings")
      .select("id")
      .eq("sync_status", "active")
      .eq("is_deleted", false);

    if (error) {
      console.error("[guesty-listing-sync] Error loading local listings", error);
      return 0;
    }
    
    // Find listings to archive (in DB but not in current fetch)
    const idsToArchive = (localListings || [])
      .map(l => l.id)
      .filter(id => !remoteListingIds.includes(id));
    
    if (idsToArchive.length === 0) {
      console.log("[guesty-listing-sync] No obsolete listings to archive");
      return 0;
    }
    
    console.log(`[guesty-listing-sync] Archiving ${idsToArchive.length} obsolete listings`);
    
    const { error: archiveError } = await supabase
      .from("guesty_listings")
      .update({
        sync_status: "archived",
        is_deleted: true,
        last_synced: new Date().toISOString()
      })
      .in("id", idsToArchive);
    
    if (archiveError) {
      console.error("[guesty-listing-sync] Error archiving listings", archiveError);
      return 0;
    }
    
    return idsToArchive.length;
  } catch (err) {
    console.error("[guesty-listing-sync] Archive error:", err);
    return 0;
  }
}

/**
 * Log sync operation to sync_logs table
 */
async function logSync(supabase: any, data: { count: number, listingId?: string, error?: string }) {
  try {
    const now = new Date().toISOString();
    await supabase.from("sync_logs").insert({
      service: "guesty",
      sync_type: "listings",
      status: data.error ? "error" : "success",
      message: data.error
        ? `Failed to sync listings${data.listingId ? " (single)" : ""}: ${data.error}`
        : `Synced ${data.count} listing${data.count !== 1 ? "s" : ""}${data.listingId ? ` (single: ${data.listingId})` : ""}`,
      start_time: now,
      end_time: now,
      items_count: data.count
    });
  } catch (err) {
    console.error("[guesty-listing-sync] Error logging sync:", err);
  }
}

/**
 * Upsert a batch of listings to the database
 */
async function upsertListings(supabase: any, listings: any[]) {
  const upserts = [];
  
  for (const listing of listings) {
    try {
      // Prepare for DB
      const mapped = mapListing(listing);
      
      // Check if listing exists
      const { data: existing } = await supabase
        .from("guesty_listings")
        .select("id")
        .eq("id", mapped.id)
        .maybeSingle();
      
      if (existing) {
        // Update existing listing
        await supabase
          .from("guesty_listings")
          .update(mapped)
          .eq("id", mapped.id);
      } else {
        // Insert new listing
        await supabase
          .from("guesty_listings")
          .insert({
            ...mapped,
            first_synced_at: new Date().toISOString()
          });
      }
      
      upserts.push(mapped.id);
    } catch (err) {
      console.error(`[guesty-listing-sync] Failed to upsert listing ${listing?._id}:`, err);
    }
  }
  
  return upserts;
}

// Main handler
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return createResponse({ error: "Method Not Allowed" }, 405);
  }

  try {
    // Extract request parameters
    const urlObj = new URL(req.url);
    let listingId = urlObj.searchParams.get("listing_id");
    let bodyParams: any = {};
    
    try {
      bodyParams = await req.json();
    } catch {
      // Ignore if body parsing fails
    }
    
    // Prioritize body param over query param
    const useListingId = bodyParams?.listing_id || listingId;
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return errorResponse("Missing Supabase credentials", 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Authenticate with Guesty
    console.log("[guesty-listing-sync] Getting Guesty access token");
    const token = await getGuestyAccessToken();
    
    // 2. Fetch listings from Guesty
    console.log(`[guesty-listing-sync] Fetching listings${useListingId ? ` (single: ${useListingId})` : ""}`);
    let listingsRaw: any[] = [];
    
    try {
      listingsRaw = await fetchGuestyListings(token, useListingId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logSync(supabase, { count: 0, listingId: useListingId, error: errorMessage });
      return errorResponse(`Failed to fetch listings: ${errorMessage}`, 500);
    }
    
    // Filter for active listings only (unless single sync, then keep as is)
    const activeListings = useListingId
      ? listingsRaw
      : listingsRaw.filter(l => !l.status || (l.status || "").toLowerCase() === "active");
    
    console.log(`[guesty-listing-sync] Processing ${activeListings.length} listings`);
    
    // 3. Upsert listings to database
    const upserts = await upsertListings(supabase, activeListings);
    
    // 4. Archive obsolete listings (only on full sync)
    let archivedCount = 0;
    if (!useListingId) {
      archivedCount = await archiveObsoleteListings(supabase, upserts);
    }
    
    // 5. Log the sync operation
    await logSync(supabase, { count: upserts.length, listingId: useListingId });
    
    // Return success response
    return createResponse({
      success: true,
      synced: upserts.length,
      archived: archivedCount,
      listing_id: useListingId || undefined,
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[guesty-listing-sync] Handler error:", error);
    return errorResponse(errorMessage, 500);
  }
});
