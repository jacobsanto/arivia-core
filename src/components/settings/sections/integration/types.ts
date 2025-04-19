
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
  // Validate Guesty credentials if enabled
  if (data.guestyApiEnabled && (!data.guestyApiKey || !data.guestyApiSecret)) {
    return false;
  }
  // Validate Booking.com credentials if enabled
  if (data.bookingComEnabled && !data.bookingComApiKey) {
    return false;
  }
  // Validate Airbnb credentials if enabled
  if (data.airbnbEnabled && !data.airbnbApiKey) {
    return false;
  }
  // Validate Stripe credentials if enabled
  if (data.stripeEnabled && (!data.stripeApiKey || !data.stripeWebhookSecret)) {
    return false;
  }
  return true;
}, {
  message: "API credentials are required when an integration is enabled",
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
