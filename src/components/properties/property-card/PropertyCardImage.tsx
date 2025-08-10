
import React, { useState } from "react";
import { UnifiedProperty } from "@/types/property.types";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Utility to extract srcset/sizes for responsive images
function getImageSources(property: UnifiedProperty) {
  // Try to get both high-res and thumbnail from property.raw_data, fallback to main fields if not present
  const rawPicture = property.raw_data?.picture || {};
  const thumbnail = rawPicture.thumbnail || property.imageUrl;
  const large = rawPicture.large || property.raw_data?.imageUrl || null;
  const original = rawPicture.original || null;
  const fallback = '/placeholder.svg';

  // Choose best for src, and prepare srcSet for progressive/responsive loading
  const src = original || large || property.imageUrl || thumbnail || fallback;
  let srcSet = '';
  if (original) srcSet = `${thumbnail} 400w, ${large || original} 800w, ${original} 1200w`;
  else if (large) srcSet = `${thumbnail} 400w, ${large} 800w`;
  else srcSet = `${thumbnail} 400w`;

  return {
    src,
    srcSet,
    sizes: "(max-width: 768px) 100vw, 50vw", // prefer full on mobile, 50vw for desktop
    fallback,
    thumbnail
  };
}

interface PropertyCardImageProps {
  property: UnifiedProperty;
}

export const PropertyCardImage = ({ property }: PropertyCardImageProps) => {
  const [imgError, setImgError] = useState(false);
  const { src, srcSet, sizes, fallback, thumbnail } = getImageSources(property);

  return (
    <div className="relative overflow-hidden">
      <AspectRatio ratio={16/9} className="bg-slate-100">
        <img
          src={imgError ? fallback : thumbnail}
          srcSet={!imgError ? srcSet : undefined}
          sizes={!imgError ? sizes : undefined}
          data-highres={src}
          loading="lazy"
          alt={property.name}
          className="w-full h-full object-cover hover-scale transition-transform duration-300"
          onError={() => setImgError(true)}
          onLoad={e => {
            // Progressive: as soon as high-res loads, switch src
            if (e.currentTarget.src !== src && !imgError) {
              const highImg = new window.Image();
              highImg.onload = () => {
                if (!imgError) e.currentTarget.src = src;
              };
              highImg.src = src;
            }
          }}
          style={{ background: "#f1f1f1" }}
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
