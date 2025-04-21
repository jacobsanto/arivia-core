
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../schema";

interface StatusAndDetailsFieldsProps {
  form: UseFormReturn<PropertyFormValues>;
}

const StatusAndDetailsFields = ({ form }: StatusAndDetailsFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "select-status"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="select-status" disabled>Select status</SelectItem>
                <SelectItem value="Vacant">Vacant</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bedrooms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bedrooms</FormLabel>
            <FormControl>
              <Input type="number" min="1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bathrooms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bathrooms</FormLabel>
            <FormControl>
              <Input type="number" min="1" step="0.5" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default StatusAndDetailsFields;
