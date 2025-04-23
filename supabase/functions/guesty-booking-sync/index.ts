
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchBookingsForListing(token: string, listingId: string) {
  const allBookings: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(`https://open-api.guesty.com/v1/bookings?listingId=${listingId}&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Failed to fetch bookings for listing ${listingId}`);
    const data = await res.json();
    allBookings.push(...data.results);
    hasMore = data.results.length > 0 && data.results.length === 20;
    page++;
  }

  return allBookings;
}

serve(async () => {
  const start = Date.now();
  const CLIENT_ID = Deno.env.get("GUESTY_CLIENT_ID");
  const CLIENT_SECRET = Deno.env.get("GUESTY_CLIENT_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!CLIENT_ID || !CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({
      success: false,
      message: "Missing environment variables"
    }), { status: 500 });
  }

  const tokenRes = await fetch("https://open-api.guesty.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    return new Response(JSON.stringify({ success: false, message: errorText }), { status: 401 });
  }

  const { access_token } = await tokenRes.json();

  const listingsRes = await fetch(`${SUPABASE_URL}/rest/v1/guesty_listings?id=not.is.null`, {
    headers: { Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const listings = await listingsRes.json();
  const totalListings = listings.length;

  let bookingsSynced = 0;
  let failedListings: string[] = [];

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    try {
      const bookings = await fetchBookingsForListing(access_token, listing.id);
      bookingsSynced += bookings.length;

      const formatted = bookings.map((b: any) => ({
        id: b.id,
        listing_id: b.listingId,
        check_in: b.startDate,
        check_out: b.endDate,
        guest_name: b.guest?.fullName || null,
        guest_email: b.guest?.email || null,
        amount_paid: b.price?.totalPrice || 0,
        currency: b.price?.currency || "EUR",
        status: b.status,
        total_guests: (b.guests?.adults || 0) + (b.guests?.children || 0) + (b.guests?.infants || 0),
        last_synced: new Date().toISOString(),
      }));

      await fetch(`${SUPABASE_URL}/rest/v1/guesty_bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(formatted),
      });

    } catch (err) {
      console.warn(`Failed to sync bookings for listing ${listing.id}`, err);
      failedListings.push(listing.id);
    }

    await delay(300);

    // Stop if we're over safe execution time
    if (Date.now() - start > 50000) break;
  }

  // Log the result
  await fetch(`${SUPABASE_URL}/rest/v1/sync_logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      integration: "guesty",
      type: "bookings",
      status: failedListings.length ? "partial" : "success",
      message: `Synced ${bookingsSynced} bookings across ${totalListings} listings`,
      synced_at: new Date().toISOString(),
    }),
  });

  return new Response(JSON.stringify({
    success: true,
    bookings_synced: bookingsSynced,
    listings_attempted: totalListings,
    failed_listings: failedListings,
    time_taken: `${Math.round((Date.now() - start) / 1000)}s`
  }), {
    headers: { "Content-Type": "application/json" }
  });
});
