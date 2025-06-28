
import { supabase } from "@/integrations/supabase/client";
import { addDays, format, differenceInDays } from "date-fns";
import { toast } from "sonner";

/**
 * Interface for booking objects
 */
export interface BookingObject {
  id: string;
  property_id: string;
  listing_id?: string;
  check_in_date: string | Date;
  check_out_date: string | Date;
  guest_name: string;
  [key: string]: any;
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
 * Generates housekeeping tasks based on the new cleaning service breakdown by length of stay
 */
export async function generateHousekeepingTasksFromBooking(booking: BookingObject): Promise<TaskGenerationResult> {
  try {
    const result: TaskGenerationResult = {
      tasksCreated: [],
      tasksSkipped: [],
      manual_schedule_required: false
    };

    const checkIn = typeof booking.check_in_date === 'string' 
      ? new Date(booking.check_in_date) 
      : booking.check_in_date;
    
    const checkOut = typeof booking.check_out_date === 'string' 
      ? new Date(booking.check_out_date) 
      : booking.check_out_date;

    const stayDuration = differenceInDays(checkOut, checkIn);
    const listingId = booking.listing_id || booking.property_id;
    
    // Check for same-day check-in after this booking's check-out
    const { data: sameDayBookings } = await supabase
      .from('guesty_bookings')
      .select('*')
      .eq('listing_id', listingId)
      .eq('check_in', format(checkOut, 'yyyy-MM-dd'))
      .neq('id', booking.id);
    
    const hasSameDayCheckIn = sameDayBookings && sameDayBookings.length > 0;
    
    const tasks = [];
    
    // Always include pre-arrival Standard Cleaning (check-in preparation)
    const preArrivalDate = format(addDays(checkIn, -1), 'yyyy-MM-dd');
    tasks.push({
      booking_id: booking.id,
      listing_id: listingId,
      task_type: "Standard Cleaning",
      due_date: preArrivalDate,
      status: "pending",
      description: `Pre-arrival preparation for ${booking.guest_name} (${stayDuration} nights)`
    });
    
    // Apply cleaning breakdown based on length of stay
    if (stayDuration <= 3) {
      // Stays of Up to 3 Nights: No additional cleaning during stay
      // Only pre-arrival and post-checkout standard cleaning
    } 
    else if (stayDuration <= 5) {
      // Stays of Up to 5 Nights: Two cleaning sessions during stay
      // One full cleaning service + One linen and towel change
      const midStayDate = format(addDays(checkIn, Math.floor(stayDuration / 2)), 'yyyy-MM-dd');
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: midStayDate,
        status: "pending",
        description: `Mid-stay full cleaning for ${booking.guest_name} (coordinate with guest)`
      });
      
      // Schedule linen change 1-2 days after full cleaning
      const linenChangeDate = format(addDays(checkIn, Math.floor(stayDuration / 2) + 1), 'yyyy-MM-dd');
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: linenChangeDate,
        status: "pending",
        description: `Linen and towel change for ${booking.guest_name} (coordinate with guest)`
      });
    } 
    else if (stayDuration <= 7) {
      // Stays of Up to 7 Nights: Three cleaning sessions during stay
      // Two full cleaning services + Two linen and towel changes
      const firstCleanDate = format(addDays(checkIn, Math.floor(stayDuration / 3)), 'yyyy-MM-dd');
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: firstCleanDate,
        status: "pending",
        description: `First mid-stay cleaning for ${booking.guest_name} (coordinate with guest)`
      });
      
      const firstLinenDate = format(addDays(checkIn, Math.floor(stayDuration / 3) + 1), 'yyyy-MM-dd');
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: firstLinenDate,
        status: "pending",
        description: `First linen change for ${booking.guest_name} (coordinate with guest)`
      });
      
      const secondCleanDate = format(addDays(checkIn, Math.floor((stayDuration / 3) * 2)), 'yyyy-MM-dd');
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: secondCleanDate,
        status: "pending",
        description: `Second mid-stay cleaning for ${booking.guest_name} (coordinate with guest)`
      });
      
      const secondLinenDate = format(addDays(checkIn, Math.floor((stayDuration / 3) * 2) + 1), 'yyyy-MM-dd');
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: secondLinenDate,
        status: "pending",
        description: `Second linen change for ${booking.guest_name} (coordinate with guest)`
      });
    } 
    else {
      // Stays of More Than 7 Nights: Custom cleaning schedule
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Custom Cleaning Schedule",
        due_date: format(addDays(checkIn, 1), 'yyyy-MM-dd'), // Schedule planning for day after check-in
        status: "pending",
        description: `Extended stay (${stayDuration} nights) - Arrange custom cleaning schedule with ${booking.guest_name} based on preferences`
      });
      
      result.manual_schedule_required = true;
    }
    
    // Post-checkout Standard Cleaning (if no same-day check-in)
    if (!hasSameDayCheckIn) {
      const checkoutDate = format(checkOut, 'yyyy-MM-dd');
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Standard Cleaning",
        due_date: checkoutDate,
        status: "pending",
        description: `Post-checkout cleanup after ${booking.guest_name}`
      });
    } else {
      result.tasksSkipped.push({
        task_type: "Standard Cleaning",
        due_date: format(checkOut, 'yyyy-MM-dd'),
        reason: "Same-day check-in detected"
      });
    }
    
    // Insert tasks into database, avoiding duplicates
    for (const task of tasks) {
      const { data: existingTasks } = await supabase
        .from('housekeeping_tasks')
        .select('id')
        .eq('booking_id', task.booking_id)
        .eq('task_type', task.task_type)
        .eq('due_date', task.due_date);
      
      if (existingTasks && existingTasks.length > 0) {
        result.tasksSkipped.push({
          task_type: task.task_type,
          due_date: task.due_date,
          reason: "Duplicate task"
        });
      } else {
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
