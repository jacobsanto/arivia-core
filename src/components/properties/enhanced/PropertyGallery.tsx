import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyImage } from "@/types/property-detailed.types";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Image as ImageIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PropertyGalleryProps {
  images: PropertyImage[];
  propertyName: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  images,
  propertyName
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const heroImage = images.find(img => img.is_hero) || images[0];
  const thumbnailImages = images.slice(0, 6); // Show max 6 thumbnails

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  if (!images || images.length === 0) {
    return (
      <Card className="h-96">
        <CardContent className="h-full flex items-center justify-center bg-muted">
          <div className="text-center space-y-2">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="text-lg font-medium text-muted-foreground">
              No images available
            </div>
            <div className="text-sm text-muted-foreground">
              Images for {propertyName} will appear here
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card className="overflow-hidden">
        <div className="relative h-96 group">
          <img
            src={currentImage?.url || '/placeholder.svg'}
            alt={currentImage?.title || propertyName}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Fullscreen Button */}
          <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl w-full h-full max-h-[90vh]">
              <div className="relative h-full flex items-center justify-center">
                <img
                  src={currentImage?.url || '/placeholder.svg'}
                  alt={currentImage?.title || propertyName}
                  className="max-w-full max-h-full object-contain"
                />
                
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Image Title */}
          {currentImage?.title && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentImage.title}
            </div>
          )}
        </div>
      </Card>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {thumbnailImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative h-16 rounded overflow-hidden transition-all ${
                selectedImageIndex === index 
                  ? 'ring-2 ring-primary shadow-md' 
                  : 'hover:ring-1 hover:ring-muted-foreground/50'
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              {image.is_hero && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="text-white text-xs font-medium bg-black/50 px-1 rounded">
                    Main
                  </div>
                </div>
              )}
            </button>
          ))}
          
          {/* Show More Button */}
          {images.length > 6 && (
            <button
              onClick={() => setIsFullscreenOpen(true)}
              className="h-16 rounded border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 flex items-center justify-center text-muted-foreground text-xs transition-colors"
            >
              +{images.length - 6} more
            </button>
          )}
        </div>
      )}
    </div>
  );
};