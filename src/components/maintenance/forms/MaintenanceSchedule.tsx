
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./types";
import { useUsers } from "@/hooks/useUsers";

interface MaintenanceScheduleProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

const MaintenanceSchedule = ({ form }: MaintenanceScheduleProps) => {
  const { getAssignableUsers, isLoading: usersLoading } = useUsers();
  const assignableUsers = getAssignableUsers('maintenance');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="dueDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <FormControl>
              <Input type="datetime-local" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="assignee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assignee</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none" disabled>Select assignee</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {!usersLoading && assignableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role.replace('_', ' ')})
                  </SelectItem>
                ))}
                {usersLoading && (
                  <SelectItem value="loading" disabled>Loading users...</SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MaintenanceSchedule;
