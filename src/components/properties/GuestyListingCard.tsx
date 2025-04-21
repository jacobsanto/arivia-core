
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface GuestyListingCardProps {
  listing: {
    id: string;
    title: string;
    address?: {
      full?: string;
    };
    status?: string;
    thumbnail_url?: string;
  };
}

const GuestyListingCard = ({ listing }: GuestyListingCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/properties/listings/${listing.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-slate-100 relative">
        {listing.thumbnail_url ? (
          <img
            src={listing.thumbnail_url}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No image available
          </div>
        )}
        {listing.status && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-white shadow-sm">
            {listing.status}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium mb-2 line-clamp-1">{listing.title}</h3>
        {listing.address?.full && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{listing.address.full}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <Button onClick={handleViewDetails} className="w-full" variant="outline">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GuestyListingCard;
