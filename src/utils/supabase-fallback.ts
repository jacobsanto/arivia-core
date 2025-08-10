// Temporary fallback utility for Supabase operations when database structure is incomplete
// This prevents TypeScript errors while the database is being set up

import { supabase } from '@/integrations/supabase/client';

// Cast supabase to any to bypass TypeScript checks for non-existent tables/functions
export const supabaseFallback = supabase as any;

// Helper function to safely execute Supabase operations with fallbacks
export const safeDatabaseOperation = async (
  operation: () => Promise<any>,
  fallbackValue: any = null,
  errorMessage: string = 'Database operation not available'
) => {
  try {
    return await operation();
  } catch (error) {
    console.warn(errorMessage, error);
    return { data: fallbackValue, error: new Error(errorMessage) };
  }
};

// Mock data generators for development
export const mockUsers = () => [];
export const mockSecurityEvents = () => [];
export const mockSystemHealth = () => ({
  database: { tables_count: 4, active_connections: 12, rls_enabled_tables: 4 },
  authentication: { total_users: 0, active_sessions: 0 },
  integrations: { guesty_listings: 0, guesty_bookings: 0, last_sync: new Date().toISOString() },
  performance: { avg_query_time: 45, slow_queries_count: 0 }
});