import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface StandardFormProps<T = any> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  onCancel?: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  showCancelButton?: boolean;
  footerActions?: React.ReactNode;
}

export function StandardForm<T = any>({
  form,
  onSubmit,
  onCancel,
  children,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isLoading = false,
  isDisabled = false,
  className,
  showCancelButton = true,
  footerActions,
}: StandardFormProps<T>) {
  const handleSubmit = (data: T) => {
    if (!isLoading && !isDisabled) {
      onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className={cn("space-y-6", className)}
        aria-disabled={isLoading || isDisabled}
      >
        <fieldset disabled={isLoading || isDisabled} className="space-y-6">
          {children}
        </fieldset>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          {footerActions}
          
          {showCancelButton && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isLoading || isDisabled}
            aria-label={isLoading ? 'Submitting...' : submitLabel}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="xsmall" />
                Submitting...
              </div>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}