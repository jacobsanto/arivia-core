
import React from "react";
import { useGuesty } from "@/hooks/useGuesty";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Home, Map, BedDouble } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GuestyListingDB } from "@/services/guesty/guesty.service";

const GuestyPropertyList: React.FC = () => {
  const { listings, isLoading, error, refreshListings } = useGuesty();
  const properties = listings || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Guesty Properties</h3>
        <Button variant="outline" size="sm" onClick={refreshListings} disabled={isLoading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 text-red-700">
          <p className="font-medium">Error loading properties</p>
          <p className="text-sm">{error.message || 'Unknown error occurred'}</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      )}

      {!isLoading && properties.length === 0 && !error && (
        <div className="text-center py-8 border rounded-md">
          <Home className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
          <p className="mt-2 text-muted-foreground">No properties found</p>
        </div>
      )}

      <div className="grid gap-4">
        {properties.map((property: GuestyListingDB) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex">
                <div className="h-32 w-32 bg-slate-100 flex items-center justify-center">
                  {property.thumbnail_url ? (
                    <img 
                      src={property.thumbnail_url} 
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Home className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="p-4 flex-1">
                  <h4 className="font-medium truncate">{property.title}</h4>
                  
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {property.address?.full && (
                      <div className="flex items-center gap-1">
                        <Map className="h-3.5 w-3.5" />
                        <span className="truncate">{property.address.full}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" />
                      <span>
                        {property.status && `Status: ${property.status}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GuestyPropertyList;
