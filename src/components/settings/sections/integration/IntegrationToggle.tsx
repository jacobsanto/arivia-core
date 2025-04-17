
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { IntegrationSettingsFormValues } from "./types";

interface IntegrationToggleProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
  name: keyof IntegrationSettingsFormValues;
  label: string;
  description: string;
}

const IntegrationToggle: React.FC<IntegrationToggleProps> = ({
  form,
  name,
  label,
  description,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="text-base font-medium">{label}</div>
            <FormDescription>{description}</FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default IntegrationToggle;
