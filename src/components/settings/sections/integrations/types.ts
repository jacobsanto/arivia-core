import { z } from "zod";

export const integrationsSchema = z.object({
  enableGuesty: z.boolean(),
  guestySyncBookings: z.boolean(),
  syncIntervalMinutes: z.number().min(5).max(1440),
  enableWebhooks: z.boolean(),
  testMode: z.boolean(),
});

export type IntegrationsFormValues = z.infer<typeof integrationsSchema>;

export const defaultIntegrationsValues: IntegrationsFormValues = {
  enableGuesty: false,
  guestySyncBookings: true,
  syncIntervalMinutes: 15,
  enableWebhooks: false,
  testMode: true,
};
