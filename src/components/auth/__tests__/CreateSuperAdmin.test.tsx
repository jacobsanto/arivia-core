import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateSuperAdmin from '../CreateSuperAdmin';
import { mockSupabaseClient, mockToast } from '@/test/utils/testHelpers';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: mockToast
}));

describe('CreateSuperAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders super admin creation form', () => {
    render(<CreateSuperAdmin />);
    
    expect(screen.getByText('Create Super Admin')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create super admin/i })).toBeInTheDocument();
  });

  it('validates form fields', async () => {
    render(<CreateSuperAdmin />);
    
    const submitButton = screen.getByRole('button', { name: /create super admin/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('creates super admin successfully', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: 'test-id' } },
      error: null
    });

    render(<CreateSuperAdmin />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create super admin/i }));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Super admin created successfully!');
    });
  });

  it('handles creation errors', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'Email already exists' }
    });

    render(<CreateSuperAdmin />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create super admin/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Email already exists');
    });
  });
});