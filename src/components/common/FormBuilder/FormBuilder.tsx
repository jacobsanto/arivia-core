import React from "react";
import { useForm, Controller, FieldValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime-local';

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FormField {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: FieldOption[];
  validation?: z.ZodTypeAny;
  disabled?: boolean;
  className?: string;
  defaultValue?: any;
  conditionalRender?: (values: any) => boolean;
}

export interface FormBuilderProps<T extends FieldValues = FieldValues> {
  fields: FormField[];
  onSubmit: (data: T) => void | Promise<void>;
  defaultValues?: Partial<T>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  schema?: z.ZodSchema<T>;
}

export const FormBuilder = <T extends FieldValues = FieldValues>({
  fields,
  onSubmit,
  defaultValues,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  loading = false,
  className,
  schema,
}: FormBuilderProps<T>) => {
  // Generate schema from fields if not provided
  const formSchema = schema || z.object(
    fields.reduce((acc, field) => {
      let fieldSchema: any = z.string();
      
      // Apply type-specific validation
      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email("Invalid email address");
          break;
        case 'number':
          fieldSchema = z.number().or(z.string().transform(Number));
          break;
        case 'url':
          fieldSchema = z.string().url("Invalid URL");
          break;
        case 'checkbox':
        case 'switch':
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.string();
      }

      // Apply required validation
      if (field.required) {
        if (field.type === 'checkbox' || field.type === 'switch') {
          fieldSchema = fieldSchema.refine((val: any) => val === true, {
            message: `${field.label} is required`,
          });
        } else {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
        }
      } else {
        fieldSchema = fieldSchema.optional();
      }

      // Apply custom validation if provided
      if (field.validation) {
        fieldSchema = field.validation;
      }

      acc[field.name] = fieldSchema;
      return acc;
    }, {} as Record<string, any>)
  ) as any;

  const form = useForm<T>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as any,
  });

  const watchedValues = form.watch();

  const renderField = (field: FormField) => {
    // Check conditional rendering
    if (field.conditionalRender && !field.conditionalRender(watchedValues)) {
      return null;
    }

    const fieldName = field.name as Path<T>;

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={fieldName}
        render={({ field: formField }) => (
          <FormItem className={field.className}>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {(() => {
                switch (field.type) {
                  case 'textarea':
                    return (
                      <Textarea
                        {...formField}
                        placeholder={field.placeholder}
                        disabled={field.disabled || loading}
                      />
                    );

                  case 'select':
                    return (
                      <Select 
                        onValueChange={formField.onChange} 
                        defaultValue={formField.value}
                        disabled={field.disabled || loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem 
                              key={String(option.value)} 
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );

                  case 'radio':
                    return (
                      <RadioGroup
                        onValueChange={formField.onChange}
                        defaultValue={formField.value}
                        disabled={field.disabled || loading}
                      >
                        {field.options?.map((option) => (
                          <div key={String(option.value)} className="flex items-center space-x-2">
                            <RadioGroupItem value={String(option.value)} id={`${field.name}-${option.value}`} />
                            <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    );

                  case 'checkbox':
                    return (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                          disabled={field.disabled || loading}
                        />
                        <Label>{field.description}</Label>
                      </div>
                    );

                  case 'switch':
                    return (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                          disabled={field.disabled || loading}
                        />
                        <Label>{field.description}</Label>
                      </div>
                    );

                  default:
                    return (
                      <Input
                        {...formField}
                        type={field.type}
                        placeholder={field.placeholder}
                        disabled={field.disabled || loading}
                      />
                    );
                }
              })()}
            </FormControl>
            {field.description && field.type !== 'checkbox' && field.type !== 'switch' && (
              <FormDescription>{field.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className={cn("space-y-6", className)}
      >
        {fields.map(renderField)}
        
        <div className="flex items-center gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="min-w-24"
          >
            {loading ? "Loading..." : submitLabel}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

// Example usage and helper functions
export const createFormField = (config: FormField): FormField => config;

export const createTextField = (name: string, label: string, options?: Partial<FormField>): FormField => ({
  name,
  label,
  type: 'text',
  ...options,
});

export const createSelectField = (name: string, label: string, options: FieldOption[], config?: Partial<FormField>): FormField => ({
  name,
  label,
  type: 'select',
  options,
  ...config,
});

export const createCheckboxField = (name: string, label: string, description?: string, config?: Partial<FormField>): FormField => ({
  name,
  label,
  type: 'checkbox',
  description,
  ...config,
});