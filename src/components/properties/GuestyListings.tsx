
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, MapPin, AlertTriangle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { guestyService } from '@/services/guesty/guesty.service';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export function GuestyListings() {
  // Use React Query with better error handling
  const { data, isLoading, error, refetch, isError } = useQuery({
    queryKey: ['guesty-listings'],
    queryFn: () => guestyService.getGuestyListings(),
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      onError: (error: Error) => {
        // Show toast for rate limit errors
        if (error.message && error.message.includes('Rate limit')) {
          const match = error.message.match(/try again in (\d+) seconds/);
          const waitTime = match ? match[1] : '60';
          
          toast.error('Guesty API Rate Limit', {
            description: `Too many requests. Please wait ${waitTime} seconds before trying again.`,
            duration: 5000,
          });
        }
      }
    },
  });

  const handleRefresh = () => {
    toast.promise(refetch(), {
      loading: 'Syncing Guesty listings...',
      success: 'Listings synchronized successfully',
      error: (err) => `Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    });
  };

  // Check if rate limited
  const isRateLimited = error instanceof Error && error.message && 
    error.message.includes('Rate limit');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Guesty Listings</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading || isRateLimited}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Listings
        </Button>
      </div>

      {isRateLimited && (
        <Alert variant="warning" className="bg-yellow-50 text-yellow-800 border-yellow-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rate Limit Reached</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {isError && !isRateLimited && (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading Guesty listings</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : data?.results?.length ? (
        <div className="grid gap-4">
          {data.results.map((listing) => (
            <Card key={listing._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{listing.title}</h3>
                    {listing.address?.full && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.address.full}</span>
                      </div>
                    )}
                  </div>
                  {listing.cleaningStatus?.value && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      listing.cleaningStatus.value === 'clean' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {listing.cleaningStatus.value}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isError ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No Guesty listings found
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
