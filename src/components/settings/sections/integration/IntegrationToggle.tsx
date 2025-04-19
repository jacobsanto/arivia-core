
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { IntegrationSettingsFormValues } from "./types";

interface IntegrationToggleProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
  name: keyof IntegrationSettingsFormValues;
  label: string;
  description: string;
  showConfirmation?: boolean;
  onBeforeToggle?: (newValue: boolean) => Promise<boolean> | boolean;
}

const IntegrationToggle: React.FC<IntegrationToggleProps> = ({
  form,
  name,
  label,
  description,
  showConfirmation = false,
  onBeforeToggle
}) => {
  const [isToggling, setIsToggling] = React.useState(false);

  const handleToggle = async (checked: boolean) => {
    if (isToggling) return;

    setIsToggling(true);
    try {
      if (onBeforeToggle) {
        const shouldProceed = await onBeforeToggle(checked);
        if (!shouldProceed) {
          setIsToggling(false);
          return;
        }
      }
      form.setValue(name, checked);
    } finally {
      setIsToggling(false);
    }
  };

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
            {isToggling ? (
              <LoadingSpinner size="small" />
            ) : (
              <Switch
                checked={field.value}
                onCheckedChange={handleToggle}
                disabled={isToggling}
              />
            )}
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default IntegrationToggle;
