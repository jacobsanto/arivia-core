// CDN Asset Optimization Utilities
export class CDNManager {
  private static instance: CDNManager;
  private cdnBaseUrl = 'https://cdn.arivia.com'; // Replace with actual CDN URL
  private assetCache = new Map<string, string>();

  private constructor() {}

  static getInstance(): CDNManager {
    if (!CDNManager.instance) {
      CDNManager.instance = new CDNManager();
    }
    return CDNManager.instance;
  }

  // Optimize image URLs for CDN delivery
  optimizeImageUrl(originalUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
  } = {}): string {
    if (!originalUrl || originalUrl.startsWith('data:')) {
      return originalUrl;
    }

    const cacheKey = `${originalUrl}_${JSON.stringify(options)}`;
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey)!;
    }

    // If already a CDN URL, return as is
    if (originalUrl.includes(this.cdnBaseUrl)) {
      return originalUrl;
    }

    // Build optimized CDN URL
    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.fit) params.set('fit', options.fit);

    const optimizedUrl = `${this.cdnBaseUrl}/img/${encodeURIComponent(originalUrl)}?${params.toString()}`;
    
    this.assetCache.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }

  // Preload critical assets
  preloadAssets(urls: string[]) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = this.getAssetType(url);
      document.head.appendChild(link);
    });
  }

  // Get optimized CSS delivery
  loadCriticalCSS(cssPath: string) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = `${this.cdnBaseUrl}/css/${cssPath}`;
    link.as = 'style';
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }

  // Lazy load non-critical CSS
  loadNonCriticalCSS(cssPath: string) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${this.cdnBaseUrl}/css/${cssPath}`;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  }

  private getAssetType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'avif':
        return 'image';
      case 'css':
        return 'style';
      case 'js':
        return 'script';
      case 'woff':
      case 'woff2':
        return 'font';
      default:
        return 'fetch';
    }
  }

  // Clear cache when needed
  clearCache() {
    this.assetCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cacheSize: this.assetCache.size,
      cacheKeys: Array.from(this.assetCache.keys())
    };
  }
}

// Server-side caching strategies
export class ServerCache {
  private static cache = new Map<string, { data: any; expiry: number }>();

  static set(key: string, data: any, ttlMs: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  static get(key: string) {
    const cached = this.cache.get(key);
    if (!cached || cached.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  static invalidate(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  static getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Utility functions
export function generateCacheKey(endpoint: string, params: Record<string, any> = {}) {
  return `${endpoint}_${JSON.stringify(params)}`;
}

export function isStale(timestamp: number, ttlMs: number = 300000) {
  return Date.now() - timestamp > ttlMs;
}