
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, MapPin, AlertTriangle, Wifi, WifiOff, Timer } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { guestyService } from '@/services/guesty/guesty.service';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useState, useEffect } from 'react';

export function GuestyListings() {
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Check API status initially
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const status = await guestyService.checkGuestyStatus();
        setApiStatus(status.guesty_status === 'available' ? 'online' : 'offline');
      } catch (error) {
        setApiStatus('offline');
      }
    };
    
    checkApiStatus();
    
    // Check status periodically if offline
    const interval = setInterval(() => {
      if (apiStatus === 'offline') {
        checkApiStatus();
      }
    }, 60000); // Check every minute if offline
    
    return () => clearInterval(interval);
  }, [apiStatus]);

  // Countdown timer for retry
  useEffect(() => {
    if (retryCountdown === null || retryCountdown <= 0) return;
    
    const timer = setInterval(() => {
      setRetryCountdown(prev => (prev !== null && prev > 0) ? prev - 1 : null);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [retryCountdown]);

  // Use React Query with better error handling
  const { data, isLoading, error, refetch, isError, isFetching } = useQuery({
    queryKey: ['guesty-listings'],
    queryFn: () => guestyService.getGuestyListings(),
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      onError: (error: Error) => {
        // Show toast for rate limit errors
        if (error.message && error.message.includes('Rate limit')) {
          const match = error.message.match(/try again in (\d+) seconds/);
          const waitTime = match ? parseInt(match[1], 10) : 60;
          
          setRetryCountdown(waitTime);
          
          toast.error('Guesty API Rate Limit', {
            description: `Too many requests. Please wait ${waitTime} seconds before trying again.`,
            duration: 5000,
          });
        } else if (error.message && error.message.includes('Authentication failed')) {
          toast.error('Guesty Authentication Error', {
            description: 'Please check your API credentials in the Supabase settings.',
            duration: 8000,
          });
        } else if (error.message && error.message.includes('server')) {
          toast.error('Guesty Server Error', {
            description: 'Guesty API is experiencing issues. Please try again later.',
            duration: 5000,
          });
          
          // Set a longer retry time for server errors
          setRetryCountdown(300);
        }
      }
    },
  });

  const handleRefresh = () => {
    // Reset API status to checking when manually refreshing
    setApiStatus('checking');
    
    // Check API status first
    guestyService.checkGuestyStatus().then(status => {
      setApiStatus(status.guesty_status === 'available' ? 'online' : 'offline');
      
      // Only proceed with listings fetch if API is available
      if (status.guesty_status === 'available') {
        toast.promise(refetch(), {
          loading: 'Syncing Guesty listings...',
          success: 'Listings synchronized successfully',
          error: (err) => `Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        });
      } else {
        toast.error('Guesty API Unavailable', {
          description: status.message || 'The Guesty API is currently unavailable. Please try again later.',
          duration: 5000
        });
      }
    }).catch(() => {
      setApiStatus('offline');
      toast.error('Connection Error', {
        description: 'Could not check Guesty API status. Please verify your internet connection.',
        duration: 5000
      });
    });
  };

  // Check if rate limited
  const isRateLimited = error instanceof Error && error.message && 
    error.message.includes('Rate limit');

  // Check if auth error
  const isAuthError = error instanceof Error && error.message && 
    error.message.includes('Authentication failed');
    
  // Check if server error
  const isServerError = error instanceof Error && error.message && 
    (error.message.includes('server') || error.message.includes('experiencing issues'));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Guesty Listings</h2>
          {apiStatus !== 'checking' && (
            apiStatus === 'online' ? 
              <div className="flex items-center text-xs text-green-600 gap-1">
                <Wifi className="h-3 w-3" />
                <span>API Online</span>
              </div> : 
              <div className="flex items-center text-xs text-amber-600 gap-1">
                <WifiOff className="h-3 w-3" />
                <span>API Offline</span>
              </div>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading || isFetching || retryCountdown !== null}
        >
          {retryCountdown !== null ? (
            <>
              <Timer className="h-4 w-4 mr-2" />
              Retry in {retryCountdown}s
            </>
          ) : (
            <>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading || isFetching ? 'animate-spin' : ''}`} />
              Sync Listings
            </>
          )}
        </Button>
      </div>

      {isRateLimited && (
        <Alert variant="warning" className="bg-yellow-50 text-yellow-800 border-yellow-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rate Limit Reached</AlertTitle>
          <AlertDescription>
            {error.message}
            {retryCountdown !== null && retryCountdown > 0 && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-yellow-100" 
                  disabled={true}
                >
                  <Timer className="h-3 w-3 mr-1" />
                  Auto-retry in {retryCountdown} seconds
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {isAuthError && (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            Please check your Guesty API credentials in the Supabase settings.
          </AlertDescription>
        </Alert>
      )}
      
      {isServerError && (
        <Alert variant="destructive" className="bg-orange-50 text-orange-800 border-orange-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Guesty Server Error</AlertTitle>
          <AlertDescription>
            {error.message}
            {retryCountdown !== null && retryCountdown > 0 && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-orange-100" 
                  disabled={true}
                >
                  <Timer className="h-3 w-3 mr-1" />
                  Auto-retry in {retryCountdown} seconds
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isError && !isRateLimited && !isAuthError && !isServerError && (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading Guesty listings</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading || isFetching ? (
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
