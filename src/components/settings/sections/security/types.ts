
import { z } from "zod";

export const securitySchema = z.object({
  enableTwoFactor: z.boolean(),
  loginAttempts: z.number().min(1).max(10),
  lockoutDuration: z.number().min(5).max(60),
  passwordExpiration: z.number().min(0).max(365),
  enforceStrongPasswords: z.boolean(),
  sessionDuration: z.number().min(1).max(24),
  ipRestriction: z.boolean(),
  allowedIPs: z.string().optional(),
});

export type SecurityFormValues = z.infer<typeof securitySchema>;

export const defaultSecurityValues: SecurityFormValues = {
  enableTwoFactor: false,
  loginAttempts: 5,
  lockoutDuration: 15,
  passwordExpiration: 90,
  enforceStrongPasswords: true,
  sessionDuration: 8,
  ipRestriction: false,
  allowedIPs: "",
};
