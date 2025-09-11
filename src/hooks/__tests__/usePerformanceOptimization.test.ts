import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useThrottle } from '../usePerformanceOptimization';

describe('Performance Optimization Hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebounce', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 },
        }
      );

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'updated', delay: 500 });
      expect(result.current).toBe('initial'); // Should still be initial

      // Fast forward time but not enough
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe('initial');

      // Fast forward past delay
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe('updated');
    });

    it('should cancel previous timeout on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'first' });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      rerender({ value: 'second' });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('second');
    });
  });

  describe('useThrottle', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useThrottle('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('should throttle value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, limit }) => useThrottle(value, limit),
        {
          initialProps: { value: 'initial', limit: 500 },
        }
      );

      expect(result.current).toBe('initial');

      // Change value - should update immediately on first change
      rerender({ value: 'first', limit: 500 });
      expect(result.current).toBe('first');

      // Change value again quickly - should be throttled
      rerender({ value: 'second', limit: 500 });
      expect(result.current).toBe('first'); // Still first due to throttling

      // Fast forward past throttle limit
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Change value again - should update now
      rerender({ value: 'third', limit: 500 });
      expect(result.current).toBe('third');
    });

    it('should handle rapid changes correctly', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 100),
        {
          initialProps: { value: 'initial' },
        }
      );

      // First change should go through
      rerender({ value: 'change1' });
      expect(result.current).toBe('change1');

      // Rapid changes should be throttled
      rerender({ value: 'change2' });
      rerender({ value: 'change3' });
      rerender({ value: 'change4' });
      
      expect(result.current).toBe('change1');

      // After throttle period, next change should go through
      act(() => {
        vi.advanceTimersByTime(150);
      });

      rerender({ value: 'change5' });
      expect(result.current).toBe('change5');
    });
  });
});