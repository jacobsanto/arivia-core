
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { MaintenanceFormValues } from '../schema';
import { TaskReminderField } from '../TaskReminderField';
import { renderWithForm, defaultValues } from './test-utils';

describe('TaskReminderField', () => {
  it('validates minimum hours', async () => {
    const onSubmit = vi.fn();
    renderWithForm(
      <TaskReminderField 
        form={useForm<MaintenanceFormValues>({
          defaultValues
        })} 
      />,
      onSubmit
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
    renderWithForm(
      <TaskReminderField 
        form={useForm<MaintenanceFormValues>({
          defaultValues
        })} 
      />
    );

    const input = screen.getByLabelText(/Task Reminder Hours/i);
    fireEvent.change(input, { target: { value: '73' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText(/Number must be less than or equal to 72/i)).toBeInTheDocument();
    });
  });
});
