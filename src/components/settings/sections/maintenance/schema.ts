
import { z } from "zod";

export const maintenanceSchema = z.object({
  taskReminderHours: z.number().min(1).max(72),
  defaultTaskPriority: z.string(),
  autoAssignTasks: z.boolean(),
  enableRecurringTasks: z.boolean(),
  maintenanceEmail: z.string().email("Must be a valid email address").optional().or(z.literal('')),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

export const defaultMaintenanceValues: MaintenanceFormValues = {
  taskReminderHours: 24,
  defaultTaskPriority: "normal",
  autoAssignTasks: false,
  enableRecurringTasks: false,
  maintenanceEmail: "",
};
