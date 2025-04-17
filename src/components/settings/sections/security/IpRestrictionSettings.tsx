
import React from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { SecurityFormValues } from "./types";

interface IpRestrictionSettingsProps {
  form: UseFormReturn<SecurityFormValues>;
}

const IpRestrictionSettings: React.FC<IpRestrictionSettingsProps> = ({ form }) => {
  const watchIpRestriction = form.watch("ipRestriction");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="ipRestriction"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">IP Address Restriction</FormLabel>
              <FormDescription>
                Limit access to specific IP addresses
              </FormDescription>
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
      
      {watchIpRestriction && (
        <FormField
          control={form.control}
          name="allowedIPs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed IP Addresses</FormLabel>
              <FormControl>
                <Input placeholder="192.168.1.1, 10.0.0.1" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                Comma-separated list of allowed IP addresses
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default IpRestrictionSettings;
