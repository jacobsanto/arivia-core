
/**
 * Supabase Edge Function: guesty-reservation-webhook
 * Handles Guesty webhook events for reservations (bookings) in real-time
 * Authorizes using GUESTY_WEBHOOK_SECRET (set as project secret)
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Utility: Response with CORS headers, status
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function unauthorized() {
  return new Response("Unauthorized", { status: 401, headers: corsHeaders });
}
function methodNotAllowed() {
  return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return methodNotAllowed();
  }

  const envSecret = Deno.env.get("GUESTY_WEBHOOK_SECRET");
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // Auth check
  if (!envSecret || token !== envSecret) {
    console.warn("Unauthorized Guesty webhook: invalid secret.");
    return unauthorized();
  }

  try {
    // Parse payload
    const payload = await req.json();
    // Accept Guesty v1 webhook or push notification
    const booking =
      payload.booking || payload.reservation || payload || {};

    // Extract details
    const id = booking.id || booking._id || booking.reservationId;
    const listingId =
      booking.listingId ||
      (booking.listing && (booking.listing._id || booking.listing.id));
    const guest =
      booking.guest || {};
    const guestName =
      booking.guest_name ||
      guest.fullName ||
      guest.name ||
      (typeof guest === "string" ? guest : undefined) ||
      "Unknown Guest";
    const guestEmail = guest.email || "";
    const guestPhone = guest.phone || "";
    const startDate = booking.startDate || booking.checkIn;
    const endDate = booking.endDate || booking.checkOut;
    const status =
      (booking.status || "").toLowerCase() === "cancelled" ||
      (booking.status || "").toLowerCase() === "canceled"
        ? "cancelled"
        : (booking.status || "").toLowerCase() || "confirmed";

    // Validate required
    if (!id || !listingId || !startDate || !endDate) {
      console.warn("Missing required booking fields", {
        id,
        listingId,
        startDate,
        endDate,
        body: booking,
      });
      return new Response("Missing required fields", { status: 400, headers: corsHeaders });
    }

    // Upsert into guesty_bookings
    // Minimal DB logic for speed, catch slow queries with a timeout
    const aborter = AbortSignal.timeout(900);

    // Use the service_role key for DB ops
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.4");
    const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { "X-Client-Info": "guesty-reservation-webhook" } } });

    // Insert or update booking
    const upsertRes = await supabase
      .from("guesty_bookings")
      .upsert(
        [{
          id: id.toString(),
          listing_id: listingId.toString(),
          guest_name: guestName,
          check_in: startDate,
          check_out: endDate,
          status: status,
          raw_data: booking,
          // Adjust or add more fields if required by schema
        }],
        { onConflict: "id" }
      ).abortSignal(aborter);

    let logMessage = "";
    if (upsertRes.error) {
      logMessage = `Booking upsert error for listing ${listingId}: ${upsertRes.error.message}`;
      console.error(logMessage, upsertRes.error);
    } else {
      logMessage = `Booking updated for listing ${listingId}`;
    }

    // Insert into sync_logs (nonblocking, best-effort)
    const synclogRes = await supabase
      .from("sync_logs")
      .insert({
        service: "guesty",
        sync_type: "webhook",
        status: upsertRes.error ? "error" : "success",
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        message: logMessage,
        items_count: 1,
      })
      .select()
      .single()
      .abortSignal(aborter);

    if (synclogRes.error) {
      // This does not block the main webhook flow
      console.warn("Error logging webhook to sync_logs", synclogRes.error);
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Webhook error", err);
    return new Response("Webhook error", { status: 400, headers: corsHeaders });
  }
});
