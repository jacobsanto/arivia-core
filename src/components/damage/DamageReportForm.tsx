
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useProperties } from "@/hooks/useProperties";
import { Calendar } from "@/components/ui/calendar";
import { FileUpload } from "@/components/ui/file-upload";

interface DamageReportFormValues {
  title: string;
  description: string;
  property_id: string;
  damage_date: Date;
  estimated_cost?: number;
  media: File[];
}

interface DamageReportFormProps {
  onSubmit: (data: DamageReportFormValues) => void;
  onCancel: () => void;
}

const DamageReportForm: React.FC<DamageReportFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm<DamageReportFormValues>();
  const { properties } = useProperties();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Brief description of the damage" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Provide detailed information about the damage" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="property_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property</FormLabel>
              <FormControl>
                <select {...field} className="w-full p-2 border rounded">
                  <option value="">Select a property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="damage_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Damage</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  className="rounded-md border"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimated_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Cost (if known)</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.01" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="media"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos/Videos</FormLabel>
              <FormControl>
                <FileUpload
                  onChange={(files) => field.onChange(Array.from(files))}
                  accept="image/*,video/*"
                  multiple
                />
              </FormControl>
              <FormDescription>
                Upload photos or videos of the damage
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Create Report
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DamageReportForm;
