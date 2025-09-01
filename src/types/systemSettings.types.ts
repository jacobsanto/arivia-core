import { z } from "zod";

// Enhanced General Settings Schema
export const enhancedGeneralSettingsSchema = z.object({
  applicationName: z.string().min(1, "Application name is required"),
  organizationName: z.string().min(1, "Organization name is required"),
  systemTimezone: z.string().min(1, "System timezone is required"),
  defaultCurrency: z.enum(["EUR", "USD", "GBP", "CAD", "AUD"]),
  locale: z.string().min(2),
  weekStart: z.enum(["Sunday", "Monday"]),
});

// Branding Settings Schema
export const brandingSettingsSchema = z.object({
  primaryBrandColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use a 6-digit hex color like #0EA5E9"),
  secondaryBrandColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use a 6-digit hex color like #0EA5E9"),
  companyLogoUrl: z.string().optional(),
});

// Enhanced Security Settings Schema
export const enhancedSecuritySettingsSchema = z.object({
  minimumPasswordLength: z.number().min(6).max(20),
  enableTwoFactor: z.boolean(),
  sessionTimeoutMinutes: z.number().min(15).max(1440), // 15 minutes to 24 hours
  loginAttempts: z.number().min(1).max(10),
  lockoutDuration: z.number().min(5).max(60),
  passwordExpiration: z.number().min(0).max(365),
  enforceStrongPasswords: z.boolean(),
  ipRestriction: z.boolean(),
  allowedIPs: z.string().optional(),
});

// Operational Defaults Schema
export const operationalSettingsSchema = z.object({
  defaultTaskPriority: z.enum(["low", "medium", "high", "urgent"]),
  standardTurnaroundTimeHours: z.number().min(1).max(48),
  archiveCompletedTasksDays: z.number().min(1).max(365),
  defaultTaskEstimatedDuration: z.number().min(15).max(480), // 15 minutes to 8 hours
  autoAssignTasks: z.boolean(),
  requireTaskPhotos: z.boolean(),
});

export type EnhancedGeneralSettingsFormValues = z.infer<typeof enhancedGeneralSettingsSchema>;
export type BrandingSettingsFormValues = z.infer<typeof brandingSettingsSchema>;
export type EnhancedSecuritySettingsFormValues = z.infer<typeof enhancedSecuritySettingsSchema>;
export type OperationalSettingsFormValues = z.infer<typeof operationalSettingsSchema>;

// Default values
export const defaultEnhancedGeneralValues: EnhancedGeneralSettingsFormValues = {
  applicationName: "Arivia Core",
  organizationName: "Arivia Villas",
  systemTimezone: "Europe/Athens",
  defaultCurrency: "EUR",
  locale: "en-US",
  weekStart: "Monday",
};

export const defaultBrandingValues: BrandingSettingsFormValues = {
  primaryBrandColor: "#0EA5E9",
  secondaryBrandColor: "#6366F1",
  companyLogoUrl: "",
};

export const defaultEnhancedSecurityValues: EnhancedSecuritySettingsFormValues = {
  minimumPasswordLength: 8,
  enableTwoFactor: false,
  sessionTimeoutMinutes: 480, // 8 hours
  loginAttempts: 5,
  lockoutDuration: 15,
  passwordExpiration: 90,
  enforceStrongPasswords: true,
  ipRestriction: false,
  allowedIPs: "",
};

export const defaultOperationalValues: OperationalSettingsFormValues = {
  defaultTaskPriority: "medium",
  standardTurnaroundTimeHours: 4,
  archiveCompletedTasksDays: 30,
  defaultTaskEstimatedDuration: 60,
  autoAssignTasks: false,
  requireTaskPhotos: true,
};