
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const ListingDetails = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();

  // Query the listing details
  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ['guesty-listing', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('*')
        .eq('id', listingId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!listingId,
  });

  // Query the bookings for this listing
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['guesty-bookings', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guesty_bookings')
        .select('*')
        .eq('listing_id', listingId)
        .order('check_in', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!listingId,
  });

  if (listingLoading || bookingsLoading) {
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
          {listing.thumbnail_url && (
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img 
                src={listing.thumbnail_url} 
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
              <p className="mt-1">{listing.property_type || 'Not specified'}</p>
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
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bookings</h3>
            {bookings && bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.guest_name}</TableCell>
                        <TableCell>{new Date(booking.check_in).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(booking.check_out).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'canceled' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {booking.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">No bookings found for this property</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingDetails;
