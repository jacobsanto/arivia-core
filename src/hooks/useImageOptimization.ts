import { useState, useEffect, useCallback, useRef } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: string;
}

// Hook for optimized image loading
export const useOptimizedImage = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  const {
    quality = 85,
    format = 'webp',
    lazy = true,
    placeholder = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f0f0f0%22/%3E%3C/svg%3E'
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized image URL
  const getOptimizedUrl = useCallback((originalSrc: string) => {
    if (!originalSrc || originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // For Supabase storage URLs, add optimization parameters
    if (originalSrc.includes('supabase.co/storage')) {
      const url = new URL(originalSrc);
      const params = new URLSearchParams();
      
      if (options.width) params.set('width', options.width.toString());
      if (options.height) params.set('height', options.height.toString());
      params.set('quality', quality.toString());
      params.set('format', format);
      
      url.search = params.toString();
      return url.toString();
    }

    // For other URLs, return as-is (external CDNs handle their own optimization)
    return originalSrc;
  }, [quality, format, options.width, options.height]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy || !imgRef.current) {
      const optimized = getOptimizedUrl(src);
      loadImage(optimized);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const optimized = getOptimizedUrl(src);
            loadImage(optimized);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, lazy, getOptimizedUrl]);

  const loadImage = (imageSrc: string) => {
    const img = new Image();
    
    img.onload = () => {
      setOptimizedSrc(imageSrc);
      setIsLoaded(true);
      setIsError(false);
    };
    
    img.onerror = () => {
      setIsError(true);
      setIsLoaded(false);
      // Fallback to original src if optimization fails
      if (imageSrc !== src) {
        loadImage(src);
      }
    };
    
    img.src = imageSrc;
  };

  return {
    src: optimizedSrc,
    isLoaded,
    isError,
    imgRef
  };
};

// Hook for responsive images
export const useResponsiveImage = (
  srcSet: { [key: string]: string },
  defaultSrc: string,
  options: ImageOptimizationOptions = {}
) => {
  const [currentSrc, setCurrentSrc] = useState(defaultSrc);

  useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth;
      
      // Define breakpoints
      const breakpoints = [
        { max: 640, key: 'sm' },
        { max: 768, key: 'md' },
        { max: 1024, key: 'lg' },
        { max: 1280, key: 'xl' },
        { max: Infinity, key: '2xl' }
      ];

      for (const breakpoint of breakpoints) {
        if (width <= breakpoint.max && srcSet[breakpoint.key]) {
          setCurrentSrc(srcSet[breakpoint.key]);
          break;
        }
      }
    };

    updateImageSrc();
    window.addEventListener('resize', updateImageSrc);
    
    return () => window.removeEventListener('resize', updateImageSrc);
  }, [srcSet]);

  return useOptimizedImage(currentSrc, options);
};

// Modern image format detection
export const useModernImageFormat = () => {
  const [supportedFormats, setSupportedFormats] = useState<{
    webp: boolean;
    avif: boolean;
  }>({
    webp: false,
    avif: false
  });

  useEffect(() => {
    const checkWebP = () => {
      return new Promise<boolean>((resolve) => {
        const webp = new Image();
        webp.onload = webp.onerror = () => {
          resolve(webp.height === 2);
        };
        webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });
    };

    const checkAVIF = () => {
      return new Promise<boolean>((resolve) => {
        const avif = new Image();
        avif.onload = avif.onerror = () => {
          resolve(avif.height === 2);
        };
        avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
      });
    };

    Promise.all([checkWebP(), checkAVIF()]).then(([webp, avif]) => {
      setSupportedFormats({ webp, avif });
    });
  }, []);

  const getBestFormat = useCallback((fallback: string = 'jpg') => {
    if (supportedFormats.avif) return 'avif';
    if (supportedFormats.webp) return 'webp';
    return fallback;
  }, [supportedFormats]);

  return {
    supportedFormats,
    getBestFormat
  };
};

// Image preloader hook
export const useImagePreloader = () => {
  const preloadedImages = useRef(new Set<string>());

  const preloadImage = useCallback((src: string, priority: boolean = false) => {
    if (preloadedImages.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        preloadedImages.current.add(src);
        resolve();
      };
      
      img.onerror = reject;
      
      // Set priority for above-the-fold images
      if (priority) {
        img.fetchPriority = 'high';
      }
      
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (srcs: string[], options?: {
    concurrent?: number;
    priority?: boolean;
  }) => {
    const { concurrent = 3, priority = false } = options || {};
    
    const chunks = [];
    for (let i = 0; i < srcs.length; i += concurrent) {
      chunks.push(srcs.slice(i, i + concurrent));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(src => preloadImage(src, priority))
      );
    }
  }, [preloadImage]);

  return {
    preloadImage,
    preloadImages,
    isPreloaded: (src: string) => preloadedImages.current.has(src)
  };
};

// Progressive image loading component hook
export const useProgressiveImage = (
  lowQualitySrc: string,
  highQualitySrc: string,
  options: ImageOptimizationOptions = {}
) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  const { isLoaded, isError, imgRef } = useOptimizedImage(highQualitySrc, options);

  useEffect(() => {
    if (isLoaded && !isError) {
      setCurrentSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
    }
  }, [isLoaded, isError, highQualitySrc]);

  return {
    src: currentSrc,
    isHighQualityLoaded,
    isError,
    imgRef
  };
};