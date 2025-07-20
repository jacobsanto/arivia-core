import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  threshold?: number;
  placeholder?: React.ReactNode;
}

export const LazyImage: React.FC<LazyImageProps> = React.memo(({
  src,
  alt,
  className,
  fallback = '/placeholder.svg',
  loading = 'lazy',
  threshold = 0.1,
  placeholder
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (imageRef && loading === 'lazy') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold }
      );
      
      observer.observe(imageRef);
    } else if (imageRef && loading === 'eager') {
      setImageSrc(src);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src, loading, threshold]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    if (fallback) {
      setImageSrc(fallback);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={setImageRef}
        src={imageSrc || undefined}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        loading={loading}
      />
      
      {isLoading && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          {placeholder}
        </div>
      )}
      
      {isLoading && !placeholder && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';