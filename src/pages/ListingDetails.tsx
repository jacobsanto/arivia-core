
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { guestyService } from '@/services/guesty/guesty.service';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

const ListingDetails = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => listingId ? guestyService.getGuestyListing(listingId) : null,
    enabled: !!listingId,
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        <Card className="bg-destructive/10 text-destructive">
          <CardContent className="p-6">
            <p className="font-medium">Error loading listing details</p>
            <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Listing not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Properties
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{listing.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {listing.picture?.thumbnail && (
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img 
                src={listing.picture.thumbnail} 
                alt={listing.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Address</h3>
              <p className="mt-1">{listing.address?.full || 'No address provided'}</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Property Type</h3>
              <p className="mt-1">{listing.propertyType || 'Not specified'}</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 
                    listing.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {listing.status || 'Unknown'}
                </span>
              </div>
            </div>

            {/* If there's additional data in the raw_data field, we could display it here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingDetails;
