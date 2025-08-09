
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useProperties } from "@/hooks/useProperties";
import { FileUpload } from "@/components/ui/file-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";

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

// Validation schema for Damage Report
const damageReportSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Please add a short description').optional(),
  property_id: z.string().min(1, 'Select a property'),
  damage_date: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date({ required_error: 'Select date' })),
  estimated_cost: z.preprocess((val) => {
    if (val === '' || val === null || typeof val === 'undefined') return undefined;
    const num = typeof val === 'string' ? Number(val) : val as number;
    return isNaN(Number(num)) ? undefined : Number(num);
  }, z.number().nonnegative().optional()),
  media: z.any().array().optional(),
  assigned_to: z.string().optional()
});

const DamageReportForm: React.FC<DamageReportFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm<DamageReportFormValues>({
    resolver: zodResolver(damageReportSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      property_id: '',
      damage_date: new Date(),
      estimated_cost: undefined,
      media: [],
      assigned_to: ''
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Brief description of the damage" />
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
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
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select person to resolve" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
              <FormLabel>Date of Damage</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
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
              <FormLabel>Estimated Cost (if known)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter estimated cost"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Damage Photos</p>
          <FileUpload
            onChange={(files) => {
              const filesArray = Array.from(files);
              form.setValue('media', filesArray, { shouldValidate: true });
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
          <Button type="submit" disabled={!form.formState.isValid}>Create Report</Button>
        </div>
      </form>
    </Form>
  );
};

export default DamageReportForm;
