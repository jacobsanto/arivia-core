
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PropertyCardImageProps {
  property: UnifiedProperty;
}

export const PropertyCardImage = ({ property }: PropertyCardImageProps) => {
  return (
    <div className="relative overflow-hidden">
      <AspectRatio ratio={16/9} className="bg-slate-100">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {property.source === 'guesty' && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
            Guesty
          </div>
        )}
      </AspectRatio>
    </div>
  );
};
