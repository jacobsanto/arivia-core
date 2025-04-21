
import React, { useState } from "react";
import { useGuesty } from "@/hooks/useGuesty";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Home, Map, BedDouble, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GuestyListing } from "@/services/guesty/guesty.service";

const GuestyPropertyList: React.FC = () => {
  const { listings, isLoading, error, refreshListings } = useGuesty();
  const properties = listings?.results || [];
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});

  const nextImage = (propertyId: string, imagesArray: string[]) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] + 1) % imagesArray.length
    }));
  };

  const prevImage = (propertyId: string, imagesArray: string[]) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] - 1 + imagesArray.length) % imagesArray.length
    }));
  };

  // Initialize active image index when properties load
  React.useEffect(() => {
    if (properties.length > 0) {
      const initialIndices: Record<string, number> = {};
      properties.forEach(property => {
        initialIndices[property._id] = 0;
      });
      setActiveImageIndex(initialIndices);
    }
  }, [properties]);

  // Build an array of all available images for a property
  const getPropertyImages = (property: GuestyListing): string[] => {
    const images: string[] = [];
    
    if (property.picture?.large) images.push(property.picture.large);
    else if (property.picture?.regular) images.push(property.picture.regular);
    else if (property.picture?.thumbnail) images.push(property.picture.thumbnail);
    
    // Additional images if available in the API
    if (property.pictures && Array.isArray(property.pictures)) {
      property.pictures.forEach(pic => {
        if (pic.large) images.push(pic.large);
        else if (pic.regular) images.push(pic.regular);
        else if (pic.thumbnail) images.push(pic.thumbnail);
      });
    }
    
    return images;
  };

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
          <Skeleton className="h-48 w-full rounded-md" />
          <Skeleton className="h-48 w-full rounded-md" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
      )}

      {!isLoading && properties.length === 0 && !error && (
        <div className="text-center py-8 border rounded-md">
          <Home className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
          <p className="mt-2 text-muted-foreground">No properties found</p>
        </div>
      )}

      <div className="grid gap-4">
        {properties.map((property: GuestyListing) => {
          const images = getPropertyImages(property);
          const currentImageIndex = activeImageIndex[property._id] || 0;
          const currentImage = images.length > 0 ? images[currentImageIndex] : null;
          
          return (
            <Card key={property._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="h-64 md:h-48 md:w-48 relative">
                    {currentImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={currentImage} 
                          alt={`${property.title} - Photo ${currentImageIndex + 1}`}
                          className="h-full w-full object-cover"
                        />
                        
                        {images.length > 1 && (
                          <div className="absolute inset-0 flex justify-between items-center px-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
                              onClick={() => prevImage(property._id, images)}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
                              onClick={() => nextImage(property._id, images)}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {images.length > 1 && (
                          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                            {images.map((_, idx) => (
                              <span 
                                key={idx}
                                className={`block h-1.5 w-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                        <Home className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1">
                    <h4 className="text-lg font-medium truncate">{property.title}</h4>
                    
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {property.address?.full && (
                        <div className="flex items-center gap-2">
                          <Map className="h-4 w-4" />
                          <span className="truncate">{property.address.full}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        <span>
                          {property.status && `Status: ${property.status}`}
                        </span>
                      </div>
                      
                      {images.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Photo {currentImageIndex + 1} of {images.length}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GuestyPropertyList;
