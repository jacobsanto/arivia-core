
import { toast } from "sonner";
import { generateHousekeepingTasksFromBooking, BookingObject, TaskGenerationResult } from "@/utils/booking/housekeepingTaskGenerator";

export const housekeepingService = {
  /**
   * Generates housekeeping tasks for a new booking
   * @param booking The booking object
   * @returns Result of task generation
   */
  async generateTasksFromBooking(booking: BookingObject): Promise<TaskGenerationResult> {
    try {
      const result = await generateHousekeepingTasksFromBooking(booking);
      
      // Show success message based on results
      if (result.tasksCreated.length > 0) {
        toast.success(`Created ${result.tasksCreated.length} housekeeping tasks`, {
          description: `${result.tasksSkipped.length} tasks were skipped as duplicates`
        });
      } else if (result.tasksSkipped.length > 0) {
        toast.info(`No new tasks needed`, {
          description: `${result.tasksSkipped.length} tasks were already scheduled`
        });
      } else {
        toast.info(`No tasks generated for this booking`);
      }
      
      // If manual schedule is required, show a separate notification
      if (result.manual_schedule_required) {
        toast.warning(`This booking requires manual scheduling`, {
          description: `Extended stay detected (>7 nights). Please review and adjust the cleaning schedule.`
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("Housekeeping service error:", error);
      toast.error("Failed to generate housekeeping tasks", {
        description: error.message
      });
      
      return {
        tasksCreated: [],
        tasksSkipped: [],
        manual_schedule_required: false
      };
    }
  }
};
