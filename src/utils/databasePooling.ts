import { supabase } from '@/integrations/supabase/client';

export class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool;
  private connections: Map<string, any> = new Map();
  private connectionCount = 0;
  private maxConnections = 10;
  private connectionTimeout = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool.instance;
  }

  async getConnection(key: string = 'default') {
    if (this.connections.has(key)) {
      return this.connections.get(key);
    }

    if (this.connectionCount >= this.maxConnections) {
      // Wait for available connection or timeout
      await this.waitForConnection();
    }

    const connection = supabase;
    this.connections.set(key, connection);
    this.connectionCount++;

    // Auto-release after timeout
    setTimeout(() => {
      this.releaseConnection(key);
    }, this.connectionTimeout);

    return connection;
  }

  releaseConnection(key: string) {
    if (this.connections.has(key)) {
      this.connections.delete(key);
      this.connectionCount--;
    }
  }

  private async waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.connectionCount < this.maxConnections) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  getPoolStats() {
    return {
      activeConnections: this.connectionCount,
      maxConnections: this.maxConnections,
      availableConnections: this.maxConnections - this.connectionCount
    };
  }
}

// Optimized query execution with connection pooling
export async function executeOptimizedQuery(
  query: string,
  options: {
    cached?: boolean;
    cacheKey?: string;
    timeout?: number;
  } = {}
) {
  const pool = DatabaseConnectionPool.getInstance();
  const connection = await pool.getConnection();

  try {
    // Add query performance monitoring
    const startTime = performance.now();
    
    const { data, error } = await connection.rpc('execute_query', {
      query_text: query
    });

    const executionTime = performance.now() - startTime;

    // Log performance metrics
    if (executionTime > 1000) {
      console.warn(`Slow query detected: ${executionTime}ms`, query);
    }

    // Cache result if requested
    if (options.cached && options.cacheKey) {
      localStorage.setItem(`query_cache_${options.cacheKey}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl: 300000 // 5 minutes
      }));
    }

    return { data, error, executionTime };
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}

// Batch query execution for better performance
export async function executeBatchQueries(queries: { query: string; key: string }[]) {
  const pool = DatabaseConnectionPool.getInstance();
  const connection = await pool.getConnection();

  const results = await Promise.all(
    queries.map(async ({ query, key }) => {
      try {
        const startTime = performance.now();
        const { data, error } = await connection.rpc('execute_query', {
          query_text: query
        });
        const executionTime = performance.now() - startTime;

        return { key, data, error, executionTime };
      } catch (error) {
        return { key, data: null, error, executionTime: 0 };
      }
    })
  );

  return results;
}