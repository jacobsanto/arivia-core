
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { guestyService } from '@/services/guesty/guesty.service';

export function useGuesty() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['guesty-listings'],
    queryFn: () => guestyService.getGuestyListings(),
    retry: 1,
  });

  const refreshListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await guestyService.getGuestyListings();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh listings'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listings,
    isLoading: isLoading || listingsLoading,
    error,
    refreshListings,
  };
}
