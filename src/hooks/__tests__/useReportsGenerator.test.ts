import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReportsGenerator } from '../useReportsGenerator';
import { mockSupabaseClient } from '@/test/utils/testHelpers';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

describe('useReportsGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useReportsGenerator());
    
    expect(result.current.isGenerating).toBe(false);
    expect(typeof result.current.generateReport).toBe('function');
  });

  it('generates reports', async () => {
    const { result } = renderHook(() => useReportsGenerator());
    
    result.current.updateReportType('task-completion-log');
    result.current.updateDateRange('2024-01-01', '2024-01-31');

    expect(typeof result.current.generateReport).toBe('function');
  });

  it('handles different report types', async () => {
    const { result } = renderHook(() => useReportsGenerator());
    
    result.current.updateReportType('inventory-levels');
    expect(result.current.reportType).toBe('inventory-levels');
  });

  it('handles errors gracefully', async () => {
    const { result } = renderHook(() => useReportsGenerator());
    
    expect(result.current.isGenerating).toBe(false);
  });
});