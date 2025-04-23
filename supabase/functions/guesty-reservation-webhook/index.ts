
/**
 * Supabase Edge Function: guesty-reservation-webhook
 * Handles Guesty webhook events for reservations (bookings) in real-time
 *
 * This webhook handles:
 * 1. Validating incoming webhook requests via secret token
 * 2. Processing reservation data from Guesty
 * 3. Storing reservation data in the database
 * 4. Tracking sync status
 * 
 * Environment variables (validated via Deno.env.get):
 *  - GUESTY_WEBHOOK_SECRET
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Configuration
const TIMEOUT_MS = 900; // Timeout for DB operations (ms)

// Response helpers with CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Standard responses
function createResponse(body: any, status = 200) {
  return new Response(
    typeof body === "string" ? body : JSON.stringify(body),
    { 
      status, 
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      } 
    }
  );
}

function unauthorized() {
  return createResponse({ error: "Unauthorized" }, 401);
}
function methodNotAllowed() {
  return createResponse({ error: "Method Not Allowed" }, 405);
}
function badRequest(message = "Bad Request") {
  return createResponse({ error: message }, 400);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return methodNotAllowed();
  }

  // Authorization check — GUESTY_WEBHOOK_SECRET via Deno.env
  try {
    const envSecret = Deno.env.get("GUESTY_WEBHOOK_SECRET");
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!envSecret || token !== envSecret) {
      console.warn("Unauthorized Guesty webhook access attempted");
      return unauthorized();
    }
  } catch (authError) {
    console.error("Authentication error:", authError);
    return unauthorized();
  }

  // Process payload...
  try {
    // Parse the request payload
    const payload = await req.json();

    // Extract booking data (handling different payload formats)
    const booking = payload.booking || payload.reservation || payload || {};

    // Process booking data
    const bookingData = await processBookingData(booking);
    if (!bookingData.isValid) {
      return badRequest(bookingData.errorMessage);
    }

    // Initialize Supabase client with env vars
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey, { 
      global: { 
        headers: { 
          "X-Client-Info": "guesty-reservation-webhook" 
        } 
      } 
    });

    // Upsert booking data with timeout protection
    const upsertResult = await Promise.race([
      upsertBooking(supabase, bookingData),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Database operation timed out after ${TIMEOUT_MS}ms`)), TIMEOUT_MS)
      )
    ]);

    // Log the result
    await logWebhookEvent(supabase, {
      success: !upsertResult.error,
      message: upsertResult.message,
      listingId: bookingData.listingId,
    });

    // Return appropriate response
    if (upsertResult.error) {
      console.error("Booking upsert error:", upsertResult.error);
      return createResponse({ 
        success: false, 
        error: upsertResult.error 
      }, 500);
    }

    return createResponse({
      success: true,
      message: upsertResult.message,
      bookingId: bookingData.id
    });

  } catch (err) {
    console.error("Webhook processing error:", err);
    // Try to log the error if possible using env var config
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await logWebhookEvent(supabase, {
          success: false,
          message: `Error processing webhook: ${err.message || "Unknown error"}`,
        });
      }
    } catch (logErr) {
      console.error("Failed to log webhook error:", logErr);
    }

    return badRequest("Error processing webhook");
  }
});

/**
 * Extract and validate booking data from webhook payload
 */
async function processBookingData(booking: any) {
  try {
    // Extract core booking fields with fallbacks for different API versions
    const id = booking.id || booking._id || booking.reservationId;
    const listingId = booking.listingId ||
      (booking.listing && (booking.listing._id || booking.listing.id));
    
    // Extract guest info with fallbacks
    const guest = booking.guest || {};
    const guestName = booking.guest_name ||
      guest.fullName ||
      guest.name ||
      (typeof guest === "string" ? guest : "Unknown Guest");
    const guestEmail = guest.email || "";
    const guestPhone = guest.phone || "";
    
    // Extract dates with fallbacks
    const startDate = booking.startDate || booking.checkIn;
    const endDate = booking.endDate || booking.checkOut;
    
    // Status handling with normalization
    let status = (booking.status || "").toLowerCase();
    if (status === "canceled" || status === "cancelled") {
      status = "cancelled";
    } else if (!status) {
      status = "confirmed";
    }
    
    // Validate required fields
    if (!id || !listingId || !startDate || !endDate) {
      return {
        isValid: false,
        errorMessage: `Missing required booking fields: ${!id ? 'id,' : ''} ${!listingId ? 'listingId,' : ''} ${!startDate ? 'startDate,' : ''} ${!endDate ? 'endDate' : ''}`.trim()
      };
    }
    
    // Return processed and validated data
    return {
      isValid: true,
      id: id.toString(),
      listingId: listingId.toString(),
      guestName,
      guestEmail,
      guestPhone,
      checkIn: startDate,
      checkOut: endDate,
      status,
      rawData: booking
    };
  } catch (err) {
    console.error("Error processing booking data:", err);
    return {
      isValid: false,
      errorMessage: `Failed to process booking data: ${err.message || "Unknown error"}`
    };
  }
}

/**
 * Upsert booking data into the database
 */
async function upsertBooking(supabase: any, bookingData: any) {
  try {
    const { id, listingId, guestName, checkIn, checkOut, status, rawData } = bookingData;
    
    const { data, error } = await supabase
      .from("guesty_bookings")
      .upsert([{
        id,
        listing_id: listingId,
        guest_name: guestName, 
        check_in: checkIn,
        check_out: checkOut,
        status,
        raw_data: rawData,
        last_synced: new Date().toISOString()
      }], 
      { onConflict: "id" }
    );
    
    if (error) {
      return { 
        error: error.message,
        message: `Error upserting booking for listing ${listingId}: ${error.message}`
      };
    }
    
    // Identify if this was an insert or update
    const operation = error ? "failed" : "updated";
    return {
      error: null,
      message: `Booking ${operation} for listing ${listingId}`
    };
  } catch (err) {
    return {
      error: err.message || "Unknown error during database operation",
      message: `Exception during booking upsert: ${err.message || "Unknown error"}`
    };
  }
}

/**
 * Log webhook event to sync_logs table
 */
async function logWebhookEvent(supabase: any, data: { success: boolean, message: string, listingId?: string }) {
  try {
    const now = new Date().toISOString();
    await supabase
      .from("sync_logs")
      .insert({
        service: "guesty",
        sync_type: "webhook",
        status: data.success ? "success" : "error",
        start_time: now,
        end_time: now,
        message: data.message || (data.success ? "Webhook processed successfully" : "Webhook processing failed"),
        items_count: 1,
        // Include listing ID if available
        ...(data.listingId ? { 
          bookings_updated: data.success ? 1 : 0
        } : {})
      });
  } catch (err) {
    // Non-blocking error handling for logging
    console.warn("Failed to log webhook event:", err);
  }
}
