
import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaintenanceFormValues, maintenanceSchema } from '../schema';

const defaultValues: MaintenanceFormValues = {
  taskReminderHours: 24,
  defaultTaskPriority: "normal",
  autoAssignTasks: false,
  enableRecurringTasks: false,
  maintenanceEmail: "",
};

interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit?: (data: MaintenanceFormValues) => void;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({ 
  children, 
  onSubmit = vi.fn() 
}) => {
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {children}
      </form>
    </Form>
  );
};

export const renderWithForm = (ui: React.ReactElement, onSubmit = vi.fn()) => {
  return render(
    <FormWrapper onSubmit={onSubmit}>
      {ui}
    </FormWrapper>
  );
};

export { defaultValues };
