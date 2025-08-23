/**
 * Centralized API hook with error handling and loading states
 */
import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse, ApiOptions } from '@/services/core/api-client';
import { handleError } from '@/services/core/error-handler';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  mutate: (operation: () => Promise<any>) => Promise<boolean>;
}

export function useApi<T>(
  queryFn: () => Promise<any>,
  options: ApiOptions & { 
    immediate?: boolean;
    dependencies?: any[];
    errorContext?: { component: string; action: string };
  } = {}
): UseApiState<T> {
  const { immediate = true, dependencies = [], errorContext, ...apiOptions } = options;
  
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: immediate,
    error: null
  });
  
  const executeQuery = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.query<T>('', queryFn(), apiOptions);
      
      setState({
        data: result.data,
        loading: false,
        error: result.error
      });
      
      if (result.error && errorContext) {
        handleError(result.error, errorContext);
      }
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message
      });
      
      if (errorContext) {
        handleError(error, errorContext);
      }
    }
  }, [queryFn, errorContext, ...dependencies]);
  
  const mutate = useCallback(async (operation: () => Promise<any>): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.mutate<T>(operation, apiOptions);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        if (errorContext) {
          handleError(result.error, { ...errorContext, action: 'mutate' });
        }
        return false;
      }
      
      // Refresh data after successful mutation
      await executeQuery();
      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      if (errorContext) {
        handleError(error, { ...errorContext, action: 'mutate' });
      }
      return false;
    }
  }, [executeQuery, errorContext]);
  
  useEffect(() => {
    if (immediate) {
      executeQuery();
    }
  }, dependencies);
  
  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refresh: executeQuery,
    mutate
  };
}

// Specialized hooks for common patterns
export function useQuery<T>(
  queryFn: () => Promise<any>,
  options?: Parameters<typeof useApi>[1]
) {
  return useApi<T>(queryFn, options);
}

export function useMutation<T>(
  mutationFn: () => Promise<any>,
  options?: Omit<Parameters<typeof useApi>[1], 'immediate'>
) {
  const { mutate, loading, error } = useApi<T>(
    mutationFn,
    { ...options, immediate: false }
  );
  
  return {
    mutate: (operation?: () => Promise<any>) => 
      mutate(operation || mutationFn),
    loading,
    error
  };
}