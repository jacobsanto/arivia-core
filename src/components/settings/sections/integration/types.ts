
import { z } from "zod";

export const integrationSettingsSchema = z.object({
  guestyApiEnabled: z.boolean(),
  guestyApiKey: z.string().optional().transform(val => val || ""),
  guestyApiSecret: z.string().optional().transform(val => val || ""),
  bookingComEnabled: z.boolean(),
  bookingComApiKey: z.string().optional().transform(val => val || ""),
  airbnbEnabled: z.boolean(),
  airbnbApiKey: z.string().optional().transform(val => val || ""),
  stripeEnabled: z.boolean(),
  stripeApiKey: z.string().optional().transform(val => val || ""),
  stripeWebhookSecret: z.string().optional().transform(val => val || ""),
}).refine((data) => {
  if (data.guestyApiEnabled) {
    return !!data.guestyApiKey && !!data.guestyApiSecret;
  }
  return true;
}, {
  message: "API Key and Secret are required when Guesty integration is enabled",
  path: ["guestyApiKey"]
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
