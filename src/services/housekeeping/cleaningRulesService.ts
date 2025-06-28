import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CleaningRulesApplicationResult {
  success: boolean;
  processed: number;
  total?: number;
  tasksGenerated: number;
  duration: number;
  errors?: string[];
  error?: string;
}

export const cleaningRulesService = {
  /**
   * Apply cleaning rules to all active bookings
   */
  async applyToAllBookings(options?: {
    dateFrom?: string;
    dateTo?: string;
    batchSize?: number;
  }): Promise<CleaningRulesApplicationResult> {
    try {
      const response = await supabase.functions.invoke('apply-cleaning-rules', {
        body: {
          dateFrom: options?.dateFrom,
          dateTo: options?.dateTo,
          batchSize: options?.batchSize || 50
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data as CleaningRulesApplicationResult;
    } catch (error) {
      console.error('Error applying cleaning rules to all bookings:', error);
      throw error;
    }
  },

  /**
   * Apply cleaning rules to a specific listing's bookings
   */
  async applyToListing(listingId: string, options?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CleaningRulesApplicationResult> {
    try {
      const response = await supabase.functions.invoke('apply-cleaning-rules', {
        body: {
          listingId,
          dateFrom: options?.dateFrom,
          dateTo: options?.dateTo,
          batchSize: 20 // Smaller batch for single listing
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data as CleaningRulesApplicationResult;
    } catch (error) {
      console.error(`Error applying cleaning rules to listing ${listingId}:`, error);
      throw error;
    }
  },

  /**
   * Generate cleaning tasks for a single booking
   */
  async generateTasksForBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
    try {
      // First fetch the booking data
      const { data: booking, error: fetchError } = await supabase
        .from('guesty_bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (fetchError || !booking) {
        throw new Error('Booking not found');
      }

      // Call the database function to generate tasks
      const { error } = await supabase.rpc('generate_housekeeping_tasks_for_booking', {
        booking_record: booking
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Cleaning tasks generated successfully'
      };
    } catch (error) {
      console.error(`Error generating tasks for booking ${bookingId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Check which bookings are missing cleaning tasks
   */
  async getMissingTasksReport(): Promise<{
    totalBookings: number;
    bookingsWithTasks: number;
    bookingsMissingTasks: number;
    missingTasksBookings: Array<{
      id: string;
      listing_id: string;
      guest_name: string;
      check_in: string;
      check_out: string;
      stay_duration: number;
    }>;
  }> {
    try {
      // Get all active future bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('guesty_bookings')
        .select('id, listing_id, guest_name, check_in, check_out')
        .eq('status', 'confirmed')
        .gte('check_out', new Date().toISOString().split('T')[0]);

      if (bookingsError) {
        throw new Error(bookingsError.message);
      }

      const totalBookings = bookings?.length || 0;

      if (totalBookings === 0) {
        return {
          totalBookings: 0,
          bookingsWithTasks: 0,
          bookingsMissingTasks: 0,
          missingTasksBookings: []
        };
      }

      // Get bookings that have housekeeping tasks
      const bookingIds = bookings!.map(b => b.id);
      const { data: existingTasks } = await supabase
        .from('housekeeping_tasks')
        .select('booking_id')
        .in('booking_id', bookingIds);

      const bookingsWithTasksSet = new Set(existingTasks?.map(t => t.booking_id) || []);
      const bookingsWithTasks = bookingsWithTasksSet.size;
      
      const missingTasksBookings = bookings!
        .filter(booking => !bookingsWithTasksSet.has(booking.id))
        .map(booking => ({
          ...booking,
          stay_duration: Math.ceil(
            (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 
            (1000 * 60 * 60 * 24)
          )
        }));

      return {
        totalBookings,
        bookingsWithTasks,
        bookingsMissingTasks: missingTasksBookings.length,
        missingTasksBookings
      };
    } catch (error) {
      console.error('Error generating missing tasks report:', error);
      throw error;
    }
  }
};
