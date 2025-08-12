import { z } from "zod";

export const notificationSettingsSchema = z.object({
  enableInApp: z.boolean(),
  enablePush: z.boolean(),
  dailyDigest: z.boolean(),
  digestTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter time as HH:MM"),
  taskDueReminders: z.boolean(),
  inventoryLowStock: z.boolean(),
  systemAlerts: z.boolean(),
});

export type NotificationSettingsFormValues = z.infer<
  typeof notificationSettingsSchema
>;

export const defaultNotificationValues: NotificationSettingsFormValues = {
  enableInApp: true,
  enablePush: false,
  dailyDigest: false,
  digestTime: "09:00",
  taskDueReminders: true,
  inventoryLowStock: true,
  systemAlerts: true,
};
