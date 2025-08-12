import { z } from "zod";

export const generalSettingsSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  locale: z.string().min(2),
  timezone: z.string().min(1),
  weekStart: z.enum(["Sunday", "Monday"]),
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

export const defaultGeneralValues: GeneralSettingsFormValues = {
  organizationName: "Arivia Villas",
  locale: "en-US",
  timezone: "Europe/Athens",
  weekStart: "Monday",
};
