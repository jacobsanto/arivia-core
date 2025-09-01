import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OperationalSettingsFormValues } from "@/types/systemSettings.types";

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface OperationalSettingsProps {
  form: any;
}

const OperationalSettings: React.FC<OperationalSettingsProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Defaults</CardTitle>
        <CardDescription>
          Streamline daily workflows by setting sensible defaults and standards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="defaultTaskPriority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Task Priority</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {priorityOptions.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Pre-fills the Priority field when creating new tasks
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="standardTurnaroundTimeHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Standard Turnaround Time (hours)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={48} 
                    value={field.value} 
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormDescription>
                  Company standard for property turnovers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defaultTaskEstimatedDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Task Duration (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={15} 
                    max={480} 
                    value={field.value} 
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormDescription>
                  Default estimated duration for new tasks
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="archiveCompletedTasksDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Archive Completed Tasks After (days)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={365} 
                  value={field.value} 
                  onChange={(e) => field.onChange(Number(e.target.value))} 
                />
              </FormControl>
              <FormDescription>
                Automatically hide old completed tasks from main views
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoAssignTasks"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Auto-Assign Tasks</FormLabel>
                <FormDescription>
                  Automatically assign tasks based on availability and workload
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requireTaskPhotos"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Require Task Photos</FormLabel>
                <FormDescription>
                  Mandate photo uploads for task completion verification
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default OperationalSettings;