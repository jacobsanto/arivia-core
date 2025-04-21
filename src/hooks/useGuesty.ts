
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { guestyService, GuestyApiStatus } from '@/services/guesty/guesty.service';

export function useGuesty() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [apiStatus, setApiStatus] = useState<GuestyApiStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check Guesty API status
  const checkStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await guestyService.checkGuestyStatus();
      setApiStatus(status);
      return status;
    } catch (err) {
      setApiStatus({
        guesty_status: 'error',
        message: err instanceof Error ? err.message : 'Error checking API status'
      });
      return null;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const { 
    data: listings, 
    isLoading: listingsLoading,
    isError,
    error: queryError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['guesty-listings'],
    queryFn: () => guestyService.getGuestyListings(),
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      onError: (err: Error) => {
        setError(err);
      }
    }
  });

  // Determine error types
  const isRateLimited = queryError instanceof Error && 
    queryError.message && queryError.message.includes('Rate limit');
    
  const isAuthError = queryError instanceof Error && 
    queryError.message && queryError.message.includes('Authentication failed');
    
  const isServerError = queryError instanceof Error && 
    queryError.message && (
      queryError.message.includes('server') || 
      queryError.message.includes('experiencing issues')
    );

  // Extract retry time from error message
  const getRetryTime = (): number | null => {
    if (!queryError || !(queryError instanceof Error)) return null;
    
    const match = queryError.message.match(/try again in (\d+) seconds/);
    return match ? parseInt(match[1], 10) : null;
  };

  const refreshListings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First check API status
      const status = await checkStatus();
      
      // Only proceed if API is available
      if (status && status.guesty_status === 'available') {
        await refetch();
      } else {
        throw new Error(status?.message || 'Guesty API is currently unavailable');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh listings'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listings,
    isLoading: isLoading || listingsLoading || isFetching,
    error: error || (queryError as Error),
    isRateLimited,
    isAuthError,
    isServerError,
    apiStatus,
    isCheckingStatus,
    refreshListings,
    refetch,
    checkStatus,
    getRetryTime
  };
}
