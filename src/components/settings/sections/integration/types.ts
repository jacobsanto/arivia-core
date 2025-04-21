
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
}).superRefine((data, ctx) => {
  // Validate Guesty credentials if enabled
  if (data.guestyApiEnabled) {
    if (!data.guestyApiKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guesty API Key is required when enabled",
        path: ["guestyApiKey"]
      });
    }
    if (!data.guestyApiSecret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guesty API Secret is required when enabled",
        path: ["guestyApiSecret"]
      });
    }
  }
  
  // Validate Booking.com credentials if enabled
  if (data.bookingComEnabled && !data.bookingComApiKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Booking.com API Key is required when enabled",
      path: ["bookingComApiKey"]
    });
  }
  
  // Validate Airbnb credentials if enabled
  if (data.airbnbEnabled && !data.airbnbApiKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Airbnb API Key is required when enabled",
      path: ["airbnbApiKey"]
    });
  }
  
  // Validate Stripe credentials if enabled
  if (data.stripeEnabled) {
    if (!data.stripeApiKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stripe API Key is required when enabled",
        path: ["stripeApiKey"]
      });
    }
    if (!data.stripeWebhookSecret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stripe Webhook Secret is required when enabled",
        path: ["stripeWebhookSecret"]
      });
    }
  }
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
