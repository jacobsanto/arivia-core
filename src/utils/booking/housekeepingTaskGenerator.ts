
import { supabase } from "@/integrations/supabase/client";
import { addDays, format, differenceInDays } from "date-fns";
import { toast } from "sonner";

/**
 * Interface for booking objects
 */
export interface BookingObject {
  id: string;
  property_id: string;
  listing_id?: string; // Some bookings may have listing_id instead of property_id
  check_in_date: string | Date;
  check_out_date: string | Date;
  guest_name: string;
  [key: string]: any; // Allow for other properties
}

/**
 * Interface for the task generation result
 */
export interface TaskGenerationResult {
  tasksCreated: {
    id: string;
    task_type: string;
    due_date: string;
  }[];
  tasksSkipped: {
    task_type: string;
    due_date: string;
    reason: string;
  }[];
  manual_schedule_required: boolean;
}

/**
 * Generates housekeeping tasks for a given booking based on stay duration
 * @param booking The booking object containing check-in/out dates and property info
 * @returns Object containing created tasks, skipped tasks, and if manual scheduling is required
 */
export async function generateHousekeepingTasksFromBooking(booking: BookingObject): Promise<TaskGenerationResult> {
  try {
    // Initialize result
    const result: TaskGenerationResult = {
      tasksCreated: [],
      tasksSkipped: [],
      manual_schedule_required: false
    };

    // Normalize dates to Date objects
    const checkIn = typeof booking.check_in_date === 'string' 
      ? new Date(booking.check_in_date) 
      : booking.check_in_date;
    
    const checkOut = typeof booking.check_out_date === 'string' 
      ? new Date(booking.check_out_date) 
      : booking.check_out_date;

    // Calculate stay duration in nights
    const stayDuration = differenceInDays(checkOut, checkIn);
    
    // Use listing_id if available, otherwise use property_id
    const listingId = booking.listing_id || booking.property_id;
    
    // Check for same-day check-in after this booking's check-out
    const { data: sameDayBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', booking.property_id)
      .eq('check_in_date', format(checkOut, 'yyyy-MM-dd'))
      .neq('id', booking.id);
    
    const hasSameDayCheckIn = sameDayBookings && sameDayBookings.length > 0;
    
    // Generate the tasks based on stay duration
    const tasks = [];
    
    // 1. Pre-arrival Standard Cleaning (for all stays)
    const preArrivalDate = format(addDays(checkIn, -1), 'yyyy-MM-dd');
    tasks.push({
      booking_id: booking.id,
      listing_id: listingId,
      task_type: "Standard Cleaning",
      due_date: preArrivalDate,
      status: "pending",
      description: `Pre-arrival cleaning for ${booking.guest_name}`
    });
    
    // 2. Determine mid-stay cleanings based on duration
    if (stayDuration <= 3) {
      // No mid-stay cleaning needed
    } 
    else if (stayDuration <= 5) {
      // One mid-stay cleaning
      const midpointDate = format(addDays(checkIn, Math.floor(stayDuration / 2)), 'yyyy-MM-dd');
      
      // Add Full Cleaning
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: midpointDate,
        status: "pending",
        description: `Mid-stay full cleaning for ${booking.guest_name}`
      });
      
      // Add Linen & Towel Change on same day
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: midpointDate,
        status: "pending",
        description: `Mid-stay linen & towel change for ${booking.guest_name}`
      });
    } 
    else if (stayDuration <= 7) {
      // Two mid-stay cleanings at 1/3 and 2/3 of stay
      const firstThirdDate = format(addDays(checkIn, Math.floor(stayDuration / 3)), 'yyyy-MM-dd');
      const secondThirdDate = format(addDays(checkIn, Math.floor((stayDuration / 3) * 2)), 'yyyy-MM-dd');
      
      // Add Full Cleanings
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: firstThirdDate,
        status: "pending",
        description: `First mid-stay cleaning for ${booking.guest_name}`
      });
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: secondThirdDate,
        status: "pending",
        description: `Second mid-stay cleaning for ${booking.guest_name}`
      });
      
      // Add Linen & Towel Changes on same days
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: firstThirdDate,
        status: "pending",
        description: `First linen & towel change for ${booking.guest_name}`
      });
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: secondThirdDate,
        status: "pending",
        description: `Second linen & towel change for ${booking.guest_name}`
      });
    } 
    else {
      // Stays longer than 7 nights - custom schedule
      const customCleaningDate = format(addDays(checkIn, 3), 'yyyy-MM-dd');
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Custom Cleaning Schedule",
        due_date: customCleaningDate,
        status: "pending",
        description: `Custom cleaning schedule for extended stay (${stayDuration} nights) - ${booking.guest_name}`
      });
      
      // Flag for manual schedule
      result.manual_schedule_required = true;
    }
    
    // 3. Post-checkout cleaning (if no same-day check-in)
    if (!hasSameDayCheckIn) {
      const checkoutDate = format(checkOut, 'yyyy-MM-dd');
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Standard Cleaning",
        due_date: checkoutDate,
        status: "pending",
        description: `Post-checkout cleaning after ${booking.guest_name}`
      });
    } else {
      // Log the skipped task
      result.tasksSkipped.push({
        task_type: "Standard Cleaning",
        due_date: format(checkOut, 'yyyy-MM-dd'),
        reason: "Same-day check-in detected"
      });
    }
    
    // Insert tasks into database, avoiding duplicates
    for (const task of tasks) {
      // Check if this task already exists
      const { data: existingTasks } = await supabase
        .from('housekeeping_tasks')
        .select('id')
        .eq('booking_id', task.booking_id)
        .eq('task_type', task.task_type)
        .eq('due_date', task.due_date);
      
      if (existingTasks && existingTasks.length > 0) {
        // Task already exists, skip it
        result.tasksSkipped.push({
          task_type: task.task_type,
          due_date: task.due_date,
          reason: "Duplicate task"
        });
      } else {
        // Insert the new task
        const { data: insertedTask, error } = await supabase
          .from('housekeeping_tasks')
          .insert(task)
          .select('id, task_type, due_date')
          .single();
        
        if (error) {
          console.error(`Error creating task: ${error.message}`, task);
          result.tasksSkipped.push({
            task_type: task.task_type,
            due_date: task.due_date,
            reason: `Database error: ${error.message}`
          });
        } else if (insertedTask) {
          result.tasksCreated.push({
            id: insertedTask.id,
            task_type: insertedTask.task_type,
            due_date: insertedTask.due_date
          });
        }
      }
    }
    
    return result;
    
  } catch (error: any) {
    console.error("Error generating housekeeping tasks:", error);
    toast.error("Failed to generate housekeeping tasks");
    
    return {
      tasksCreated: [],
      tasksSkipped: [],
      manual_schedule_required: false
    };
  }
}
