import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface StandardFormFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox';
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export function StandardFormField<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = 'text',
  options = [],
  required = false,
  disabled = false,
  className,
  inputProps,
  textareaProps,
}: StandardFormFieldProps<T>) {
  const fieldId = `field-${String(name)}`;
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("space-y-2", className)}>
          {label && (
            <FormLabel 
              htmlFor={fieldId}
              className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}
            >
              {label}
            </FormLabel>
          )}
          
          <FormControl>
            {type === 'textarea' ? (
              <Textarea
                id={fieldId}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={!!fieldState.error}
                aria-describedby={description ? `${fieldId}-description` : undefined}
                {...field}
                {...textareaProps}
              />
            ) : type === 'select' ? (
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={disabled}
              >
                <SelectTrigger 
                  id={fieldId}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={description ? `${fieldId}-description` : undefined}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={fieldId}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={description ? `${fieldId}-description` : undefined}
                />
                {label && (
                  <label
                    htmlFor={fieldId}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {label}
                  </label>
                )}
              </div>
            ) : (
              <Input
                id={fieldId}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={!!fieldState.error}
                aria-describedby={description ? `${fieldId}-description` : undefined}
                {...field}
                {...inputProps}
              />
            )}
          </FormControl>
          
          {description && (
            <FormDescription id={`${fieldId}-description`}>
              {description}
            </FormDescription>
          )}
          
          <FormMessage role="alert" />
        </FormItem>
      )}
    />
  );
}