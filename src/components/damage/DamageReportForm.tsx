import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useProperties } from "@/hooks/useProperties";
import { FileUpload } from "@/components/ui/file-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";

interface DamageReportFormValues {
  title: string;
  description: string;
  property_id: string;
  damage_date: Date;
  estimated_cost?: number;
  media: File[];
  assigned_to: string;
}

interface DamageReportFormProps {
  onSubmit: (data: DamageReportFormValues) => void;
  onCancel: () => void;
}

const DamageReportForm: React.FC<DamageReportFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm<DamageReportFormValues>();
  const { properties } = useProperties();
  const { users } = useUser();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Textarea 
                  {...field} 
                  placeholder="Provide detailed information about the damage"
                  className="min-h-[100px]"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="property_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <FormControl>
                  <select {...field} className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background">
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
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Person to Resolve</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select person to resolve" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="damage_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Damage</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                  value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
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
                <Input {...field} type="number" step="0.01" placeholder="Enter estimated cost" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Damage Photos</p>
          <FileUpload
            onChange={(files) => {
              const filesArray = Array.from(files);
              form.setValue('media', filesArray);
            }}
            accept="image/*,video/*"
            multiple
          />
          <p className="text-xs text-muted-foreground">
            Upload photos or videos of the damage (optional)
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Report</Button>
        </div>
      </form>
    </Form>
  );
};

export default DamageReportForm;
