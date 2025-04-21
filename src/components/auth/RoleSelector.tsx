
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { SignUpFormValues } from "@/lib/validation/auth-schema";

interface RoleSelectorProps {
  form: UseFormReturn<SignUpFormValues>;
  superAdminExists: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ form, superAdminExists }) => {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || "select-role"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="select-role" disabled>Select a role</SelectItem>
              <SelectItem value="administrator">Administrator</SelectItem>
              <SelectItem value="property_manager">Property Manager</SelectItem>
              <SelectItem value="concierge">Concierge</SelectItem>
              <SelectItem value="housekeeping_staff">Housekeeping Staff</SelectItem>
              <SelectItem value="maintenance_staff">Maintenance Staff</SelectItem>
              <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
              {!superAdminExists && (
                <SelectItem value="superadmin">Super Admin</SelectItem>
              )}
            </SelectContent>
          </Select>
          {superAdminExists && field.value === "superadmin" && (
            <p className="text-sm text-destructive mt-1">
              Super Admin role is already taken
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RoleSelector;
