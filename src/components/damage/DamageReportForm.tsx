import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { damageReportSchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useProperties } from "@/hooks/useProperties";
import { FileUpload } from "@/components/ui/file-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";

type DamageReportFormValues = z.infer<typeof damageReportSchema> & {
  media?: File[];
  assigned_to?: string;
};

interface DamageReportFormProps {
  onSubmit: (data: DamageReportFormValues) => void;
  onCancel: () => void;
}

const DamageReportForm: React.FC<DamageReportFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm<DamageReportFormValues>({
    resolver: zodResolver(damageReportSchema),
    defaultValues: {
      title: '',
      description: '',
      property_id: '',
      damage_date: '',
      status: 'pending',
      estimated_cost: undefined,
    }
  });
  const { properties } = useProperties();
  const { registeredUsers } = useUsers();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Brief description of the damage" maxLength={200} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description *</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Provide detailed information about the damage"
                  className="min-h-[100px]"
                  maxLength={2000}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="property_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || "select-property"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select-property" disabled>Select a property</SelectItem>
                      {properties.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Person to Resolve</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "select-person"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select person to resolve" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="select-person" disabled>Select a person</SelectItem>
                    {registeredUsers.map((user) => (
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
              <FormLabel>Date of Damage *</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimated_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Cost (€)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  step="0.01" 
                  min="0"
                  max="1000000"
                  placeholder="Enter estimated cost"
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
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
