import { z } from "zod";

export const appearanceSettingsSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  accentColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use a 6-digit hex color like #0EA5E9"),
  fontScale: z.number().min(0.85).max(1.25),
  compactMode: z.boolean(),
  radius: z.enum(["none", "sm", "md", "lg", "xl"]),
  reducedMotion: z.boolean(),
});

export type AppearanceSettingsFormValues = z.infer<typeof appearanceSettingsSchema>;

export const defaultAppearanceValues: AppearanceSettingsFormValues = {
  theme: "system",
  accentColor: "#0EA5E9", // brand-accent default
  fontScale: 1.0,
  compactMode: false,
  radius: "md",
  reducedMotion: false,
};
