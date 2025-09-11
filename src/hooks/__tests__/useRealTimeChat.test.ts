import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRealTimeChat } from '../useRealTimeChat';
import { mockSupabaseClient } from '@/test/utils/testHelpers';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

// Mock user context
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    user: { id: 'test-user', name: 'Test User' }
  })
}));

describe('useRealTimeChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockReturnValue({ data: null, error: null })
    });
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useRealTimeChat());
    
    expect(result.current.chatListItems).toEqual([]);
    expect(result.current.activeMessages).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('loads initial data on mount', async () => {
    const { result } = renderHook(() => useRealTimeChat());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles item selection', async () => {
    const { result } = renderHook(() => useRealTimeChat());
    
    expect(typeof result.current.loadInitialData).toBe('function');
  });

  it('has send message functionality', async () => {
    const { result } = renderHook(() => useRealTimeChat());
    
    expect(typeof result.current.sendMessage).toBe('function');
  });
});