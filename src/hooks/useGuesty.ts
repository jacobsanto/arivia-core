
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { guestyService } from '@/services/guesty/guesty.service';

export function useGuesty() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { 
    data: listings, 
    isLoading: listingsLoading,
    isError,
    error: queryError,
    refetch
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

  const isRateLimited = queryError instanceof Error && 
    queryError.message && queryError.message.includes('Rate limit');

  const refreshListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh listings'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listings,
    isLoading: isLoading || listingsLoading,
    error: error || (queryError as Error),
    isRateLimited,
    refreshListings,
    refetch
  };
}
