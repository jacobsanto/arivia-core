
import { z } from "zod";

export const emailSettingsSchema = z.object({
  emailProvider: z.string(),
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.number().min(1).max(65535),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  smtpEncryption: z.string(),
  fromEmail: z.string().email("Must be a valid email address"),
  fromName: z.string().min(1, "From name is required"),
  enableEmailNotifications: z.boolean(),
});

export type EmailSettingsFormValues = z.infer<typeof emailSettingsSchema>;

export const defaultEmailValues: EmailSettingsFormValues = {
  emailProvider: "smtp",
  smtpHost: "smtp.example.com",
  smtpPort: 587,
  smtpUsername: "username",
  smtpPassword: "password",
  smtpEncryption: "tls",
  fromEmail: "no-reply@arivia-villas.com",
  fromName: "Arivia Villas",
  enableEmailNotifications: true,
};
