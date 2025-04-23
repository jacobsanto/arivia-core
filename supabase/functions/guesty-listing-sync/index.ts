import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GUESTY_API_URL = "https://open-api.guesty.com/v1/listings";
const BATCH_SIZE = 100; // batch size per request

// Utility to get Guesty access token
async function getGuestyAccessToken() {
  const clientId = Deno.env.get("GUESTY_CLIENT_ID");
  const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Missing Guesty credentials");
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const resp = await fetch("https://open-api.guesty.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body: params,
  });
  if (!resp.ok) throw new Error(`Failed to get Guesty token: ${resp.statusText}`);
  const data = await resp.json();
  if (!data.access_token) throw new Error("No access_token in Guesty response");
  return data.access_token;
}

// Utility to fetch listings (with batching and optional single listing)
async function fetchGuestyListings(token: string, listingId?: string) {
  if (listingId) {
    const res = await fetch(`${GUESTY_API_URL}/${listingId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to fetch single listing: ${res.statusText}`);
    const listing = await res.json();
    return [listing];
  }

  let listings: any[] = [];
  let page = 1;
  let keepPaging = true;
  while (keepPaging) {
    const url = `${GUESTY_API_URL}?limit=${BATCH_SIZE}&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
    });
    if (res.status === 429) { // Rate limited
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }
    if (!res.ok) throw new Error(`Guesty API error: ${res.statusText}`);
    const body = await res.json();
    if (Array.isArray(body.results) && body.results.length > 0) {
      listings = listings.concat(body.results);
      keepPaging = body.results.length === BATCH_SIZE;
      page++;
    } else {
      keepPaging = false;
    }
  }
  return listings;
}

// Mapping function to shape Guesty listing -> guesty_listings DB row
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

// Archival step: mark local listings as "archived" if not in latest Guesty set
async function archiveObsoleteListings(supabase: any, remoteListingIds: string[]) {
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
  const idsToArchive = (localListings || [])
    .map(l => l.id)
    .filter(id => !remoteListingIds.includes(id));
  if (idsToArchive.length === 0) return 0;
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
}

async function logSync(supabase: any, { count, listingId, error }) {
  const now = new Date().toISOString();
  await supabase.from("sync_logs").insert({
    service: "guesty",
    sync_type: "listings",
    status: error ? "error" : "success",
    message: error
      ? `Failed to sync listings${listingId ? " (single)" : ""}: ${error}`
      : `Synced ${count} listing${count !== 1 ? "s" : ""}${listingId ? ` (single: ${listingId})` : ""}`,
    start_time: now,
    end_time: now,
    items_count: count
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const urlObj = new URL(req.url);
    // `listing_id` as query param or body
    const listingId = urlObj.searchParams.get("listing_id");
    let bodyParams: any = {};
    try {
      bodyParams = await req.json();
    } catch { /* ignore if not present */ }
    const useListingId = bodyParams?.listing_id || listingId;

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.4");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Auth with Guesty
    const token = await getGuestyAccessToken();

    // 2. Fetch listings from Guesty
    let listingsRaw: any[] = [];
    try {
      listingsRaw = await fetchGuestyListings(token, useListingId);
    } catch (err) {
      await logSync(supabase, { count: 0, listingId: useListingId, error: err.message });
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Only keep active listings (unless single sync, then force keep)
    const activeListings = useListingId
      ? listingsRaw.filter(l => l._id) // accept any
      : listingsRaw.filter(l => !l.status || (l.status || "").toLowerCase() === "active");

    // 3. Upsert all listings
    let upserts = [];
    for (const l of activeListings) {
      try {
        // Prepare for DB
        const mapped = mapListing(l);
        // Check existing for upsert
        const { data: existing } = await supabase
          .from("guesty_listings")
          .select("id")
          .eq("id", mapped.id)
          .maybeSingle();
        if (existing) {
          // update
          await supabase
            .from("guesty_listings")
            .update({ ...mapped })
            .eq("id", mapped.id);
        } else {
          // insert
          await supabase
            .from("guesty_listings")
            .insert({ ...mapped, first_synced_at: new Date().toISOString() });
        }
        upserts.push(mapped.id);
      } catch (err) {
        console.error("[guesty-listing-sync] Failed to upsert listing", l?._id, err);
      }
    }

    // 4. Archive obsolete (only on full sync)
    let archivedCount = 0;
    if (!useListingId) {
      archivedCount = await archiveObsoleteListings(supabase, upserts);
    }

    // 5. Log sync
    await logSync(supabase, { count: upserts.length, listingId: useListingId });

    return new Response(
      JSON.stringify({
        success: true,
        synced: upserts.length,
        archived: archivedCount,
        listing_id: useListingId || undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[guesty-listing-sync] Handler error", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
