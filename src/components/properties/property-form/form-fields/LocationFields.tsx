
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../schema";

interface LocationFieldsProps {
  form: UseFormReturn<PropertyFormValues>;
}

const LocationFields = ({ form }: LocationFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Address</FormLabel>
            <FormControl>
              <Input placeholder="Complete address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Santorini, Greece">Santorini, Greece</SelectItem>
                <SelectItem value="Athens, Greece">Athens, Greece</SelectItem>
                <SelectItem value="Mykonos, Greece">Mykonos, Greece</SelectItem>
                <SelectItem value="Crete, Greece">Crete, Greece</SelectItem>
                <SelectItem value="Rhodes, Greece">Rhodes, Greece</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default LocationFields;
