
import { z } from "zod";

export const userManagementSchema = z.object({
  allowUserRegistration: z.boolean(),
  defaultUserRole: z.string(),
  passwordMinLength: z.number().min(8).max(32),
  passwordRequireNumbers: z.boolean(),
  passwordRequireSymbols: z.boolean(),
  sessionTimeout: z.number().min(10).max(1440),
});

export type UserManagementFormValues = z.infer<typeof userManagementSchema>;

export const defaultUserManagementValues: UserManagementFormValues = {
  allowUserRegistration: false,
  defaultUserRole: "property_manager",
  passwordMinLength: 12,
  passwordRequireNumbers: true,
  passwordRequireSymbols: true,
  sessionTimeout: 120,
};
