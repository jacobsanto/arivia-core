// API Response compression and optimization utilities

export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
  cached?: boolean;
  timestamp?: number;
}

// Compression utilities for large responses
export const compressResponse = async (data: any): Promise<string> => {
  if (typeof CompressionStream !== 'undefined') {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    
    writer.write(encoder.encode(jsonString));
    writer.close();
    
    const chunks: Uint8Array[] = [];
    let done = false;
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }
    
    const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }
    
    return btoa(String.fromCharCode(...compressed));
  }
  
  // Fallback: just stringify
  return JSON.stringify(data);
};

export const decompressResponse = async (compressedData: string): Promise<any> => {
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const compressed = Uint8Array.from(atob(compressedData), c => c.charCodeAt(0));
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(compressed);
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decompressed);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decompression failed:', error);
      return JSON.parse(compressedData);
    }
  }
  
  // Fallback: just parse
  return JSON.parse(compressedData);
};

// Response caching with compression
class ApiCache {
  private cache = new Map<string, {
    data: string;
    timestamp: number;
    ttl: number;
    compressed: boolean;
  }>();
  
  private maxSize = 50; // Maximum cache entries
  
  async set(key: string, data: any, ttl: number = 300000): Promise<void> {
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    let compressed = false;
    let serializedData = JSON.stringify(data);
    
    // Compress large responses (>10KB)
    if (serializedData.length > 10240) {
      try {
        serializedData = await compressResponse(data);
        compressed = true;
      } catch (error) {
        console.warn('Compression failed, storing uncompressed:', error);
      }
    }
    
    this.cache.set(key, {
      data: serializedData,
      timestamp: Date.now(),
      ttl,
      compressed
    });
  }
  
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    try {
      if (entry.compressed) {
        return await decompressResponse(entry.data);
      } else {
        return JSON.parse(entry.data);
      }
    } catch (error) {
      console.error('Cache retrieval failed:', error);
      this.cache.delete(key);
      return null;
    }
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
  
  getStats() {
    let totalSize = 0;
    let compressedCount = 0;
    
    this.cache.forEach(entry => {
      totalSize += entry.data.length;
      if (entry.compressed) compressedCount++;
    });
    
    return {
      entryCount: this.cache.size,
      totalSize,
      compressedCount,
      averageSize: this.cache.size > 0 ? totalSize / this.cache.size : 0
    };
  }
}

export const apiCache = new ApiCache();

// Request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  
  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }
    
    // Create new request
    const request = requestFn().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, request);
    return request;
  }
  
  clear(): void {
    this.pendingRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Optimized fetch wrapper
export const optimizedFetch = async <T>(
  url: string,
  options: RequestInit & {
    cacheKey?: string;
    cacheTTL?: number;
    compress?: boolean;
  } = {}
): Promise<ApiResponse<T>> => {
  const { cacheKey, cacheTTL = 300000, compress = true, ...fetchOptions } = options;
  
  // Try cache first
  if (cacheKey && apiCache.has(cacheKey)) {
    const cachedData = await apiCache.get(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        cached: true,
        timestamp: Date.now()
      };
    }
  }
  
  // Deduplicate requests
  const requestKey = `${url}-${JSON.stringify(fetchOptions)}`;
  
  const response = await requestDeduplicator.deduplicate(requestKey, async () => {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Cache the response
    if (cacheKey) {
      await apiCache.set(cacheKey, data, cacheTTL);
    }
    
    return data;
  });
  
  return {
    data: response,
    cached: false,
    timestamp: Date.now()
  };
};

// Performance monitoring for API calls
class ApiPerformanceMonitor {
  private metrics = new Map<string, {
    count: number;
    totalTime: number;
    maxTime: number;
    minTime: number;
    errors: number;
  }>();
  
  startRequest(endpoint: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(endpoint, duration, false);
    };
  }
  
  recordError(endpoint: string): void {
    this.recordMetric(endpoint, 0, true);
  }
  
  private recordMetric(endpoint: string, duration: number, isError: boolean): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, {
        count: 0,
        totalTime: 0,
        maxTime: 0,
        minTime: Infinity,
        errors: 0
      });
    }
    
    const metric = this.metrics.get(endpoint)!;
    metric.count++;
    
    if (isError) {
      metric.errors++;
    } else {
      metric.totalTime += duration;
      metric.maxTime = Math.max(metric.maxTime, duration);
      metric.minTime = Math.min(metric.minTime, duration);
    }
  }
  
  getMetrics() {
    const results: Array<{
      endpoint: string;
      averageTime: number;
      maxTime: number;
      minTime: number;
      count: number;
      errors: number;
      errorRate: number;
    }> = [];
    
    this.metrics.forEach((metric, endpoint) => {
      results.push({
        endpoint,
        averageTime: metric.count > 0 ? metric.totalTime / metric.count : 0,
        maxTime: metric.maxTime,
        minTime: metric.minTime === Infinity ? 0 : metric.minTime,
        count: metric.count,
        errors: metric.errors,
        errorRate: metric.count > 0 ? (metric.errors / metric.count) * 100 : 0
      });
    });
    
    return results.sort((a, b) => b.averageTime - a.averageTime);
  }
  
  reset(): void {
    this.metrics.clear();
  }
}

export const apiPerformanceMonitor = new ApiPerformanceMonitor();