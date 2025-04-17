
import { z } from "zod";

export const integrationSettingsSchema = z.object({
  guestyApiEnabled: z.boolean(),
  guestyApiKey: z.string().optional(),
  guestyApiSecret: z.string().optional(),
  bookingComEnabled: z.boolean(),
  bookingComApiKey: z.string().optional(),
  airbnbEnabled: z.boolean(),
  airbnbApiKey: z.string().optional(),
  stripeEnabled: z.boolean(),
  stripeApiKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
});

export type IntegrationSettingsFormValues = z.infer<typeof integrationSettingsSchema>;

export const defaultIntegrationValues: IntegrationSettingsFormValues = {
  guestyApiEnabled: false,
  guestyApiKey: "",
  guestyApiSecret: "",
  bookingComEnabled: false,
  bookingComApiKey: "",
  airbnbEnabled: false,
  airbnbApiKey: "",
  stripeEnabled: false,
  stripeApiKey: "",
  stripeWebhookSecret: "",
};
