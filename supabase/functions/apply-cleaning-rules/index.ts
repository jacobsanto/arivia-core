import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const startTime = Date.now();

  try {
    const { listingId, dateFrom, dateTo, batchSize = 50 } = await req.json();

    console.log(`Starting cleaning rules application for listings. Batch size: ${batchSize}`);

    // Build query for active bookings without housekeeping tasks
    let query = supabase
      .from('guesty_bookings')
      .select(`
        id,
        listing_id,
        check_in,
        check_out,
        status,
        guest_name,
        raw_data
      `)
      .eq('status', 'confirmed')
      .gte('check_out', new Date().toISOString().split('T')[0]) // Only future/current bookings
      .limit(batchSize);

    // Add optional filters
    if (listingId) {
      query = query.eq('listing_id', listingId);
    }
    if (dateFrom) {
      query = query.gte('check_in', dateFrom);
    }
    if (dateTo) {
      query = query.lte('check_out', dateTo);
    }

    const { data: bookings, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch bookings: ${fetchError.message}`);
    }

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No eligible bookings found',
          processed: 0,
          tasksGenerated: 0,
          duration: Date.now() - startTime
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Found ${bookings.length} bookings to process`);

    // Filter out bookings that already have housekeeping tasks
    const bookingIds = bookings.map(b => b.id);
    const { data: existingTasks } = await supabase
      .from('housekeeping_tasks')
      .select('booking_id')
      .in('booking_id', bookingIds);

    const bookingsWithTasks = new Set(existingTasks?.map(t => t.booking_id) || []);
    const bookingsToProcess = bookings.filter(b => !bookingsWithTasks.has(b.id));

    console.log(`${bookingsToProcess.length} bookings need cleaning tasks generated`);

    let processed = 0;
    let tasksGenerated = 0;
    const errors: string[] = [];

    // Process each booking by calling the database function
    for (const booking of bookingsToProcess) {
      try {
        const { error } = await supabase.rpc('generate_housekeeping_tasks_for_booking', {
          booking_record: booking
        });

        if (error) {
          console.error(`Error processing booking ${booking.id}:`, error);
          errors.push(`Booking ${booking.id}: ${error.message}`);
        } else {
          processed++;
          
          // Count tasks generated for this booking
          const { count } = await supabase
            .from('housekeeping_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('booking_id', booking.id);
          
          tasksGenerated += count || 0;
        }
      } catch (err) {
        console.error(`Exception processing booking ${booking.id}:`, err);
        errors.push(`Booking ${booking.id}: ${err.message}`);
      }
    }

    // Log the batch processing result
    await supabase.from('sync_logs').insert({
      provider: 'housekeeping',
      sync_type: 'batch_cleaning_rules',
      status: errors.length > 0 ? 'partial_success' : 'success',
      start_time: new Date(startTime).toISOString(),
      end_time: new Date().toISOString(),
      sync_duration_ms: Date.now() - startTime,
      items_count: bookingsToProcess.length,
      message: `Processed ${processed}/${bookingsToProcess.length} bookings, generated ${tasksGenerated} tasks`,
      error_message: errors.length > 0 ? errors.join('; ') : null
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        total: bookingsToProcess.length,
        tasksGenerated,
        duration: Date.now() - startTime,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in apply-cleaning-rules function:', error);
    
    // Log the error
    try {
      await supabase.from('sync_logs').insert({
        provider: 'housekeeping',
        sync_type: 'batch_cleaning_rules',
        status: 'error',
        start_time: new Date(startTime).toISOString(),
        end_time: new Date().toISOString(),
        sync_duration_ms: Date.now() - startTime,
        error_message: error.message,
        message: 'Batch cleaning rules application failed'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
