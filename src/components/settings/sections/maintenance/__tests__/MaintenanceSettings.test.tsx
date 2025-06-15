
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { vi } from 'vitest';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaintenanceFormValues, maintenanceSchema } from '../schema';
import { TaskReminderField } from '../TaskReminderField';
import { PriorityField } from '../PriorityField';
import { EmailField } from '../EmailField';
import { TaskSwitches } from '../TaskSwitches';

const defaultValues: MaintenanceFormValues = {
  taskReminderHours: 24,
  defaultTaskPriority: "normal",
  autoAssignTasks: false,
  enableRecurringTasks: false,
  maintenanceEmail: "",
};

const FormWrapper: React.FC<{
  children: React.ReactNode;
  onSubmit?: (data: MaintenanceFormValues) => void;
}> = ({ children, onSubmit = vi.fn() }) => {
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

describe('MaintenanceSettings Form Components', () => {
  describe('TaskReminderField', () => {
    it('validates minimum hours', async () => {
      const onSubmit = vi.fn();
      render(
        <FormWrapper onSubmit={onSubmit}>
          <TaskReminderField form={useForm<MaintenanceFormValues>({
            resolver: zodResolver(maintenanceSchema),
            defaultValues,
          })} />
          <button type="submit">Submit</button>
        </FormWrapper>
      );

      const input = screen.getByLabelText(/Task Reminder Hours/i);
      fireEvent.change(input, { target: { value: '0' } });
      fireEvent.blur(input);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Number must be greater than or equal to 1/i)).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('validates maximum hours', async () => {
      render(
        <FormWrapper>
          <TaskReminderField form={useForm<MaintenanceFormValues>({
            resolver: zodResolver(maintenanceSchema),
            defaultValues,
          })} />
        </FormWrapper>
      );

      const input = screen.getByLabelText(/Task Reminder Hours/i);
      fireEvent.change(input, { target: { value: '73' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Number must be less than or equal to 72/i)).toBeInTheDocument();
      });
    });
  });

  describe('EmailField', () => {
    it('validates email format', async () => {
      render(
        <FormWrapper>
          <EmailField form={useForm<MaintenanceFormValues>({
            resolver: zodResolver(maintenanceSchema),
            defaultValues,
          })} />
        </FormWrapper>
      );

      const input = screen.getByLabelText(/Maintenance Notification Email/i);
      fireEvent.change(input, { target: { value: 'invalid-email' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Must be a valid email address/i)).toBeInTheDocument();
      });
    });

    it('allows empty email', async () => {
      const onSubmit = vi.fn();
      render(
        <FormWrapper onSubmit={onSubmit}>
          <EmailField form={useForm<MaintenanceFormValues>({
            resolver: zodResolver(maintenanceSchema),
            defaultValues,
          })} />
          <button type="submit">Submit</button>
        </FormWrapper>
      );

      const input = screen.getByLabelText(/Maintenance Notification Email/i);
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('TaskSwitches', () => {
    it('toggles auto-assign tasks switch', async () => {
      const onSubmit = vi.fn();
      render(
        <FormWrapper onSubmit={onSubmit}>
          <TaskSwitches form={useForm<MaintenanceFormValues>({
            resolver: zodResolver(maintenanceSchema),
            defaultValues,
          })} />
          <button type="submit">Submit</button>
        </FormWrapper>
      );

      const autoAssignSwitch = screen.getByLabelText(/Auto-Assign Tasks/i);
      fireEvent.click(autoAssignSwitch);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ autoAssignTasks: true }),
          expect.anything()
        );
      });
    });

    it('toggles recurring tasks switch', async () => {
      const onSubmit = vi.fn();
      render(
        <FormWrapper onSubmit={onSubmit}>
          <TaskSwitches form={useForm<MaintenanceFormValues>({
            resolver: zodResolver(maintenanceSchema),
            defaultValues,
          })} />
          <button type="submit">Submit</button>
        </FormWrapper>
      );

      const recurringTasksSwitch = screen.getByLabelText(/Recurring Tasks/i);
      fireEvent.click(recurringTasksSwitch);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ enableRecurringTasks: true }),
          expect.anything()
        );
      });
    });
  });

  describe('PriorityField', () => {
    it('selects different priority values', async () => {
      const onSubmit = vi.fn();
      render(
        <FormWrapper onSubmit={onSubmit}>
          <PriorityField form={useForm<MaintenanceFormValues>({
            resolver: zodResolver(maintenanceSchema),
            defaultValues,
          })} />
          <button type="submit">Submit</button>
        </FormWrapper>
      );

      const select = screen.getByLabelText(/Default Task Priority/i);
      fireEvent.click(select);
      
      const highOption = screen.getByText('High');
      fireEvent.click(highOption);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ defaultTaskPriority: 'high' }),
          expect.anything()
        );
      });
    });
  });
});
