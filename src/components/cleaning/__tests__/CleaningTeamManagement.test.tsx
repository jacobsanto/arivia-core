import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CleaningTeamManagement } from '../CleaningTeamManagement';
import { mockSupabaseClient } from '@/test/utils/testHelpers';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

// Mock user context
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    user: { id: 'test-user', role: 'super_admin' }
  })
}));

describe('CleaningTeamManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@test.com',
            role: 'housekeeper',
            avatar: '/avatar.jpg',
            phone: '+1234567890'
          }
        ],
        error: null
      }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
    });
  });

  it('renders team management interface', async () => {
    render(<CleaningTeamManagement />);
    
    expect(screen.getByText('Team Management')).toBeInTheDocument();
    expect(screen.getByText('Manage housekeeping team members')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('displays team member cards', async () => {
    render(<CleaningTeamManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('Housekeeper')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<CleaningTeamManagement />);
    
    expect(screen.getByText('Loading team members...')).toBeInTheDocument();
  });
});